import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  transfers?: RazorpayTransfer[];
}

interface RazorpayTransfer {
  account: string;
  amount: number;
  currency: string;
  notes?: Record<string, string>;
  on_hold?: 1 | 0;
  on_hold_until?: number;
}

interface LinkedAccountInput {
  name: string;
  email: string;
  phone: string;
  pan?: string;
  bankAccount?: {
    name: string;
    ifsc: string;
    accountNumber: string;
  };
}

@Injectable()
export class RazorpayRouteService {
  private readonly logger = new Logger(RazorpayRouteService.name);
  private readonly keyId = process.env.RAZORPAY_KEY_ID ?? '';
  private readonly keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
  private readonly webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
  private readonly platformAccount = process.env.RAZORPAY_PLATFORM_ACCOUNT ?? '';
  private readonly apiBase = 'https://api.razorpay.com/v1';

  constructor(private readonly prisma: PrismaService) {}

  // ── Linked account for owner ─────────────────────────────────────────────────

  async createLinkedAccount(ownerProfile: LinkedAccountInput & { ownerId: string }): Promise<{
    contactId: string;
    fundAccountId: string;
  }> {
    const contactPayload = {
      name: ownerProfile.name,
      email: ownerProfile.email,
      contact: ownerProfile.phone,
      type: 'vendor',
      reference_id: ownerProfile.ownerId,
    };

    const contactRes = await this.razorpayRequest('POST', '/contacts', contactPayload);
    const contactId: string = contactRes.id;

    let fundAccountId: string;

    if (ownerProfile.bankAccount) {
      const faPayload = {
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          name: ownerProfile.bankAccount.name,
          ifsc: ownerProfile.bankAccount.ifsc,
          account_number: ownerProfile.bankAccount.accountNumber,
        },
      };
      const faRes = await this.razorpayRequest('POST', '/fund_accounts', faPayload);
      fundAccountId = faRes.id;
    } else {
      fundAccountId = `fa_pending_${ownerProfile.ownerId}`;
    }

    await this.prisma.ownerProfile.update({
      where: { userId: ownerProfile.ownerId },
      data: { razorpayContactId: contactId, razorpayFundAccountId: fundAccountId },
    });

    this.logger.log(`Created linked account for owner ${ownerProfile.ownerId}`);
    return { contactId, fundAccountId };
  }

  // ── Escrow account for booking deposit ──────────────────────────────────────

  async createEscrowAccount(bookingId: string): Promise<string> {
    const escrowRefId = `escrow_${bookingId}_${Date.now()}`;

    const contactRes = await this.razorpayRequest('POST', '/contacts', {
      name: `Escrow-${bookingId}`,
      type: 'customer',
      reference_id: escrowRefId,
    });

    await this.prisma.escrow.updateMany({
      where: { bookingId },
      data: { razorpayEscrowId: contactRes.id },
    });

    this.logger.log(`Created escrow account for booking ${bookingId}: ${contactRes.id}`);
    return contactRes.id;
  }

  // ── Split order with Route transfers ────────────────────────────────────────

  async createSplitOrder(params: {
    bookingId: string;
    tenantId: string;
    ownerId: string;
    depositAmount: number;
    firstMonthRent: number;
    platformFee: number;
    commissionAmount: number;
    ownerFundAccountId: string;
    escrowAccountId: string;
  }): Promise<{ orderId: string; amount: number }> {
    const totalAmount = params.depositAmount + params.firstMonthRent + params.platformFee;
    const rentNet = params.firstMonthRent - params.commissionAmount;
    const holdUntil48h = Math.floor(Date.now() / 1000) + 48 * 3600;

    const transfers: RazorpayTransfer[] = ([
      {
        account: params.escrowAccountId,
        amount: params.depositAmount * 100,
        currency: 'INR',
        notes: { type: 'DEPOSIT', bookingId: params.bookingId },
        on_hold: 1 as 1,
      },
      {
        account: params.ownerFundAccountId,
        amount: rentNet * 100,
        currency: 'INR',
        notes: { type: 'RENT', bookingId: params.bookingId },
        on_hold: 1 as 1,
        on_hold_until: holdUntil48h,
      },
      {
        account: this.platformAccount,
        amount: (params.commissionAmount + params.platformFee) * 100,
        currency: 'INR',
        notes: { type: 'COMMISSION_AND_FEE', bookingId: params.bookingId },
      },
    ] as RazorpayTransfer[]).filter((t) => t.account);

    const order = await this.razorpayRequest('POST', '/orders', {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: params.bookingId,
      transfers,
      notes: { bookingId: params.bookingId, tenantId: params.tenantId },
    }) as RazorpayOrder;

    this.logger.log(`Created split order ${order.id} for booking ${params.bookingId}`);
    return { orderId: order.id, amount: totalAmount };
  }

  // ── Release deposit ──────────────────────────────────────────────────────────

  async releaseDeposit(params: {
    escrowAccountId: string;
    amount: number;
    toFundAccountId: string;
    notes?: Record<string, string>;
  }): Promise<void> {
    await this.razorpayRequest('POST', '/payouts', {
      account_number: process.env.RAZORPAY_PLATFORM_ACCOUNT_NUMBER,
      fund_account_id: params.toFundAccountId,
      amount: params.amount * 100,
      currency: 'INR',
      mode: 'NEFT',
      purpose: 'refund',
      notes: params.notes ?? {},
    });

    this.logger.log(`Released deposit of ₹${params.amount} to ${params.toFundAccountId}`);
  }

  // ── Refund ───────────────────────────────────────────────────────────────────

  async initiateRefund(paymentId: string, amount: number, notes: Record<string, string> = {}): Promise<{
    refundId: string;
    amount: number;
  }> {
    const res = await this.razorpayRequest('POST', `/payments/${paymentId}/refund`, {
      amount: amount * 100,
      notes,
    });

    this.logger.log(`Refund initiated: ${res.id} for payment ${paymentId} amount ₹${amount}`);
    return { refundId: res.id, amount };
  }

  // ── Webhook handler ──────────────────────────────────────────────────────────

  async handleWebhook(payload: Buffer | string, signature: string): Promise<void> {
    const body = typeof payload === 'string' ? payload : payload.toString('utf8');

    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSig !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(body) as { event: string; payload: Record<string, any> };

    switch (event.event) {
      case 'payment.captured':
        await this.onPaymentCaptured(event.payload);
        break;
      case 'payment.failed':
        await this.onPaymentFailed(event.payload);
        break;
      case 'transfer.settled':
        await this.onTransferSettled(event.payload);
        break;
      case 'refund.created':
        await this.onRefundCreated(event.payload);
        break;
      default:
        this.logger.debug(`Unhandled Razorpay event: ${event.event}`);
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async onPaymentCaptured(payload: Record<string, any>): Promise<void> {
    const orderId = payload?.payment?.entity?.order_id;
    const razorpayPaymentId = payload?.payment?.entity?.id;
    if (!orderId) return;

    await this.prisma.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { status: 'CAPTURED' as any, razorpayPaymentId },
    });
    this.logger.log(`Payment captured: order ${orderId}`);
  }

  private async onPaymentFailed(payload: Record<string, any>): Promise<void> {
    const orderId = payload?.payment?.entity?.order_id;
    if (!orderId) return;

    await this.prisma.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { status: 'FAILED' },
    });
    this.logger.warn(`Payment failed: order ${orderId}`);
  }

  private async onTransferSettled(payload: Record<string, any>): Promise<void> {
    const transferId = payload?.transfer?.entity?.id;
    this.logger.log(`Transfer settled: ${transferId}`);
  }

  private async onRefundCreated(payload: Record<string, any>): Promise<void> {
    const refundId = payload?.refund?.entity?.id;
    const paymentId = payload?.refund?.entity?.payment_id;
    const amount = (payload?.refund?.entity?.amount ?? 0) / 100;
    this.logger.log(`Refund ${refundId} created for payment ${paymentId}: ₹${amount}`);
  }

  private async razorpayRequest(
    method: 'GET' | 'POST' | 'PATCH',
    path: string,
    body?: object,
  ): Promise<any> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    if (!this.keyId) {
      this.logger.debug(`[DEV] Razorpay mock ${method} ${path}`);
      return { id: `mock_${Date.now()}` };
    }

    const res = await fetch(`${this.apiBase}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as Record<string, any>;
      throw new Error(`Razorpay API error ${res.status}: ${err?.error?.description ?? res.statusText}`);
    }

    return res.json();
  }
}
