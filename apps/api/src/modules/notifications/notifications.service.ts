import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationChannel, NotificationType } from '@roomly/database';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { QUEUE, JOB } from '../jobs/queues';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsApp: WhatsAppService,
    private readonly sms: SmsService,
    private readonly email: EmailService,
    @InjectQueue(QUEUE.NOTIFICATION) private readonly notifQueue: Queue,
  ) {}

  // ── WhatsApp (queued) ────────────────────────────────────────────────────────

  async sendWhatsApp(phone: string, templateName: string, params: Record<string, string> = {}) {
    return this.notifQueue.add(JOB.SEND_WHATSAPP, { phone, templateName, params }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  // ── WhatsApp (immediate — for OTP / time-sensitive) ──────────────────────────

  async sendWhatsAppNow(phone: string, templateName: string, params: Record<string, string> = {}) {
    return this.whatsApp.sendWhatsAppMessage(phone, templateName, params);
  }

  // ── SMS ──────────────────────────────────────────────────────────────────────

  async sendSMS(phone: string, message: string) {
    return this.notifQueue.add(JOB.SEND_SMS, { phone, message }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
    });
  }

  async sendOTPviaSMS(phone: string) {
    return this.sms.sendOTP(phone);
  }

  // ── Email ────────────────────────────────────────────────────────────────────

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    return this.notifQueue.add(JOB.SEND_EMAIL, { to, subject, html, text }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  // ── In-app ───────────────────────────────────────────────────────────────────

  async createInAppNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType = NotificationType.SYSTEM,
    data: Record<string, unknown> | null = null,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        data: (data ?? undefined) as any,
        channel: NotificationChannel.IN_APP,
      },
    });
  }

  // ── List / mark read ─────────────────────────────────────────────────────────

  async listForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where }),
    ]);
    return { data: items, _meta: { page, limit, total } };
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ── Convenience domain methods ───────────────────────────────────────────────

  async notifyBookingConfirmed(opts: {
    tenantPhone: string;
    tenantEmail: string;
    tenantName: string;
    ownerPhone: string;
    ownerName: string;
    propertyName: string;
    bedNumber: string;
    moveInDate: string;
    bookingId: string;
    commissionAmount: string;
  }) {
    await Promise.all([
      this.sendWhatsApp(opts.tenantPhone, 'booking_confirmation_tenant', {
        tenant_name: opts.tenantName,
        property_name: opts.propertyName,
        bed_number: opts.bedNumber,
        move_in_date: opts.moveInDate,
        booking_id: opts.bookingId,
      }),
      this.sendWhatsApp(opts.ownerPhone, 'booking_notification_owner', {
        owner_name: opts.ownerName,
        tenant_name: opts.tenantName,
        property_name: opts.propertyName,
        bed_number: opts.bedNumber,
        move_in_date: opts.moveInDate,
        commission_amount: opts.commissionAmount,
      }),
      this.sendEmail(
        opts.tenantEmail,
        `Booking Confirmed — ${opts.propertyName}`,
        `<p>Hi ${opts.tenantName}, your booking at ${opts.propertyName} (Bed ${opts.bedNumber}) is confirmed for ${opts.moveInDate}.</p>`,
      ),
    ]);
  }

  async notifyComplaintAcknowledged(
    tenantPhone: string,
    params: { tenant_name: string; complaint_category: string; complaint_id: string },
  ) {
    return this.sendWhatsApp(tenantPhone, 'complaint_acknowledged', params);
  }

  async notifyComplaintResolved(
    tenantPhone: string,
    params: { tenant_name: string; complaint_category: string; resolved_by: string },
  ) {
    return this.sendWhatsApp(tenantPhone, 'complaint_resolved', params);
  }

  async notifyDepositSettlement(
    tenantPhone: string,
    params: {
      tenant_name: string;
      refund_amount: string;
      deduction_amount: string;
      property_name: string;
    },
  ) {
    return this.sendWhatsApp(tenantPhone, 'deposit_settlement_proposed', params);
  }

  async notifyDepositRefundInitiated(
    tenantPhone: string,
    params: { tenant_name: string; amount: string; utr_number: string },
  ) {
    return this.sendWhatsApp(tenantPhone, 'deposit_refund_initiated', params);
  }
}
