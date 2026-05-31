import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RentService } from './rent.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@roomly/database';

@ApiTags('Rent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post('generate/:propertyId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate monthly rent records for all confirmed tenants' })
  generate(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') ownerId: string,
    @Body('month') month: number,
    @Body('year') year: number,
  ) {
    return this.rentService.generateMonthlyRent(propertyId, month, year, ownerId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my rent records (tenant)' })
  getMyRents(@CurrentUser('id') tenantId: string) {
    return this.rentService.getMyRents(tenantId);
  }

  @Get('property/:propertyId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all rent records for a property' })
  getPropertyRents(
    @Param('propertyId') propertyId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.rentService.getPropertyRents(
      propertyId,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('overview/:propertyId/:year')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get rent collection overview for a year' })
  getOverview(@Param('propertyId') propertyId: string, @Param('year') year: string) {
    return this.rentService.getRentOverview(propertyId, parseInt(year));
  }

  @Post('mark-overdue')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Mark all overdue pending rents' })
  markOverdue() {
    return this.rentService.markOverdueRents();
  }
}
