// @ts-nocheck
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { QUEUE, JOB } from '../queues';

@Processor(QUEUE.RENT_RECORD)
export class RentRecordProcessor extends WorkerHost {
  private readonly logger = new Logger(RentRecordProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== JOB.CREATE_MONTHLY_RECORDS) {
      this.logger.warn(`Unknown rent-record job: ${job.name}`);
      return;
    }

    const { month, year } = job.data as { month: number; year: number };
    const dueDate = new Date(year, month - 1, 1); // 1st of the month

    // Find all active long-term bookings (CONFIRMED = active in this schema)
    const activeBookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        stayType: { in: ['MONTHLY', 'LONG_TERM'] },
        moveInDate: { lte: dueDate },
        OR: [{ moveOutDate: null }, { moveOutDate: { gte: dueDate } }],
      },
      select: {
        id: true,
        tenantId: true,
        ownerId: true,
        propertyId: true,
        bedId: true,
        monthlyRent: true,
      },
    });

    let created = 0;
    let skipped = 0;

    for (const booking of activeBookings) {
      // Idempotency: skip if record already exists for this month
      const existing = await this.prisma.rentRecord.findFirst({
        where: { bookingId: booking.id, month, year },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await this.prisma.rentRecord.create({
        data: {
          bookingId: booking.id,
          tenantId: booking.tenantId,
          propertyId: booking.propertyId,
          bedId: booking.bedId,
          amount: booking.monthlyRent,
          dueDate,
          status: 'PENDING',
          month,
          year,
        },
      });

      created++;
    }

    this.logger.log(
      `Monthly rent records for ${month}/${year}: ${created} created, ${skipped} skipped`,
    );
  }
}
