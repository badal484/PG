import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpdateProfileDto,
  UpdateTenantProfileDto,
  UpdateOwnerProfileDto,
  ListUsersQueryDto,
} from './dto/user.dto';
import { UserRole } from '@roomly/database';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tenantProfile: true,
        ownerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: { tenantProfile: true, ownerProfile: true },
    });

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateTenantProfile(userId: string, dto: UpdateTenantProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const profile = await this.prisma.tenantProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });

    return profile;
  }

  async updateOwnerProfile(userId: string, dto: UpdateOwnerProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    // Ensure owner role
    if (user.role !== UserRole.OWNER && user.role !== UserRole.MANAGER) {
      // Auto-upgrade to owner role
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.OWNER },
      });
    }

    const profile = await this.prisma.ownerProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });

    return profile;
  }

  async uploadProfilePhoto(userId: string, photoUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: photoUrl },
      select: { id: true, profilePhoto: true },
    });
  }

  async listUsers(query: ListUsersQueryDto) {
    const { page = 1, limit = 20, role, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      _meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async toggleUserStatus(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    if (userId === adminId) throw new BadRequestException('Cannot deactivate yourself');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
  }

  async getUserStats(userId: string) {
    const [bookingsCount, complaintsCount, rentsPaid] = await Promise.all([
      this.prisma.booking.count({ where: { tenantId: userId } }),
      this.prisma.complaint.count({ where: { tenantId: userId } }),
      this.prisma.rentRecord.count({ where: { tenantId: userId, status: 'PAID' } }),
    ]);

    return { bookingsCount, complaintsCount, rentsPaid };
  }

  async getKycStatus(userId: string) {
    return this.prisma.kYCRecord.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async initiateKyc(userId: string, body: any) {
    return this.prisma.kYCRecord.create({
      data: {
        userId,
        method: body.method ?? 'DIGILOCKER',
        status: 'PENDING',
        digilockerRequestId: `digilocker_${Date.now()}`,
        signzyRequestId: `signzy_${Date.now()}`,
      },
    });
  }

  async verifyKyc(userId: string, body: any) {
    return this.prisma.kYCRecord.updateMany({
      where: { userId, id: body.kycRecordId },
      data: {
        status: body.status ?? 'VERIFIED_DIGITAL',
        verifiedAt: new Date(),
        aadhaarNumber: body.aadhaarNumber,
        panNumber: body.panNumber,
      },
    });
  }

  async notifications(userId: string, query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { data: items, _meta: { page, limit, total } };
  }

  readNotification(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  readAllNotifications(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
