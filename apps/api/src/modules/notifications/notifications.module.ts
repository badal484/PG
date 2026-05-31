import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { WhatsAppService } from './whatsapp.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { QUEUE } from '../jobs/queues';

const redisConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
};

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: QUEUE.NOTIFICATION, connection: redisConnection }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, WhatsAppService, SmsService, EmailService],
  exports: [NotificationsService, WhatsAppService, SmsService, EmailService],
})
export class NotificationsModule {}
