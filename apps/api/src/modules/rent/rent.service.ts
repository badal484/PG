// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RentStatus } from '@roomly/database';

@Injectable()
export class RentService {
  constructor(private prisma: PrismaService) {}

  async generateMonthlyRent(propertyId: string, month: number, year: number, ownerId: string) {
    // Get all confirmed bookings for this property
    const bookings = await this.prisma.booking.findMany({
      where: { propertyId, status: 'CONFIRMED' },
      include: { bed: true, tenant: true },
    });

    const created: any[] = [];

    for (const booking of bookings) {
      const existing = await this.prisma.rentRecord.findFirst({
        where: {
          bookingId: booking.id,
          month,
          year,
        },
      });

      if (existing) continue;

      const dueDate = new Date(year, month - 1, 5); // Due on 5th of month

      const record = await this.prisma.rentRecord.create({
        data: {
          bookingId: booking.id,
          bedId: booking.bedId,
          propertyId,
          tenantId: booking.tenantId,
          ownerId: booking.ownerId,
          month,
          year,
          amount: booking.bed.monthlyRent,
          dueDate,
          status: RentStatus.PENDING,
        },
      });

      created.push(record);
    }

    return { created: created.length, records: created };
  }

  async getPropertyRents(propertyId: string, month?: number, year?: number) {
    const where: any = { propertyId };
    if (month) where.month = month;
    if (year) where.year = year;

    return this.prisma.rentRecord.findMany({
      where,
      include: {
        tenant: { select: { id: true, phone: true, firstName: true, lastName: true } },
        bed: { select: { bedNumber: true, bedLabel: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getMyRents(tenantId: string) {
    return this.prisma.rentRecord.findMany({
      where: { tenantId },
      include: {
        property: { select: { id: true, name: true, city: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getRentOverview(propertyId: string, year: number) {
    const records = await this.prisma.rentRecord.findMany({
      where: { propertyId, year },
    });

    const totalExpected = records.reduce((s, r) => s + r.amount, 0);
    const totalCollected = records.filter(r => r.status === RentStatus.PAID).reduce((s, r) => s + r.amount, 0);
    const totalPending = records.filter(r => r.status === RentStatus.PENDING).reduce((s, r) => s + r.amount, 0);
    const totalOverdue = records.filter(r => r.status === RentStatus.OVERDUE).reduce((s, r) => s + r.amount, 0);

    return { totalExpected, totalCollected, totalPending, totalOverdue, collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0 };
  }

  async markOverdueRents() {
    const today = new Date();
    const result = await this.prisma.rentRecord.updateMany({
      where: {
        status: RentStatus.PENDING,
        dueDate: { lt: today },
      },
      data: { status: RentStatus.OVERDUE },
    });

    return { markedOverdue: result.count };
  }
}
