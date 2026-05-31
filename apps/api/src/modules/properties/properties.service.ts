// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  CreateFloorDto,
  CreateRoomDto,
  CreateBedDto,
  UpdateBedDto,
  SearchPropertiesDto,
  AddPhotoDto,
} from './dto/property.dto';
import { UserRole, VerificationStatus, PropertyTier } from '@roomly/database';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  // ─── Create ──────────────────────────────────────────────────────────────────

  async create(ownerId: string, dto: CreatePropertyDto) {
    const slug = this.generateSlug(dto.name, dto.city);

    // Ensure owner profile exists
    await this.prisma.ownerProfile.upsert({
      where: { userId: ownerId },
      create: { userId: ownerId },
      update: {},
    });

    return this.prisma.property.create({
      data: {
        ...dto,
        ownerId,
        slug,
        verificationStatus: VerificationStatus.PENDING,
        tier: PropertyTier.PENDING,
      },
    });
  }

  // ─── Read / Search ────────────────────────────────────────────────────────────

  async findAll(query: SearchPropertiesDto) {
    const { page = 1, limit = 20, sortBy, minRent, maxRent, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      isListed: true,
      verificationStatus: VerificationStatus.VERIFIED,
    };

    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.pincode) where.pincode = filters.pincode;
    if (filters.genderPolicy) where.genderPolicy = filters.genderPolicy;
    if (filters.propertyStyle) where.propertyStyle = filters.propertyStyle;
    if (filters.audienceTarget) where.audienceTarget = filters.audienceTarget;
    if (filters.hasFood !== undefined) where.hasFood = filters.hasFood;
    if (filters.hasGym !== undefined) where.hasGym = filters.hasGym;
    if (filters.hasAC !== undefined) where.hasAC = filters.hasAC;
    if (filters.hasWifi !== undefined) where.hasWifi = filters.hasWifi;
    if (filters.tier) where.tier = filters.tier;

    // Filter by min/max rent (via beds)
    if (minRent || maxRent) {
      where.beds = {
        some: {
          status: 'VACANT',
          isListedOnMarketplace: true,
          ...(minRent && { monthlyRent: { gte: minRent } }),
          ...(maxRent && { monthlyRent: { lte: maxRent } }),
        },
      };
    }

    const orderBy: any = sortBy === 'price_asc'
      ? { vacantBeds: 'desc' }
      : sortBy === 'newest'
      ? { createdAt: 'desc' }
      : { createdAt: 'desc' };

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          photos: { where: { isHero: true }, take: 1 },
          beds: {
            where: { status: 'VACANT', isListedOnMarketplace: true },
            select: { monthlyRent: true, depositAmount: true },
            take: 1,
            orderBy: { monthlyRent: 'asc' },
          },
          reviews: {
            select: { overallRating: true },
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    const result = properties.map((p) => ({
      ...p,
      startingRent: p.beds[0]?.monthlyRent ?? null,
      avgRating:
        p.reviews.length > 0
          ? p.reviews.reduce((s: number, r: any) => s + r.overallRating, 0) / p.reviews.length
          : null,
      reviewCount: p.reviews.length,
    }));

    return {
      data: result,
      _meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(idOrSlug: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        photos: { orderBy: { displayOrder: 'asc' } },
        tours360: { where: { isActive: true } },
        floors: {
          include: {
            rooms: {
              include: {
                beds: {
                  select: {
                    id: true,
                    bedNumber: true,
                    bedLabel: true,
                    status: true,
                    monthlyRent: true,
                    depositAmount: true,
                    isListedOnMarketplace: true,
                    availableFrom: true,
                  },
                },
              },
            },
          },
        },
        reviews: {
          include: { tenant: { select: { firstName: true, lastName: true, profilePhoto: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        foodMenus: true,
        staff: {
          where: { isActive: true },
          select: { id: true, role: true, userId: true },
        },
      },
    });

    if (!property) {
      throw new NotFoundException({ code: 'PROPERTY_NOT_FOUND', message: 'Property not found' });
    }

    return property;
  }

  async findAvailableBeds(slug: string, query: any) {
    const property = await this.prisma.property.findFirst({
      where: { OR: [{ id: slug }, { slug }], isActive: true },
      select: { id: true },
    });
    if (!property) {
      throw new NotFoundException({ code: 'PROPERTY_NOT_FOUND', message: 'Property not found' });
    }

    return this.prisma.room.findMany({
      where: {
        propertyId: property.id,
        beds: {
          some: {
            status: 'VACANT',
            isListedOnMarketplace: true,
            ...(query.maxRent ? { monthlyRent: { lte: Number(query.maxRent) } } : {}),
            ...(query.availableFrom ? { availableFrom: { lte: new Date(query.availableFrom) } } : {}),
          },
        },
        ...(query.sharingType ? { sharingType: query.sharingType } : {}),
      },
      include: {
        beds: {
          where: {
            status: 'VACANT',
            isListedOnMarketplace: true,
            ...(query.maxRent ? { monthlyRent: { lte: Number(query.maxRent) } } : {}),
          },
        },
      },
    });
  }

  async findBookings(propertyId: string) {
    return this.prisma.booking.findMany({
      where: { propertyId },
      include: { tenant: true, bed: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOwnerProperties(ownerId: string) {
    return this.prisma.property.findMany({
      where: { ownerId, isActive: true },
      include: {
        photos: { where: { isHero: true }, take: 1 },
        beds: { select: { status: true } },
        _count: { select: { bookings: true, complaints: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────────

  async update(propertyId: string, ownerId: string, dto: UpdatePropertyDto) {
    await this.checkOwnership(propertyId, ownerId);
    return this.prisma.property.update({
      where: { id: propertyId },
      data: dto,
    });
  }

  async toggleListing(propertyId: string, ownerId: string) {
    const property = await this.checkOwnership(propertyId, ownerId);
    return this.prisma.property.update({
      where: { id: propertyId },
      data: { isListed: !property.isListed },
      select: { id: true, isListed: true },
    });
  }

  async delete(propertyId: string, ownerId: string) {
    await this.checkOwnership(propertyId, ownerId);
    return this.prisma.property.update({
      where: { id: propertyId },
      data: { isActive: false, isListed: false },
    });
  }

  // ─── Floors ───────────────────────────────────────────────────────────────────

  async createFloor(propertyId: string, ownerId: string, dto: CreateFloorDto) {
    await this.checkOwnership(propertyId, ownerId);
    return this.prisma.floor.create({
      data: { propertyId, ...dto },
    });
  }

  async deleteFloor(propertyId: string, floorId: string, ownerId: string) {
    await this.checkOwnership(propertyId, ownerId);
    const floor = await this.prisma.floor.findFirst({ where: { id: floorId, propertyId } });
    if (!floor) throw new NotFoundException('Floor not found');
    return this.prisma.floor.delete({ where: { id: floorId } });
  }

  // ─── Rooms ────────────────────────────────────────────────────────────────────

  async createRoom(propertyId: string, floorId: string, ownerId: string, dto: CreateRoomDto) {
    await this.checkOwnership(propertyId, ownerId);
    const floor = await this.prisma.floor.findFirst({ where: { id: floorId, propertyId } });
    if (!floor) throw new NotFoundException('Floor not found');

    return this.prisma.room.create({
      data: { floorId, propertyId, ...dto },
    });
  }

  async deleteRoom(propertyId: string, roomId: string, ownerId: string) {
    await this.checkOwnership(propertyId, ownerId);
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    // Check no occupied beds
    const occupiedBeds = await this.prisma.bed.count({
      where: { roomId, status: 'OCCUPIED' },
    });
    if (occupiedBeds > 0) {
      throw new ConflictException('Cannot delete room with occupied beds');
    }

    return this.prisma.room.delete({ where: { id: roomId } });
  }

  // ─── Beds ─────────────────────────────────────────────────────────────────────

  async createBed(propertyId: string, roomId: string, ownerId: string, dto: CreateBedDto) {
    await this.checkOwnership(propertyId, ownerId);
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    const bed = await this.prisma.bed.create({
      data: { roomId, propertyId, ...dto },
    });

    // Update bed count on property
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        totalBeds: { increment: 1 },
        vacantBeds: { increment: 1 },
      },
    });

    return bed;
  }

  async updateBed(propertyId: string, bedId: string, ownerId: string, dto: UpdateBedDto) {
    await this.checkOwnership(propertyId, ownerId);
    const bed = await this.prisma.bed.findFirst({ where: { id: bedId, propertyId } });
    if (!bed) throw new NotFoundException('Bed not found');

    return this.prisma.bed.update({ where: { id: bedId }, data: dto });
  }

  async deleteBed(propertyId: string, bedId: string, ownerId: string) {
    await this.checkOwnership(propertyId, ownerId);
    const bed = await this.prisma.bed.findFirst({ where: { id: bedId, propertyId } });
    if (!bed) throw new NotFoundException('Bed not found');

    if (bed.status === 'OCCUPIED') {
      throw new ConflictException('Cannot delete an occupied bed');
    }

    await this.prisma.bed.delete({ where: { id: bedId } });
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        totalBeds: { decrement: 1 },
        vacantBeds: bed.status === 'VACANT' ? { decrement: 1 } : undefined,
      },
    });

    return { message: 'Bed deleted successfully' };
  }

  // ─── Photos ───────────────────────────────────────────────────────────────────

  async addPhoto(propertyId: string, ownerId: string, dto: AddPhotoDto) {
    await this.checkOwnership(propertyId, ownerId);

    // If this is a hero photo, clear others
    if (dto.isHero) {
      await this.prisma.propertyPhoto.updateMany({
        where: { propertyId },
        data: { isHero: false },
      });
    }

    return this.prisma.propertyPhoto.create({
      data: { propertyId, capturedByUserId: ownerId, ...dto },
    });
  }

  async deletePhoto(propertyId: string, photoId: string, ownerId: string) {
    await this.checkOwnership(propertyId, ownerId);
    const photo = await this.prisma.propertyPhoto.findFirst({ where: { id: photoId, propertyId } });
    if (!photo) throw new NotFoundException('Photo not found');
    return this.prisma.propertyPhoto.delete({ where: { id: photoId } });
  }

  // ─── Admin Actions ────────────────────────────────────────────────────────────

  async verifyProperty(propertyId: string, adminId: string, tier: PropertyTier) {
    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        tier,
        verifiedByUserId: adminId,
        verifiedAt: new Date(),
        isListed: true,
      },
    });
  }

  async rejectProperty(propertyId: string, reason: string) {
    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        isListed: false,
      },
    });
  }

  async getPendingVerifications() {
    return this.prisma.property.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: {
        owner: { select: { id: true, phone: true, firstName: true, lastName: true } },
        photos: { take: 5 },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async checkOwnership(propertyId: string, userId: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        OR: [
          { ownerId: userId },
          { staff: { some: { userId, isActive: true } } },
        ],
      },
    });

    if (!property) {
      throw new ForbiddenException({
        code: 'PROPERTY_ACCESS_DENIED',
        message: 'You do not have access to this property',
      });
    }

    return property;
  }

  private generateSlug(name: string, city: string): string {
    const base = `${name}-${city}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80);

    return `${base}-${Date.now().toString(36)}`;
  }
}
