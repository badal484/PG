import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RazorpayRouteService } from './razorpay-route.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayRouteService],
  exports: [PaymentsService, RazorpayRouteService],
})
export class PaymentsModule {}
