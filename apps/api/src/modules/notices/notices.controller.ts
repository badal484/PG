import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@roomly/database';

@ApiTags('Notices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WARDEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Issue a move-out notice' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateNoticeDto) {
    return this.noticesService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my notices (tenant)' })
  getMyNotices(@CurrentUser('id') tenantId: string) {
    return this.noticesService.findMyNotices(tenantId);
  }

  @Get('property/:propertyId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WARDEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all notices for a property' })
  getPropertyNotices(@Param('propertyId') propertyId: string) {
    return this.noticesService.findByProperty(propertyId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update notice' })
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Patch(':id/withdraw')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Withdraw a notice' })
  withdraw(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.noticesService.withdraw(id, userId);
  }
}
