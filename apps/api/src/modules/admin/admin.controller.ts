import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard') dashboard() { return this.admin.dashboard(); }
  @Get('properties/pending-verification') pendingProperties() { return this.admin.pendingProperties(); }
  @Post('properties/:id/approve-verification') approve(@Param('id') id: string, @CurrentUser('id') adminId: string, @Body() body: any) { return this.admin.approveProperty(id, adminId, body); }
  @Post('properties/:id/reject-verification') reject(@Param('id') id: string, @Body('reason') reason: string) { return this.admin.rejectProperty(id, reason); }
  @Get('bookings') bookings(@Query() query: any) { return this.admin.bookings(query); }
  @Get('disputes') disputes() { return this.admin.disputes(); }
  @Post('disputes/:settlementId/resolve') resolve(@Param('settlementId') settlementId: string, @CurrentUser('id') adminId: string, @Body() body: any) { return this.admin.resolveDispute(settlementId, body, adminId); }
  @Get('escrow') escrow() { return this.admin.escrow(); }
  @Get('commissions') commissions() { return this.admin.commissions(); }
  @Get('users') users() { return this.admin.users(); }
  @Put('users/:id/suspend') suspend(@Param('id') id: string) { return this.admin.suspendUser(id); }
  @Get('audit-log') auditLog() { return this.admin.auditLog(); }
  @Get('platform-analytics') analytics() { return this.admin.analytics(); }
}
