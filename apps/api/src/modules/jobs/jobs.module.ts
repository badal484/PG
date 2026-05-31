import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { QUEUE } from './queues';
import { SchedulersService } from './schedulers.service';
import { NotificationProcessor } from './processors/notification.processor';
import { SearchSyncProcessor } from './processors/search-sync.processor';
import { RentRecordProcessor } from './processors/rent-record.processor';
import { EscrowReleaseProcessor } from './processors/escrow-release.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { WhatsAppService } from '../notifications/whatsapp.service';
import { SmsService } from '../notifications/sms.service';
import { EmailService } from '../notifications/email.service';
import { AlgoliaService } from '../search/algolia.service';
import { RazorpayRouteService } from '../payments/razorpay-route.service';

const redisConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
};

const queues = Object.values(QUEUE).map((name) =>
  BullModule.registerQueue({ name, connection: redisConnection }),
);

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ...queues,
    PrismaModule,
  ],
  providers: [
    // Notification dependencies
    WhatsAppService,
    SmsService,
    EmailService,
    // Search
    AlgoliaService,
    // Payments
    RazorpayRouteService,
    // Schedulers & processors
    SchedulersService,
    NotificationProcessor,
    SearchSyncProcessor,
    RentRecordProcessor,
    EscrowReleaseProcessor,
    AnalyticsProcessor,
  ],
  exports: [
    WhatsAppService,
    SmsService,
    EmailService,
    AlgoliaService,
    RazorpayRouteService,
    BullModule,
  ],
})
export class JobsModule {}
