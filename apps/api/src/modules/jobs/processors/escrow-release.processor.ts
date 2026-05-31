// @ts-nocheck
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { RazorpayRouteService } from '../../payments/razorpay-route.service';
import { QUEUE, JOB } from '../queues';

interface EscrowReleaseJob {
  settlementId: string;
  bookingId: string;
  refundToTenant: number;
  ownerId: string;
  tenantId: string;
}

@Processor(QUEUE.ESCROW_RELEASE)
export class EscrowReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(EscrowReleaseProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayRouteService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== JOB.RELEASE_ESCROW) {
      this.logger.warn(`Unknown escrow-release job: ${job.name}`);
      return;
    }

    const data = job.data as EscrowReleaseJob;

    // DepositSettlement accepted = acceptedByTenantAt is set
    const settlement = await this.prisma.depositSettlement.findUnique({
      where: { id: data.settlementId },
    });

    if (!settlement) {
      this.logger.warn(`Settlement ${data.settlementId} not found`);
      return;
    }

    if (!settlement.acceptedByTenantAt) {
      this.logger.warn(`Settlement ${data.settlementId} not yet accepted by tenant`);
      return;
    }

    // Find the EscrowAccount for this booking
    const escrowAccount = await this.prisma.escrowAccount.findFirst({
      where: { bookingId: data.bookingId, status: 'ACTIVE' },
    });

    // Find owner fund account
    const ownerProfile = await this.prisma.ownerProfile.findUnique({
      where: { userId: data.ownerId },
      select: { razorpayFundAccountId: true },
    });

    try {
      await this.prisma.$transaction(async (tx) => {
        // Mark settlement resolved in tenant's favour (refund issued)
        await tx.depositSettlement.update({
          where: { id: data.settlementId },
          data: { resolvedAt: new Date(), status: 'RESOLVED_TENANT_FAVOR' },
        });

        // Mark escrow account released
        if (escrowAccount) {
          await tx.escrowAccount.update({
            where: { id: escrowAccount.id },
            data: { status: 'RELEASED' },
          });
        }
      });

      // Initiate payout if there is a refund amount and Razorpay is configured
      const refundAmount = settlement.refundToTenant;
      if (refundAmount > 0 && ownerProfile?.razorpayFundAccountId && escrowAccount?.razorpayLinkedAccountId) {
        await this.razorpay.releaseDeposit({
          escrowAccountId: escrowAccount.razorpayLinkedAccountId,
          amount: refundAmount,
          toFundAccountId: ownerProfile.razorpayFundAccountId,
          notes: {
            settlementId: data.settlementId,
            bookingId: data.bookingId,
            type: 'DEPOSIT_REFUND',
          },
        });
      }

      this.logger.log(
        `Escrow released for settlement ${data.settlementId}: ₹${settlement.refundToTenant} refund`,
      );
    } catch (err) {
      this.logger.error(`Escrow release failed for ${data.settlementId}: ${err.message}`);
      throw err; // BullMQ will retry
    }
  }
}
