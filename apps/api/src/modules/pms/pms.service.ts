// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { BedStatus, ComplaintStatus, RentStatus, VisitorStatus } from '@roomly/database';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PmsService {
  constructor(private readonly prisma: PrismaService) {}

  bedMap(propertyId: string) {
    return this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        floors: { include: { rooms: { include: { beds: true } } } },
        complaints: { where: { status: { not: ComplaintStatus.CLOSED } } },
        rentRecords: true,
      },
    });
  }

  updateBedStatus(propertyId: string, bedId: string, status: BedStatus) {
    return this.prisma.bed.update({ where: { id: bedId }, data: { propertyId, status } });
  }

  toggleMaintenance(propertyId: string, bedId: string, enabled: boolean) {
    return this.updateBedStatus(propertyId, bedId, enabled ? BedStatus.MAINTENANCE : BedStatus.VACANT);
  }

  rent(propertyId: string, month: number, year: number) {
    return this.prisma.rentRecord.findMany({
      where: { propertyId, month, year },
      include: { tenant: true, bed: true, booking: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  markRentPaid(propertyId: string, rentRecordId: string, userId: string) {
    return this.prisma.rentRecord.update({
      where: { id: rentRecordId },
      data: { status: RentStatus.PAID, paymentMethod: 'CASH', paidAt: new Date(), markedByUserId: userId, propertyId },
    });
  }

  listComplaints(propertyId: string, status?: ComplaintStatus, category?: string) {
    return this.prisma.complaint.findMany({
      where: { propertyId, ...(status ? { status } : {}), ...(category ? { category } : {}) },
      include: { tenant: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createComplaint(propertyId: string, tenantId: string, body: any) {
    return this.prisma.complaint.create({ data: { propertyId, tenantId, ...body } });
  }

  updateComplaint(id: string, body: any) {
    return this.prisma.complaint.update({ where: { id }, data: body });
  }

  tenants(propertyId: string) {
    return this.prisma.booking.findMany({
      where: { propertyId, status: 'CONFIRMED' },
      include: { tenant: { include: { tenantProfile: true } }, bed: true },
    });
  }

  expenses(propertyId: string, query: any) {
    return this.prisma.expense.findMany({
      where: { propertyId, ...(query.month ? { month: Number(query.month) } : {}), ...(query.year ? { year: Number(query.year) } : {}) },
      orderBy: { date: 'desc' },
    });
  }

  createExpense(propertyId: string, userId: string, body: any) {
    const date = body.date ? new Date(body.date) : new Date();
    return this.prisma.expense.create({
      data: {
        propertyId,
        loggedByUserId: userId,
        date,
        month: body.month ?? date.getMonth() + 1,
        year: body.year ?? date.getFullYear(),
        ...body,
      },
    });
  }

  expenseSummary(propertyId: string, month?: number, year?: number) {
    return this.prisma.expense.groupBy({
      by: ['category'],
      where: { propertyId, ...(month ? { month } : {}), ...(year ? { year } : {}) },
      _sum: { amount: true },
      _count: { id: true },
    });
  }

  foodMenu(propertyId: string) {
    return this.prisma.foodMenu.findMany({ where: { propertyId, isActive: true }, orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }] });
  }

  upsertFoodMenu(propertyId: string, items: any[]) {
    return Promise.all(
      items.map((item) =>
        this.prisma.foodMenu.upsert({
          where: { propertyId_dayOfWeek_mealType: { propertyId, dayOfWeek: item.dayOfWeek, mealType: item.mealType } },
          create: { propertyId, ...item },
          update: item,
        }),
      ),
    );
  }

  todayMenu(propertyId: string) {
    return this.prisma.foodMenu.findMany({ where: { propertyId, dayOfWeek: new Date().getDay(), isActive: true } });
  }

  foodRatings(propertyId: string) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.prisma.mealRating.findMany({ where: { propertyId, date: { gte: since } }, orderBy: { date: 'desc' } });
  }

  staff(propertyId: string) {
    return this.prisma.propertyStaff.findMany({ where: { propertyId, isActive: true }, include: { user: true } });
  }

  addStaff(propertyId: string, body: any) {
    return this.prisma.propertyStaff.create({ data: { propertyId, ...body } });
  }

  updateStaff(staffId: string, body: any) {
    return this.prisma.propertyStaff.update({ where: { id: staffId }, data: body });
  }

  removeStaff(staffId: string) {
    return this.prisma.propertyStaff.update({ where: { id: staffId }, data: { isActive: false, removedAt: new Date() } });
  }

  attendance(propertyId: string, body?: any) {
    if (body) return this.prisma.staffAttendance.create({ data: { propertyId, date: new Date(body.date ?? Date.now()), ...body } });
    return this.prisma.staffAttendance.findMany({ where: { propertyId }, orderBy: { date: 'desc' } });
  }

  visitors(propertyId: string) {
    return this.prisma.visitor.findMany({ where: { propertyId }, orderBy: { createdAt: 'desc' } });
  }

  createVisitor(propertyId: string, body: any) {
    return this.prisma.visitor.create({ data: { propertyId, status: VisitorStatus.CHECKED_IN, checkInAt: new Date(), ...body } });
  }

  checkoutVisitor(id: string) {
    return this.prisma.visitor.update({ where: { id }, data: { status: VisitorStatus.CHECKED_OUT, checkOutAt: new Date() } });
  }

  meters(propertyId: string) {
    return this.prisma.propertyMeterReading.findMany({ where: { propertyId }, orderBy: { readingDate: 'desc' } });
  }

  addMeter(propertyId: string, body: any) {
    const current = Number(body.currentReading);
    const previous = Number(body.previousReading ?? 0);
    const unitsConsumed = body.unitsConsumed ?? Math.max(current - previous, 0);
    return this.prisma.propertyMeterReading.create({
      data: {
        propertyId,
        readingDate: new Date(body.readingDate ?? Date.now()),
        month: body.month ?? new Date().getMonth() + 1,
        year: body.year ?? new Date().getFullYear(),
        ...body,
        unitsConsumed,
        billAmount: body.billAmount ?? unitsConsumed * Number(body.ratePerUnit ?? 0),
      },
    });
  }

  assets(propertyId: string) {
    return this.prisma.asset.findMany({ where: { propertyId, isActive: true }, orderBy: { createdAt: 'desc' } });
  }

  createAsset(propertyId: string, body: any) {
    return this.prisma.asset.create({ data: { propertyId, ...body } });
  }

  updateAsset(id: string, body: any) {
    return this.prisma.asset.update({ where: { id }, data: body });
  }
}
