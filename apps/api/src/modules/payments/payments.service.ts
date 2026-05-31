// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  MarkRentPaidDto,
  InitiateRefundDto,
} from './dto/payment.dto';
import {
  PaymentStatus,
  BookingStatus,
  RentStatus,
  EscrowStatus,
  PaymentType,
  DepositStatus,
} from '@roomly/database';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Razorpay Order Creation ──────────────────────────────────────────────────

  async createPaymentOrder(userId: string, dto: CreatePaymentOrderDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { property: true },
    });

    if (!booking) {
      throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
    }

    if (booking.tenantId !== userId) {
      throw new BadRequestException({ code: 'PAYMENT_FORBIDDEN', message: 'Not your booking' });
    }

    // Calculate amount based on payment type
    let amount: number;
    switch (dto.type) {
      case PaymentType.DEPOSIT:
        amount = booking.depositAmount;
        break;
      case PaymentType.FIRST_MONTH_RENT:
        amount = booking.firstMonthRent;
        break;
      case PaymentType.PLATFORM_FEE:
        amount = booking.platformFee;
        break;
      default:
        amount = dto.amount || 0;
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // Create Razorpay order (mock structure — real SDK call in production)
    const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amountPaisa = Math.round(amount * 100);

    // Store payment record
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        tenantId: userId,
        ownerId: booking.ownerId,
        propertyId: booking.propertyId,
        type: dto.type,
        amount,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        razorpayOrderId,
        gatewayName: 'RAZORPAY',
      },
    });

    return {
      paymentId: payment.id,
      razorpayOrderId,
      amount: amountPaisa,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      prefill: {
        contact: '', // Will be filled from user profile on frontend
        email: '',
      },
      notes: {
        bookingId: dto.bookingId,
        type: dto.type,
      },
    };
  }

  // ─── Razorpay Webhook / Signature Verification ────────────────────────────────

  async verifyPayment(dto: VerifyPaymentDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = dto;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException({
        code: 'PAYMENT_SIGNATURE_INVALID',
        message: 'Payment signature verification failed',
      });
    }

    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    // Update payment in transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CAPTURED,
          razorpayPaymentId,
          capturedAt: new Date(),
        },
      });

      // Update booking status based on payment type
      if (payment.type === PaymentType.DEPOSIT || payment.type === PaymentType.FIRST_MONTH_RENT) {
        const booking = await tx.booking.findUnique({ where: { id: payment.bookingId! } });
        if (booking?.status === BookingStatus.PENDING_PAYMENT) {
          await tx.booking.update({
            where: { id: payment.bookingId! },
            data: { status: BookingStatus.PENDING_AGREEMENT, paidAt: new Date() },
          });
        }
      }

      // Create escrow entry for deposits
      if (payment.type === PaymentType.DEPOSIT) {
        await tx.escrow.create({
          data: {
            bookingId: payment.bookingId!,
            tenantId: payment.tenantId,
            ownerId: payment.ownerId,
            propertyId: payment.propertyId,
            amount: payment.amount,
            status: EscrowStatus.ACTIVE,
            depositPaymentId: paymentId,
          },
        });
      }
    });

    return { success: true, message: 'Payment verified successfully' };
  }

  async handleRazorpayWebhook(event: string, payload: any, signature: string) {
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSig !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const { event: eventType, payload: eventPayload } = payload;

    if (eventType === 'payment.captured') {
      const razorpayPaymentId = eventPayload?.payment?.entity?.id;
      const razorpayOrderId = eventPayload?.payment?.entity?.order_id;

      if (razorpayOrderId) {
        await this.prisma.payment.updateMany({
          where: { razorpayOrderId },
          data: { status: PaymentStatus.CAPTURED, razorpayPaymentId, capturedAt: new Date() },
        });
      }
    } else if (eventType === 'payment.failed') {
      const razorpayOrderId = eventPayload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await this.prisma.payment.updateMany({
          where: { razorpayOrderId },
          data: { status: PaymentStatus.FAILED },
        });
      }
    }

    return { received: true };
  }

  // ─── Rent Management ──────────────────────────────────────────────────────────

  async markRentPaid(userId: string, dto: MarkRentPaidDto) {
    const rentRecord = await this.prisma.rentRecord.findUnique({
      where: { id: dto.rentRecordId },
      include: { property: true },
    });

    if (!rentRecord) {
      throw new NotFoundException({ code: 'RENT_RECORD_NOT_FOUND', message: 'Rent record not found' });
    }

    if (rentRecord.status === RentStatus.PAID) {
      throw new BadRequestException('Rent already marked as paid');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.rentRecord.update({
        where: { id: dto.rentRecordId },
        data: {
          status: RentStatus.PAID,
          paidDate: new Date(),
          paymentMode: dto.paymentMode,
          transactionRef: dto.transactionRef,
          remarks: dto.remarks,
          markedByUserId: userId,
        },
      });

      // Create payment record for accounting
      await tx.payment.create({
        data: {
          rentRecordId: dto.rentRecordId,
          tenantId: rentRecord.tenantId,
          ownerId: rentRecord.ownerId,
          propertyId: rentRecord.propertyId,
          type: PaymentType.MONTHLY_RENT,
          amount: rentRecord.amount,
          currency: 'INR',
          status: PaymentStatus.CAPTURED,
          gatewayName: dto.paymentMode,
          capturedAt: new Date(),
        },
      });

      return updated;
    });
  }

  // ─── Deposit Settlement ───────────────────────────────────────────────────────

  async initiateDepositSettlement(bookingId: string, ownerId: string, deductions: Array<{ reason: string; amount: number }>) {
    const escrow = await this.prisma.escrow.findFirst({
      where: { bookingId, status: EscrowStatus.ACTIVE },
    });

    if (!escrow) {
      throw new NotFoundException('No active escrow found for this booking');
    }

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const refundAmount = escrow.amount - totalDeductions;

    if (refundAmount < 0) {
      throw new BadRequestException('Deductions exceed deposit amount');
    }

    return this.prisma.$transaction(async (tx) => {
      const settlement = await tx.depositSettlement.create({
        data: {
          bookingId,
          tenantId: escrow.tenantId,
          ownerId: escrow.ownerId,
          propertyId: escrow.propertyId,
          totalDeposit: escrow.amount,
          deductions: deductions as any,
          totalDeductions,
          refundAmount,
          proposedByUserId: ownerId,
          status: DepositStatus.HELD,
        },
      });

      await tx.escrow.update({
        where: { id: escrow.id },
        data: { status: EscrowStatus.RELEASED },
      });

      return settlement;
    });
  }

  // ─── Refunds ──────────────────────────────────────────────────────────────────

  async initiateRefund(dto: InitiateRefundDto, adminId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: dto.paymentId } });

    if (!payment || payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException('Payment not eligible for refund');
    }

    const refundAmount = dto.amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    const isPartial = refundAmount < payment.amount;

    await this.prisma.payment.update({
      where: { id: dto.paymentId },
      data: {
        status: isPartial ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason: dto.reason,
        refundAmount,
      },
    });

    // In production: call Razorpay refund API here
    this.logger.log(`Refund of ₹${refundAmount} initiated for payment ${dto.paymentId}`);

    return { success: true, refundAmount, message: 'Refund initiated successfully' };
  }

  // ─── Reports ──────────────────────────────────────────────────────────────────

  async getPaymentHistory(userId: string, role: string) {
    const where: any = role === 'TENANT' ? { tenantId: userId } : { ownerId: userId };

    return this.prisma.payment.findMany({
      where: { ...where, status: PaymentStatus.CAPTURED },
      orderBy: { capturedAt: 'desc' },
      take: 50,
      include: {
        booking: { select: { id: true, stayType: true } },
        property: { select: { id: true, name: true, city: true } },
      },
    });
  }
}
