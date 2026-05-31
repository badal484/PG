// @ts-nocheck
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { QUEUE, JOB } from '../queues';

@Processor(QUEUE.ANALYTICS)
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== JOB.COMPUTE_ANALYTICS) {
      this.logger.warn(`Unknown analytics job: ${job.name}`);
      return;
    }

    const { date } = job.data as { date: string };
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const properties = await this.prisma.property.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    let computed = 0;

    for (const { id: propertyId } of properties) {
      try {
        await this.computeForProperty(propertyId, date, dayStart, dayEnd);
        computed++;
      } catch (err) {
        this.logger.error(`Analytics failed for ${propertyId} on ${date}: ${err.message}`);
      }
    }

    this.logger.log(`Analytics computed for ${computed}/${properties.length} properties on ${date}`);
  }

  private async computeForProperty(
    propertyId: string,
    date: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<void> {
    const [beds, rentRecords, complaints, newBookings] = await Promise.all([
      this.prisma.bed.findMany({
        where: { propertyId },
        select: { id: true, status: true },
      }),
      this.prisma.rentRecord.findMany({
        where: { propertyId, dueDate: { gte: dayStart, lte: dayEnd } },
        select: { status: true, amount: true },
      }),
      this.prisma.complaint.count({
        where: { propertyId, createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      this.prisma.booking.count({
        where: {
          propertyId,
          status: { in: ['CONFIRMED'] },
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
    ]);

    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
    const vacantBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? occupiedBeds / totalBeds : 0;

    const rentCollected = rentRecords
      .filter((r) => r.status === 'PAID')
      .reduce((s, r) => s + r.amount, 0);

    const rentPending = rentRecords
      .filter((r) => r.status === 'PENDING' || r.status === 'OVERDUE')
      .reduce((s, r) => s + r.amount, 0);

    // Upsert — PropertyAnalytics has no compound unique so use findFirst + create/update
    const existing = await this.prisma.propertyAnalytics.findFirst({
      where: { propertyId, date: new Date(date) },
      select: { id: true },
    });

    const payload = {
      occupiedBeds,
      vacantBeds,
      occupancyRate,
      rentCollected,
      rentPending,
      newBookings,
      complaints,
    };

    if (existing) {
      await this.prisma.propertyAnalytics.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await this.prisma.propertyAnalytics.create({
        data: { propertyId, date: new Date(date), ...payload },
      });
    }
  }
}
