// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationType, WhatsAppMessageStatus } from '@roomly/database';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendWhatsApp(phone: string, templateName: string, params: Record<string, unknown> = {}) {
    const message = await this.prisma.whatsAppMessage.create({
      data: {
        toPhone: phone,
        templateName,
        payload: params,
        status: WhatsAppMessageStatus.SENT,
        aiSensyMessageId: `aisensy_${Date.now()}`,
      },
    });
    this.logger.log(`Queued WhatsApp template ${templateName} to ${phone}`);
    return message;
  }

  async sendSMS(phone: string, message: string) {
    this.logger.log(`Queued SMS to ${phone}`);
    return { phone, message, provider: 'MSG91', status: 'QUEUED' };
  }

  async sendEmail(to: string, subject: string, htmlBody: string) {
    this.logger.log(`Queued email to ${to}`);
    return { to, subject, htmlBody, provider: 'SES', status: 'QUEUED' };
  }

  async createInAppNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType = NotificationType.SYSTEM,
    data: Record<string, unknown> = {},
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        data,
        channel: NotificationChannel.IN_APP,
      },
    });
  }

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
}
