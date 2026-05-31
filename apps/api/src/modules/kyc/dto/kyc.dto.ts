import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KYCMethod } from '@roomly/database';

export class InitiateKycDto {
  @ApiProperty({ enum: KYCMethod })
  @IsEnum(KYCMethod)
  method: KYCMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;
}

export class SubmitKycDocumentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarFrontUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarBackUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selfieUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  panNumber?: string;
}

export class AdminVerifyKycDto {
  @ApiProperty({ example: 'VERIFIED_MANUAL' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  failureReason?: string;
}
