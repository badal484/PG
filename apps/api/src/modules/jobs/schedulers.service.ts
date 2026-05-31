// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from '../notifications/whatsapp.service';
import { QUEUE, JOB } from './queues';

@Injectable()
export class SchedulersService {
  private readonly logger = new Logger(SchedulersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsApp: WhatsAppService,
    @InjectQueue(QUEUE.RENT_RECORD) private readonly rentRecordQueue: Queue,
    @InjectQueue(QUEUE.ESCROW_RELEASE) private readonly escrowQueue: Queue,
    @InjectQueue(QUEUE.ANALYTICS) private readonly analyticsQueue: Queue,
  ) {}

  // ── 9 AM IST daily — rent reminders ─────────────────────────────────────────
  @Cron('30 3 * * *', { timeZone: 'Asia/Kolkata' })
  async scheduleRentReminders(): Promise<void> {
    this.logger.log('Running rent reminder cron');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dueSoon, dueToday, overdue] = await Promise.all([
      this.prisma.rentRecord.findMany({
        where: { dueDate: in3Days, status: 'PENDING' },
        include: { tenant: { select: { phone: true, firstName: true } }, property: { select: { name: true } } },
      }),
      this.prisma.rentRecord.findMany({
        where: { dueDate: today, status: 'PENDING' },
        include: { tenant: { select: { phone: true, firstName: true } }, property: { select: { name: true } } },
      }),
      this.prisma.rentRecord.findMany({
        where: { dueDate: { lt: today }, status: { in: ['PENDING', 'OVERDUE'] } },
        include: { tenant: { select: { phone: true, firstName: true } }, property: { select: { name: true } } },
      }),
    ]);

    for (const record of [...dueSoon, ...dueToday]) {
      if (!record.tenant?.phone) continue;

      const remindersSent = await this.prisma.whatsAppMessage.count({
        where: {
          toPhone: record.tenant.phone,
          templateName: 'rent_reminder',
          createdAt: { gte: monthStart },
        },
      });
      if (remindersSent >= 3) continue;

      await this.whatsApp.sendWhatsAppMessage(record.tenant.phone, 'rent_reminder', {
        tenant_name: record.tenant.firstName ?? 'Tenant',
        amount: record.amount.toString(),
        property_name: record.property?.name ?? '',
        due_date: record.dueDate.toLocaleDateString('en-IN'),
      });

      // Increment reminder count on record
      await this.prisma.rentRecord.update({
        where: { id: record.id },
        data: { reminderCount: { increment: 1 }, lastReminderAt: new Date() },
      });
    }

    for (const record of overdue) {
      if (!record.tenant?.phone) continue;

      const remindersSent = await this.prisma.whatsAppMessage.count({
        where: {
          toPhone: record.tenant.phone,
          templateName: 'rent_overdue',
          createdAt: { gte: monthStart },
        },
      });
      if (remindersSent >= 3) continue;

      const daysOverdue = Math.floor(
        (today.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      ).toString();

      await this.whatsApp.sendWhatsAppMessage(record.tenant.phone, 'rent_overdue', {
        tenant_name: record.tenant.firstName ?? 'Tenant',
        amount: record.amount.toString(),
        days_overdue: daysOverdue,
        property_name: record.property?.name ?? '',
      });

      await this.prisma.rentRecord.update({
        where: { id: record.id },
        data: { status: 'OVERDUE', reminderCount: { increment: 1 }, lastReminderAt: new Date() },
      });
    }

    this.logger.log(
      `Rent reminders: ${dueSoon.length} due-soon, ${dueToday.length} due-today, ${overdue.length} overdue`,
    );
  }

  // ── Monday 8 AM IST — weekly digest ─────────────────────────────────────────
  @Cron('0 8 * * 1', { timeZone: 'Asia/Kolkata' })
  async scheduleWeeklyDigest(): Promise<void> {
    this.logger.log('Running weekly owner digest cron');

    // Get all active owners with their properties
    const owners = await this.prisma.user.findMany({
      where: { role: 'OWNER', isActive: true },
      select: {
        id: true,
        phone: true,
        firstName: true,
        ownedProperties: {
          where: { isActive: true },
          select: {
            id: true,
            beds: { select: { status: true } },
            rentRecords: {
              where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
              select: { status: true, amount: true },
            },
            bookings: {
              where: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
                status: 'CONFIRMED',
              },
              select: { id: true },
            },
          },
        },
      },
    });

    for (const owner of owners) {
      if (!owner.phone || !owner.ownedProperties.length) continue;

      const allBeds = owner.ownedProperties.flatMap((p) => p.beds);
      const occupiedBeds = allBeds.filter((b) => b.status === 'OCCUPIED').length;
      const totalBeds = allBeds.length;
      const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      const allRent = owner.ownedProperties.flatMap((p) => p.rentRecords);
      const rentCollected = allRent
        .filter((r) => r.status === 'PAID')
        .reduce((s, r) => s + r.amount, 0);
      const rentPending = allRent
        .filter((r) => ['PENDING', 'OVERDUE'].includes(r.status))
        .reduce((s, r) => s + r.amount, 0);

      const newBookings = owner.ownedProperties.flatMap((p) => p.bookings).length;

      await this.whatsApp.sendWhatsAppMessage(owner.phone, 'weekly_digest_owner', {
        owner_name: owner.firstName ?? 'Owner',
        total_properties: owner.ownedProperties.length.toString(),
        occupancy_percent: occupancyPct.toString(),
        rent_collected: rentCollected.toLocaleString('en-IN'),
        rent_pending: rentPending.toLocaleString('en-IN'),
        new_bookings: newBookings.toString(),
      });
    }

    this.logger.log(`Weekly digest sent to ${owners.length} owners`);
  }

  // ── 1st of month midnight — create monthly rent records ─────────────────────
  @Cron('0 0 1 * *', { timeZone: 'Asia/Kolkata' })
  async createMonthlyRentRecords(): Promise<void> {
    this.logger.log('Creating monthly rent records');
    await this.rentRecordQueue.add(JOB.CREATE_MONTHLY_RECORDS, {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  }

  // ── Daily midnight — compute property analytics ──────────────────────────────
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Kolkata' })
  async computeDailyAnalytics(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await this.analyticsQueue.add(JOB.COMPUTE_ANALYTICS, {
      date: yesterday.toISOString().slice(0, 10),
    });
  }

  // ── Hourly — release settled escrow ─────────────────────────────────────────
  @Cron(CronExpression.EVERY_HOUR)
  async releaseSettledEscrow(): Promise<void> {
    const cutoff = new Date(Date.now() - 48 * 3600 * 1000);

    // Find settlements accepted by tenant >48h ago but not yet resolved
    const pendingSettlements = await this.prisma.depositSettlement.findMany({
      where: {
        acceptedByTenantAt: { lt: cutoff, not: null },
        resolvedAt: null,
      },
      select: {
        id: true,
        bookingId: true,
        refundToTenant: true,
        ownerId: true,
        tenantId: true,
      },
    });

    for (const settlement of pendingSettlements) {
      await this.escrowQueue.add(JOB.RELEASE_ESCROW, {
        settlementId: settlement.id,
        bookingId: settlement.bookingId,
        refundToTenant: settlement.refundToTenant,
        ownerId: settlement.ownerId,
        tenantId: settlement.tenantId,
      });
    }

    if (pendingSettlements.length > 0) {
      this.logger.log(`Queued ${pendingSettlements.length} escrow releases`);
    }
  }
}
