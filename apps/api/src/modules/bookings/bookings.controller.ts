import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto, ListBookingsQueryDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@roomly/database';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'Initiate a bed booking (creates 15-min Redis hold)' })
  create(@CurrentUser('id') tenantId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.initiateBooking(tenantId, dto);
  }

  @Post('initiate')
  @Roles(UserRole.TENANT)
  initiate(@CurrentUser('id') tenantId: string, @Body() dto: CreateBookingDto) {
    return this.create(tenantId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings (tenant)' })
  getMyBookings(@CurrentUser('id') tenantId: string, @Query() query: ListBookingsQueryDto) {
    return this.bookingsService.getMyBookings(tenantId, query);
  }

  @Get('property/:propertyId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WARDEN, UserRole.ACCOUNTANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all bookings for a property' })
  getPropertyBookings(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') ownerId: string,
    @Query() query: ListBookingsQueryDto,
  ) {
    return this.bookingsService.getPropertyBookings(propertyId, ownerId, query);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] List all bookings across platform' })
  adminListAll(@Query() query: ListBookingsQueryDto) {
    return this.bookingsService.adminListBookings(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.findOne(id, userId);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Move booking from PENDING_PAYMENT to PENDING_AGREEMENT' })
  confirmBooking(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.confirmBooking(id, userId);
  }

  @Post(':id/payment-complete')
  paymentComplete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.confirmBooking(id, userId);
  }

  @Post(':id/kyc-complete')
  kycComplete(@Param('id') id: string) {
    return { bookingId: id, kycStatus: 'VERIFIED_DIGITAL' };
  }

  @Post(':id/agreement-signed')
  agreementSigned(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.activateBooking(id, userId);
  }

  @Post(':id/confirm-movein')
  confirmMoveIn(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.activateBooking(id, userId);
  }

  @Patch(':id/activate')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WARDEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate confirmed booking (owner action — after agreement signed)' })
  activateBooking(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.activateBooking(id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (tenant or owner)' })
  cancelBooking(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelBooking(id, userId, reason);
  }

  @Post(':id/cancel')
  cancelBookingPost(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.cancelBooking(id, userId, reason);
  }

  @Post(':id/give-notice')
  giveNotice(@Param('id') id: string, @Body() body: any) {
    return { bookingId: id, notice: body };
  }

  @Post(':id/emergency-exit')
  emergencyExit(@Param('id') id: string, @Body() body: any) {
    return { bookingId: id, emergencyExit: body };
  }

  @Post(':id/no-show')
  noShow(@Param('id') id: string) {
    return { bookingId: id, status: 'NO_SHOW' };
  }

  @Put(':id/update-movein-date')
  updateMoveIn(@Param('id') id: string, @Body('moveInDate') moveInDate: string) {
    return { bookingId: id, moveInDate };
  }

  @Post('walkin')
  walkIn(@Body() body: any) {
    return { sourceType: 'WALK_IN_OFFLINE', ...body };
  }
}
