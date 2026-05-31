import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(ownerId: string) {
    const properties = await this.prisma.property.findMany({ where: { ownerId, isActive: true }, include: { beds: true } });
    const propertyIds = properties.map((property: any) => property.id);
    const [rent, complaints, bookings, escrow] = await Promise.all([
      this.prisma.rentRecord.aggregate({ where: { propertyId: { in: propertyIds } }, _sum: { amount: true } }),
      this.prisma.complaint.count({ where: { propertyId: { in: propertyIds }, status: { not: 'CLOSED' } } }),
      this.prisma.booking.count({ where: { ownerId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      this.prisma.escrowAccount.aggregate({ where: { booking: { ownerId } }, _sum: { currentBalance: true } }),
    ]);
    const totalBeds = properties.reduce((sum: number, property: any) => sum + property.beds.length, 0);
    const occupiedBeds = properties.reduce((sum: number, property: any) => sum + property.beds.filter((bed: any) => bed.status === 'OCCUPIED').length, 0);
    return {
      totalBeds,
      occupancyPercent: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      revenueThisMonth: rent._sum.amount ?? 0,
      pendingRent: 0,
      openComplaints: complaints,
      newBookings: bookings,
      depositsInEscrow: escrow._sum.currentBalance ?? 0,
    };
  }

  properties(ownerId: string) {
    return this.prisma.property.findMany({ where: { ownerId, isActive: true }, include: { beds: true, complaints: true, rentRecords: true } });
  }

  profitLoss(ownerId: string, query: any) {
    return this.prisma.property.findMany({
      where: { ownerId, ...(query.propertyId ? { id: query.propertyId } : {}) },
      include: { rentRecords: true, expenses: true },
    });
  }

  expenses(ownerId: string) {
    return this.prisma.expense.findMany({ where: { property: { ownerId } }, include: { property: true }, orderBy: { date: 'desc' } });
  }

  occupancy(ownerId: string) {
    return this.prisma.propertyAnalytics.findMany({ where: { property: { ownerId } }, orderBy: { date: 'asc' } });
  }

  revenue(ownerId: string) {
    return this.prisma.rentRecord.findMany({ where: { property: { ownerId } }, orderBy: { dueDate: 'asc' } });
  }

  team(ownerId: string) {
    return this.prisma.propertyStaff.findMany({ where: { property: { ownerId }, isActive: true }, include: { user: true, property: true } });
  }

  addTeamMember(ownerId: string, body: any) {
    return this.prisma.propertyStaff.create({ data: body });
  }

  assignStaff(staffId: string, propertyId: string) {
    return this.prisma.propertyStaff.update({ where: { id: staffId }, data: { propertyId } });
  }

  subscription(ownerId: string) {
    return this.prisma.ownerProfile.findUnique({ where: { userId: ownerId }, include: { subscriptions: true } });
  }

  updateSubscription(ownerId: string, body: any) {
    return this.prisma.ownerProfile.upsert({ where: { userId: ownerId }, create: { userId: ownerId, ...body }, update: body });
  }

  commissions(ownerId: string) {
    return this.prisma.commission.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
  }
}
