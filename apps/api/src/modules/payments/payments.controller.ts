import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  MarkRentPaidDto,
  InitiateRefundDto,
} from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@roomly/database';
import { Request } from 'express';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('order')
  @ApiOperation({ summary: 'Create a Razorpay payment order' })
  createOrder(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentOrderDto) {
    return this.paymentsService.createPaymentOrder(userId, dto);
  }

  @Post('create-order')
  createOrderAlias(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentOrderDto) {
    return this.createOrder(userId, dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature and confirm payment' })
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Public()
  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook endpoint (public)' })
  razorpayWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleRazorpayWebhook(payload?.event, payload, signature);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(@Body() payload: any, @Headers('x-razorpay-signature') signature: string) {
    return this.razorpayWebhook(payload, signature);
  }

  @Post('rent/mark-paid')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mark rent as paid (cash/offline)' })
  markRentPaid(@CurrentUser('id') userId: string, @Body() dto: MarkRentPaidDto) {
    return this.paymentsService.markRentPaid(userId, dto);
  }

  @Post('rent/mark-cash')
  markRentCash(@CurrentUser('id') userId: string, @Body() dto: MarkRentPaidDto) {
    return this.markRentPaid(userId, dto);
  }

  @Post('rent/send-link')
  sendRentLink(@Body() body: any) {
    return { queued: true, channel: 'WHATSAPP', ...body };
  }

  @Get('rent/statement')
  rentStatement(@CurrentUser('id') userId: string) {
    return { userId, statement: [] };
  }

  @Post('deposit/settlement/:bookingId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Initiate deposit settlement with deductions' })
  initiateDepositSettlement(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') ownerId: string,
    @Body('deductions') deductions: Array<{ reason: string; amount: number }>,
  ) {
    return this.paymentsService.initiateDepositSettlement(bookingId, ownerId, deductions);
  }

  @Post('refund')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Initiate refund for a payment' })
  initiateRefund(@Body() dto: InitiateRefundDto, @CurrentUser('id') adminId: string) {
    return this.paymentsService.initiateRefund(dto, adminId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history for current user' })
  getHistory(@CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.paymentsService.getPaymentHistory(userId, role);
  }

  @Get('my')
  getMy(@CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.getHistory(userId, role);
  }

  @Get('booking/:bookingId')
  getBookingPayments(@Param('bookingId') bookingId: string) {
    return { bookingId, payments: [] };
  }
}
