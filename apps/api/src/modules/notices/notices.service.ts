// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { NoticeStatus } from '@roomly/database';

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  async create(issuedByUserId: string, dto: CreateNoticeDto) {
    return this.prisma.notice.create({
      data: {
        propertyId: dto.propertyId,
        tenantId: dto.tenantId,
        title: dto.title,
        description: dto.description,
        vacateDate: dto.vacateDate ? new Date(dto.vacateDate) : undefined,
        noticePeriodDays: dto.noticePeriodDays || 30,
        status: NoticeStatus.ACTIVE,
        issuedByUserId,
      },
      include: {
        tenant: { select: { id: true, phone: true, firstName: true, lastName: true } },
        property: { select: { id: true, name: true } },
      },
    });
  }

  async findByProperty(propertyId: string) {
    return this.prisma.notice.findMany({
      where: { propertyId },
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyNotices(tenantId: string) {
    return this.prisma.notice.findMany({
      where: {
        OR: [
          { tenantId },
          { tenantId: null, property: { bookings: { some: { tenantId, status: 'CONFIRMED' } } } },
        ],
      },
      include: { property: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    return this.prisma.notice.update({
      where: { id },
      data: {
        ...dto,
        vacateDate: dto.vacateDate ? new Date(dto.vacateDate) : undefined,
      },
    });
  }

  async withdraw(id: string, userId: string) {
    return this.prisma.notice.update({
      where: { id },
      data: { status: NoticeStatus.WITHDRAWN, approvedByUserId: userId },
    });
  }
}
