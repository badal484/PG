import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType, PaymentMode } from '@roomly/database';

export class CreatePaymentOrderDto {
  @ApiProperty({ description: 'Booking ID to create payment for' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({ description: 'Amount in INR (paisa for Razorpay)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Razorpay order ID' })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({ description: 'Razorpay payment ID' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({ description: 'Razorpay signature' })
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;

  @ApiProperty({ description: 'Internal payment record ID' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}

export class MarkRentPaidDto {
  @ApiProperty({ description: 'Rent record ID' })
  @IsString()
  @IsNotEmpty()
  rentRecordId: string;

  @ApiProperty({ enum: PaymentMode })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ApiPropertyOptional({ description: 'Transaction reference or receipt number' })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class InitiateRefundDto {
  @ApiProperty({ description: 'Payment ID to refund' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiPropertyOptional({ description: 'Amount to refund (partial). If not provided, full refund.' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
