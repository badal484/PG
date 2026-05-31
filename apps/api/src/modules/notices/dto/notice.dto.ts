import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NoticeStatus } from '@roomly/database';

export class CreateNoticeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantId?: string; // If null, notice is for all tenants

  @ApiProperty({ example: 'Serving 30-day move-out notice' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vacateDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  noticePeriodDays?: number;
}

export class UpdateNoticeDto {
  @ApiPropertyOptional({ enum: NoticeStatus })
  @IsOptional()
  @IsEnum(NoticeStatus)
  status?: NoticeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vacateDate?: string;
}
