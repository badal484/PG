// @ts-nocheck
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplaintDto, UpdateComplaintDto, ListComplaintsQueryDto } from './dto/complaint.dto';
import { ComplaintStatus } from '@roomly/database';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateComplaintDto) {
    return this.prisma.complaint.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        bedId: dto.bedId,
        category: dto.category,
        priority: dto.priority,
        title: dto.title,
        description: dto.description,
        photoUrls: dto.photoUrls as any,
        status: ComplaintStatus.OPEN,
      },
    });
  }

  async findAll(query: ListComplaintsQueryDto, userId: string, role: string) {
    const { page = 1, limit = 20, status, category, propertyId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Tenants see only their own complaints
    if (role === 'TENANT') where.tenantId = userId;
    if (status) where.status = status;
    if (category) where.category = category;
    if (propertyId) where.propertyId = propertyId;

    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, firstName: true, lastName: true } },
          property: { select: { id: true, name: true } },
        },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      data: complaints,
      _meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string, role: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, phone: true, firstName: true, lastName: true } },
        property: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!complaint) throw new NotFoundException('Complaint not found');

    if (role === 'TENANT' && complaint.tenantId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return complaint;
  }

  async update(id: string, dto: UpdateComplaintDto, userId: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    const data: any = {};
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === ComplaintStatus.RESOLVED) {
        data.resolvedAt = new Date();
        data.resolutionNote = dto.resolutionNote;
      }
    }
    if (dto.assignedToUserId) data.assignedToUserId = dto.assignedToUserId;

    return this.prisma.complaint.update({ where: { id }, data });
  }

  async escalate(id: string, adminId: string) {
    return this.prisma.complaint.update({
      where: { id },
      data: {
        status: ComplaintStatus.ESCALATED,
        escalatedToUserId: adminId,
        escalatedAt: new Date(),
      },
    });
  }
}
