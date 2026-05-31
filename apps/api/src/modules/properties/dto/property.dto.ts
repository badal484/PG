import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  IsLatitude,
  IsLongitude,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  PropertyStyle,
  GenderPolicy,
  AudienceTarget,
  BedStatus,
  BalconyType,
  BathroomType,
  RoomSharingType,
  PhotoType,
  TourType,
  PropertyTier,
} from '@roomly/database';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sunrise PG for Girls' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '42, MG Road' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Bengaluru' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Karnataka' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '560001' })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiPropertyOptional({ example: 12.9716 })
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: 77.5946 })
  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ enum: PropertyStyle })
  @IsEnum(PropertyStyle)
  propertyStyle: PropertyStyle;

  @ApiProperty({ enum: GenderPolicy })
  @IsEnum(GenderPolicy)
  genderPolicy: GenderPolicy;

  @ApiProperty({ enum: AudienceTarget })
  @IsEnum(AudienceTarget)
  audienceTarget: AudienceTarget;

  // Amenities
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasGym?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasWorkspace?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasGamingArea?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasWashingMachine?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasParkingBike?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasParkingCar?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasAC?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasWifi?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() wifiSpeedMbps?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasDailyCleaning?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasHotWater24x7?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasElectricity24x7?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasFood?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() mealsPerDay?: number;

  // Policies
  @ApiPropertyOptional() @IsOptional() @IsString() visitorPolicy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() foodTimings?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() curfew?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rules?: string;

  // Stay types
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowDailyStay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowWeeklyStay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowMonthlyStay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowLongTermStay?: boolean;

  // Pricing
  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  commissionRate?: number;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class CreateFloorDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  floorNumber: number;

  @ApiPropertyOptional({ example: 'Ground Floor' })
  @IsOptional()
  @IsString()
  floorName?: string;

  @ApiPropertyOptional({ enum: GenderPolicy })
  @IsOptional()
  @IsEnum(GenderPolicy)
  genderPolicy?: GenderPolicy;
}

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiPropertyOptional({ example: 'Sea View Room' })
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiProperty({ enum: RoomSharingType })
  @IsEnum(RoomSharingType)
  sharingType: RoomSharingType;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasAC?: boolean;

  @ApiProperty({ enum: BathroomType })
  @IsEnum(BathroomType)
  bathroomType: BathroomType;

  @ApiProperty({ enum: BalconyType })
  @IsEnum(BalconyType)
  balconyType: BalconyType;

  @ApiPropertyOptional() @IsOptional() @IsNumber() areaSquareFeet?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lengthFt?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() breadthFt?: number;
}

export class CreateBedDto {
  @ApiProperty({ example: 'A1' })
  @IsString()
  @IsNotEmpty()
  bedNumber: string;

  @ApiPropertyOptional({ example: 'Window Bed' })
  @IsOptional()
  @IsString()
  bedLabel?: string;

  @ApiProperty({ example: 8500 })
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isListedOnMarketplace?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  availableFrom?: Date;
}

export class UpdateBedDto extends PartialType(CreateBedDto) {
  @ApiPropertyOptional({ enum: BedStatus })
  @IsOptional()
  @IsEnum(BedStatus)
  status?: BedStatus;
}

export class SearchPropertiesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
  @ApiPropertyOptional({ enum: GenderPolicy }) @IsOptional() @IsEnum(GenderPolicy) genderPolicy?: GenderPolicy;
  @ApiPropertyOptional({ enum: PropertyStyle }) @IsOptional() @IsEnum(PropertyStyle) propertyStyle?: PropertyStyle;
  @ApiPropertyOptional({ enum: AudienceTarget }) @IsOptional() @IsEnum(AudienceTarget) audienceTarget?: AudienceTarget;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() minRent?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() maxRent?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) hasFood?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) hasGym?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) hasAC?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) hasWifi?: boolean;
  @ApiPropertyOptional({ enum: PropertyTier }) @IsOptional() @IsEnum(PropertyTier) tier?: PropertyTier;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsNumber() limit?: number = 20;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
}

export class AddPhotoDto {
  @ApiProperty() @IsString() @IsNotEmpty() url: string;
  @ApiPropertyOptional() @IsOptional() @IsString() thumbnailUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() altText?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isHero?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() displayOrder?: number;
  @ApiProperty({ enum: PhotoType }) @IsEnum(PhotoType) photoType: PhotoType;
}
