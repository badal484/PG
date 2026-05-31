import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StayType, BookingStatus, BookingSourceType } from '@roomly/database';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ description: 'Bed ID to book' })
  @IsString()
  @IsNotEmpty()
  bedId: string;

  @ApiProperty({ enum: StayType })
  @IsEnum(StayType)
  stayType: StayType;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  moveInDate: string;

  @ApiPropertyOptional({ example: '2024-08-01' })
  @IsOptional()
  @IsDateString()
  moveOutDate?: string;

  @ApiPropertyOptional({ enum: BookingSourceType })
  @IsOptional()
  @IsEnum(BookingSourceType)
  source?: BookingSourceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}

export class ListBookingsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
