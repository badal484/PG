import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WhatsAppService } from '../../notifications/whatsapp.service';
import { SmsService } from '../../notifications/sms.service';
import { EmailService } from '../../notifications/email.service';
import { QUEUE, JOB } from '../queues';

interface WhatsAppJob {
  phone: string;
  templateName: string;
  params: Record<string, string>;
}

interface SmsJob {
  phone: string;
  message: string;
}

interface EmailJob {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Processor(QUEUE.NOTIFICATION)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly whatsApp: WhatsAppService,
    private readonly sms: SmsService,
    private readonly email: EmailService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JOB.SEND_WHATSAPP: {
        const data = job.data as WhatsAppJob;
        await this.whatsApp.sendWhatsAppMessage(data.phone, data.templateName, data.params);
        break;
      }

      case JOB.SEND_SMS: {
        const data = job.data as SmsJob;
        await this.sms.sendSMS(data.phone, data.message);
        break;
      }

      case JOB.SEND_EMAIL: {
        const data = job.data as EmailJob;
        await this.email.send({ to: data.to, subject: data.subject, html: data.html, text: data.text });
        break;
      }

      default:
        this.logger.warn(`Unknown notification job: ${job.name}`);
    }
  }
}
