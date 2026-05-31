import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Mirror the Prisma enum — avoids the workspace package resolution at compile time
const WA_STATUS = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  READ: 'READ',
} as const;
type WAStatus = (typeof WA_STATUS)[keyof typeof WA_STATUS];

interface AiSensyPayload {
  apiKey: string;
  campaignName: string;
  destination: string;
  userName: string;
  templateParams: string[];
  source?: string;
  media?: Record<string, string>;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiKey = process.env.AISENSY_API_KEY ?? '';
  private readonly baseUrl = process.env.AISENSY_BASE_URL ?? 'https://backend.aisensy.com/campaign/t1/api/v2';

  constructor(private readonly prisma: PrismaService) {}

  async sendWhatsAppMessage(
    phone: string,
    templateName: string,
    params: Record<string, string>,
  ): Promise<void> {
    const templateParams = this.buildTemplateParams(templateName, params);
    if (!templateParams) {
      this.logger.warn(`Unknown WhatsApp template: ${templateName}`);
      return;
    }

    const payload: AiSensyPayload = {
      apiKey: this.apiKey,
      campaignName: templateName,
      destination: this.normalizePhone(phone),
      userName: params.tenant_name ?? params.owner_name ?? 'User',
      templateParams,
      source: 'ROOMLY',
    };

    let aiSensyMessageId: string | null = null;
    let status: WAStatus = WA_STATUS.SENT;
    let errorMessage: string | undefined;

    try {
      if (this.apiKey) {
        const res = await fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const body = await res.json().catch(() => ({})) as Record<string, unknown>;

        if (!res.ok) {
          throw new Error(`AiSensy error ${res.status}: ${JSON.stringify(body)}`);
        }

        aiSensyMessageId = (body as any)?.id ?? `aisensy_${Date.now()}`;
        status = WA_STATUS.DELIVERED;
      } else {
        aiSensyMessageId = `dev_${Date.now()}`;
        this.logger.debug(`[DEV] WhatsApp ${templateName} → ${phone}: ${JSON.stringify(params)}`);
      }
    } catch (err) {
      status = WA_STATUS.FAILED;
      errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`WhatsApp send failed for ${phone} [${templateName}]: ${errorMessage}`);
    }

    await (this.prisma.whatsAppMessage.create as any)({
      data: {
        toPhone: phone,
        templateName,
        payload: params as any,
        status,
        aiSensyMessageId: aiSensyMessageId ?? `err_${Date.now()}`,
        errorMessage,
      },
    }).catch((dbErr: Error) => {
      this.logger.error(`Failed to log WhatsApp message to DB: ${dbErr.message}`);
    });
  }

  // ── Template param builders ──────────────────────────────────────────────────

  private buildTemplateParams(
    templateName: string,
    p: Record<string, string>,
  ): string[] | null {
    switch (templateName) {
      case 'otp_delivery':
        return [p.otp, p.expiry_minutes];

      case 'booking_confirmation_tenant':
        return [p.tenant_name, p.property_name, p.bed_number, p.move_in_date, p.booking_id];

      case 'booking_notification_owner':
        return [p.owner_name, p.property_name, p.tenant_name, p.bed_number, p.move_in_date, p.commission_amount];

      case 'rent_reminder':
        return [p.tenant_name, p.amount, p.property_name, p.due_date];

      case 'rent_overdue':
        return [p.tenant_name, p.amount, p.property_name, p.days_overdue];

      case 'rent_received_cash':
        return [p.tenant_name, p.amount, p.month, p.property_name, p.receipt_number];

      case 'complaint_acknowledged':
        return [p.tenant_name, p.complaint_category, p.complaint_id];

      case 'complaint_resolved':
        return [p.tenant_name, p.complaint_category, p.resolved_by];

      case 'deposit_settlement_proposed':
        return [p.tenant_name, p.property_name, p.refund_amount, p.deduction_amount];

      case 'deposit_refund_initiated':
        return [p.tenant_name, p.amount, p.utr_number];

      case 'notice_acknowledged':
        return [p.tenant_name, p.property_name, p.move_out_date];

      case 'weekly_digest_owner':
        return [
          p.owner_name,
          p.total_properties,
          p.occupancy_percent,
          p.rent_collected,
          p.rent_pending,
          p.new_bookings,
        ];

      default:
        return null;
    }
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('91') ? `+${digits}` : `+91${digits}`;
  }
}
