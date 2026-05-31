import { Injectable, Logger } from '@nestjs/common';

interface Msg91OtpResponse {
  type: string;
  message: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly authKey = process.env.MSG91_AUTH_KEY ?? '';
  private readonly senderId = process.env.MSG91_SENDER_ID ?? 'ROOMLY';
  private readonly otpTemplateId = process.env.MSG91_OTP_TEMPLATE_ID ?? '';

  async sendOTP(phone: string): Promise<{ requestId: string }> {
    const normalized = this.normalizePhone(phone);

    if (!this.authKey) {
      this.logger.debug(`[DEV] OTP SMS → ${phone}`);
      return { requestId: `dev_otp_${Date.now()}` };
    }

    try {
      const url = new URL('https://api.msg91.com/api/v5/otp');
      url.searchParams.set('mobile', normalized);
      url.searchParams.set('authkey', this.authKey);
      url.searchParams.set('template_id', this.otpTemplateId);
      url.searchParams.set('sender', this.senderId);

      const res = await fetch(url.toString(), { method: 'POST' });
      const body = await res.json() as Msg91OtpResponse;

      if (!res.ok || body.type === 'error') {
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }

      this.logger.log(`OTP sent to ${phone}`);
      return { requestId: body.message };
    } catch (err) {
      this.logger.error(`MSG91 OTP failed for ${phone}: ${(err as Error).message}`);
      return { requestId: `fail_${Date.now()}` };
    }
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    const normalized = this.normalizePhone(phone);

    if (!this.authKey) {
      this.logger.debug(`[DEV] SMS → ${phone}: ${message}`);
      return;
    }

    try {
      const payload = {
        sender: this.senderId,
        route: '4',
        country: '91',
        sms: [{ message, to: [normalized] }],
      };

      const res = await fetch('https://api.msg91.com/api/v2/sendsms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: this.authKey,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      this.logger.log(`SMS sent to ${phone}`);
    } catch (err) {
      // Non-critical — log and continue
      this.logger.error(`MSG91 SMS failed for ${phone}: ${(err as Error).message}`);
    }
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('91') ? digits : `91${digits}`;
  }
}
