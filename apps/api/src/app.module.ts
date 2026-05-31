import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { KycModule } from './modules/kyc/kyc.module';
import { NoticesModule } from './modules/notices/notices.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OwnerModule } from './modules/owner/owner.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PmsModule } from './modules/pms/pms.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { RentModule } from './modules/rent/rent.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SearchModule } from './modules/search/search.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    BookingsModule,
    PaymentsModule,
    KycModule,
    AgreementsModule,
    PmsModule,
    OwnerModule,
    AdminModule,
    NotificationsModule,
    SearchModule,
    UploadModule,
    ComplaintsModule,
    RentModule,
    NoticesModule,
    ExpensesModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
