import { Injectable, Logger } from '@nestjs/common';
import {
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
} from '@aws-sdk/client-ses';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly ses = new SESClient({ region: process.env.AWS_REGION ?? 'ap-south-1' });
  private readonly from = process.env.SES_FROM_EMAIL ?? 'noreply@roomly.in';

  async send(opts: SendEmailOptions): Promise<void> {
    if (!process.env.SES_FROM_EMAIL) {
      this.logger.debug(`[DEV] Email → ${opts.to}: ${opts.subject}`);
      return;
    }

    const toAddresses = Array.isArray(opts.to) ? opts.to : [opts.to];

    try {
      if (opts.attachments?.length) {
        await this.sendWithAttachments(toAddresses, opts);
      } else {
        await this.ses.send(new SendEmailCommand({
          Source: `ROOMLY <${this.from}>`,
          Destination: { ToAddresses: toAddresses },
          Message: {
            Subject: { Data: opts.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: this.wrapBranding(opts.html), Charset: 'UTF-8' },
              Text: { Data: opts.text ?? this.stripHtml(opts.html), Charset: 'UTF-8' },
            },
          },
        }));
      }
      this.logger.log(`Email sent to ${toAddresses.join(', ')}: ${opts.subject}`);
    } catch (err) {
      this.logger.error(`SES email failed to ${opts.to}: ${(err as Error).message}`);
    }
  }

  // ── Typed email methods ──────────────────────────────────────────────────────

  sendWelcome(to: string, name: string) {
    return this.send({
      to,
      subject: 'Welcome to ROOMLY 🏠',
      html: `
        <h2>Hi ${name}, welcome to ROOMLY!</h2>
        <p>Your account has been created. Start exploring verified PG accommodations near you.</p>
        <a href="${process.env.APP_URL ?? 'https://roomly.in'}" style="background:#e8471c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Explore Properties
        </a>
      `,
    });
  }

  sendBookingConfirmation(to: string, opts: {
    tenantName: string;
    propertyName: string;
    bedNumber: string;
    moveInDate: string;
    bookingId: string;
    agreementPdf?: Buffer;
  }) {
    const attachments = opts.agreementPdf
      ? [{ filename: `agreement-${opts.bookingId}.pdf`, content: opts.agreementPdf, contentType: 'application/pdf' }]
      : [];

    return this.send({
      to,
      subject: `Booking Confirmed — ${opts.propertyName}`,
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi ${opts.tenantName},</p>
        <p>Your booking at <strong>${opts.propertyName}</strong> (Bed ${opts.bedNumber}) is confirmed.</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold">Booking ID</td><td style="padding:8px">${opts.bookingId}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Move-in Date</td><td style="padding:8px">${opts.moveInDate}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Property</td><td style="padding:8px">${opts.propertyName}</td></tr>
        </table>
        ${opts.agreementPdf ? '<p>Your signed rental agreement is attached.</p>' : ''}
      `,
      attachments,
    });
  }

  sendRentReceipt(to: string, opts: {
    tenantName: string;
    month: string;
    amount: number;
    propertyName: string;
    receiptNumber: string;
    receiptPdf?: Buffer;
  }) {
    const attachments = opts.receiptPdf
      ? [{ filename: `receipt-${opts.receiptNumber}.pdf`, content: opts.receiptPdf, contentType: 'application/pdf' }]
      : [];

    return this.send({
      to,
      subject: `Rent Receipt — ${opts.month} | ${opts.propertyName}`,
      html: `
        <h2>Rent Receipt</h2>
        <p>Hi ${opts.tenantName},</p>
        <p>Your rent payment of <strong>₹${opts.amount.toLocaleString('en-IN')}</strong> for <strong>${opts.month}</strong> at ${opts.propertyName} has been received.</p>
        <p>Receipt No: <strong>${opts.receiptNumber}</strong></p>
        ${opts.receiptPdf ? '<p>PDF receipt attached for your records.</p>' : ''}
      `,
      attachments,
    });
  }

  sendOwnerWeeklyReport(to: string, opts: {
    ownerName: string;
    reportHtml: string;
    reportPdf?: Buffer;
  }) {
    const attachments = opts.reportPdf
      ? [{ filename: 'weekly-report.pdf', content: opts.reportPdf, contentType: 'application/pdf' }]
      : [];

    return this.send({
      to,
      subject: `ROOMLY Weekly Report — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      html: opts.reportHtml,
      attachments,
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private wrapBranding(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,sans-serif">
        <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:#1a1a2e;padding:20px 24px;display:flex;align-items:center">
            <span style="color:#e8471c;font-size:22px;font-weight:900;letter-spacing:-0.5px">ROOMLY</span>
          </div>
          <div style="padding:24px;color:#334155;font-size:15px;line-height:1.6">
            ${content}
          </div>
          <div style="background:#f8fafc;padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center">
            <p style="margin:0;font-size:12px;color:#94a3b8">
              © ${new Date().getFullYear()} ROOMLY · <a href="https://roomly.in" style="color:#e8471c">roomly.in</a>
              · You're receiving this because you have an account with ROOMLY.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private async sendWithAttachments(
    toAddresses: string[],
    opts: SendEmailOptions,
  ): Promise<void> {
    const boundary = `boundary_${Date.now()}`;
    const htmlBody = this.wrapBranding(opts.html);

    const parts: string[] = [
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlBody,
    ];

    for (const att of opts.attachments ?? []) {
      parts.push(
        `--${boundary}`,
        `Content-Type: ${att.contentType}; name="${att.filename}"`,
        `Content-Disposition: attachment; filename="${att.filename}"`,
        'Content-Transfer-Encoding: base64',
        '',
        att.content.toString('base64'),
      );
    }

    parts.push(`--${boundary}--`);

    const raw = [
      `From: ROOMLY <${this.from}>`,
      `To: ${toAddresses.join(', ')}`,
      `Subject: ${opts.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      ...parts,
    ].join('\r\n');

    await this.ses.send(new SendRawEmailCommand({
      RawMessage: { Data: Buffer.from(raw) },
    }));
  }
}
