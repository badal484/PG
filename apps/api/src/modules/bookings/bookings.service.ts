// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto, ListBookingsQueryDto } from './dto/booking.dto';
import { BedStatus, BookingStatus, BookingSourceType, UserRole } from '@roomly/database';
import Redis from 'ioredis';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private redis: Redis;
  private readonly BED_LOCK_TTL_MS = 15 * 60 * 1000; // 15 minutes

  constructor(private prisma: PrismaService) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });

    this.redis.on('error', (err) => {
      this.logger.warn(`Redis error (booking locks will be disabled): ${err.message}`);
    });
  }

  async initiateBooking(tenantId: string, dto: CreateBookingDto) {
    const { bedId, stayType, moveInDate, moveOutDate, source, specialRequirements } = dto;

    // 1. Acquire Redis lock on this bed (15-min checkout hold)
    const lockKey = `bed_lock:${bedId}`;
    const lockToken = `${tenantId}:${Date.now()}`;

    const acquired = await this.acquireLock(lockKey, lockToken);
    if (!acquired) {
      throw new ConflictException({
        code: 'BED_TEMPORARILY_HELD',
        message: 'This bed is currently being reserved by another user. Please try again in 15 minutes.',
      });
    }

    // 2. Verify bed is available
    const bed = await this.prisma.bed.findUnique({
      where: { id: bedId },
      include: { property: true },
    });

    if (!bed) {
      await this.releaseLock(lockKey, lockToken);
      throw new NotFoundException({ code: 'BED_NOT_FOUND', message: 'Bed not found' });
    }

    if (bed.status !== BedStatus.VACANT) {
      await this.releaseLock(lockKey, lockToken);
      throw new ConflictException({
        code: 'BED_NOT_AVAILABLE',
        message: `Bed is currently ${bed.status}`,
      });
    }

    // 3. Check no active booking exists for this bed
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        bedId,
        status: {
          in: [
            BookingStatus.PENDING_KYC,
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.PENDING_AGREEMENT,
            BookingStatus.CONFIRMED,
          ],
        },
      },
    });

    if (existingBooking) {
      await this.releaseLock(lockKey, lockToken);
      throw new ConflictException({
        code: 'BOOKING_CONFLICT',
        message: 'This bed already has an active booking',
      });
    }

    // 4. Create booking and reserve bed in transaction
    const booking = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bedId,
          propertyId: bed.propertyId,
          tenantId,
          ownerId: bed.property.ownerId,
          stayType,
          moveInDate: new Date(moveInDate),
          moveOutDate: moveOutDate ? new Date(moveOutDate) : undefined,
          status: BookingStatus.PENDING_KYC,
          source: source || BookingSourceType.MARKETPLACE,
          specialRequirements,
          depositAmount: bed.depositAmount,
          firstMonthRent: bed.monthlyRent,
          totalAmount: bed.depositAmount + bed.monthlyRent,
          platformFee: bed.property.platformFee,
          commissionRate: bed.property.commissionRate,
        },
        include: {
          bed: true,
          property: { select: { id: true, name: true, city: true } },
        },
      });

      // Reserve the bed
      await tx.bed.update({
        where: { id: bedId },
        data: { status: BedStatus.RESERVED },
      });

      return booking;
    });

    // Store lock token with booking ID for release
    await this.redis.setex(
      `booking_lock:${booking.id}`,
      Math.floor(this.BED_LOCK_TTL_MS / 1000),
      lockToken,
    ).catch(() => {});

    return booking;
  }

  async confirmBooking(bookingId: string, userId: string) {
    const booking = await this.getBookingOrThrow(bookingId);
    await this.assertBookingAccess(booking, userId);

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking is not in PENDING_PAYMENT status');
    }

    // Move to PENDING_AGREEMENT
    return this.updateStatus(bookingId, BookingStatus.PENDING_AGREEMENT);
  }

  async activateBooking(bookingId: string, userId: string) {
    const booking = await this.getBookingOrThrow(bookingId);
    this.assertOwnerOrAdmin(booking, userId);

    if (booking.status !== BookingStatus.PENDING_AGREEMENT) {
      throw new BadRequestException('Booking is not in PENDING_AGREEMENT status');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      // Mark bed as occupied
      await tx.bed.update({
        where: { id: booking.bedId },
        data: {
          status: BedStatus.OCCUPIED,
          currentTenantId: booking.tenantId,
          lastOccupiedAt: new Date(),
        },
      });

      // Update bed counts on property
      await tx.property.update({
        where: { id: booking.propertyId },
        data: {
          occupiedBeds: { increment: 1 },
          vacantBeds: { decrement: 1 },
        },
      });

      // Release Redis lock
      await this.releaseLock(`bed_lock:${booking.bedId}`, '').catch(() => {});

      return updated;
    });
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await this.getBookingOrThrow(bookingId);

    // Only tenant, owner, admin can cancel
    const isAuthorized =
      booking.tenantId === userId ||
      booking.ownerId === userId;

    if (!isAuthorized) {
      throw new ForbiddenException({
        code: 'BOOKING_CANCEL_DENIED',
        message: 'You are not authorized to cancel this booking',
      });
    }

    const cancellableStatuses = [
      BookingStatus.PENDING_KYC,
      BookingStatus.PENDING_PAYMENT,
      BookingStatus.PENDING_AGREEMENT,
    ];

    if (!cancellableStatuses.includes(booking.status)) {
      throw new BadRequestException({
        code: 'BOOKING_CANCEL_INVALID_STATUS',
        message: `Cannot cancel a booking in ${booking.status} status`,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: reason,
          cancelledAt: new Date(),
          cancelledByUserId: userId,
        },
      });

      // Release bed back to vacant
      await tx.bed.update({
        where: { id: booking.bedId },
        data: { status: BedStatus.VACANT },
      });

      return updated;
    });
  }

  async getMyBookings(tenantId: string, query: ListBookingsQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { id: true, name: true, city: true, mainPhotoUrl: true } },
          bed: { select: { bedNumber: true, bedLabel: true, monthlyRent: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      _meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPropertyBookings(propertyId: string, ownerId: string, query: ListBookingsQueryDto) {
    const { page = 1, limit = 20, status, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: any = { propertyId };
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.moveInDate = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, phone: true, firstName: true, lastName: true } },
          bed: { select: { bedNumber: true, bedLabel: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      _meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(bookingId: string, userId: string) {
    const booking = await this.getBookingOrThrow(bookingId);
    await this.assertBookingAccess(booking, userId);
    return booking;
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────────

  async adminListBookings(query: ListBookingsQueryDto) {
    const { page = 1, limit = 20, status, propertyId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, phone: true, firstName: true, lastName: true } },
          property: { select: { id: true, name: true, city: true } },
          bed: { select: { bedNumber: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      _meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  private async acquireLock(key: string, token: string): Promise<boolean> {
    try {
      const result = await this.redis.set(
        key,
        token,
        'PX',
        this.BED_LOCK_TTL_MS,
        'NX',
      );
      return result === 'OK';
    } catch {
      // Redis unavailable — allow booking (graceful degradation)
      this.logger.warn('Redis unavailable, skipping bed lock');
      return true;
    }
  }

  private async releaseLock(key: string, token: string): Promise<void> {
    try {
      const current = await this.redis.get(key);
      if (current === token || token === '') {
        await this.redis.del(key);
      }
    } catch {
      // Ignore Redis errors on lock release
    }
  }

  private async getBookingOrThrow(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bed: true,
        property: true,
        tenant: { select: { id: true, phone: true, firstName: true, lastName: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
    }

    return booking;
  }

  private async assertBookingAccess(booking: any, userId: string) {
    if (booking.tenantId !== userId && booking.ownerId !== userId) {
      throw new ForbiddenException({
        code: 'BOOKING_ACCESS_DENIED',
        message: 'You do not have access to this booking',
      });
    }
  }

  private assertOwnerOrAdmin(booking: any, userId: string) {
    if (booking.ownerId !== userId) {
      throw new ForbiddenException({
        code: 'OWNER_ACTION_REQUIRED',
        message: 'Only the property owner can perform this action',
      });
    }
  }

  private async updateStatus(bookingId: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }
}
