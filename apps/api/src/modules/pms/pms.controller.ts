import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BedStatus, ComplaintStatus } from '@roomly/database';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PmsService } from './pms.service';

// ── /pms/my-properties — standalone endpoint ─────────────────────────────────
@ApiTags('PMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pms')
export class PmsRootController {
  constructor(private readonly pms: PmsService) {}

  @Get('my-properties')
  myProperties(@CurrentUser('id') userId: string) {
    return this.pms.myProperties(userId);
  }
}

// ── /pms/:propertyId/* — property-scoped endpoints ───────────────────────────
@ApiTags('PMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pms/:propertyId')
export class PmsController {
  constructor(private readonly pms: PmsService) {}

  @Get('bedmap') bedMap(@Param('propertyId') propertyId: string) { return this.pms.bedMap(propertyId); }
  @Put('beds/:bedId/status') bedStatus(@Param('propertyId') propertyId: string, @Param('bedId') bedId: string, @Body('status') status: BedStatus) { return this.pms.updateBedStatus(propertyId, bedId, status); }
  @Put('beds/:bedId/maintenance') maintenance(@Param('propertyId') propertyId: string, @Param('bedId') bedId: string, @Body('enabled') enabled: boolean) { return this.pms.toggleMaintenance(propertyId, bedId, enabled); }
  @Get('rent') rent(@Param('propertyId') propertyId: string, @Query('month') month = `${new Date().getMonth() + 1}`, @Query('year') year = `${new Date().getFullYear()}`) { return this.pms.rent(propertyId, Number(month), Number(year)); }
  @Post('rent/:rentRecordId/mark-paid-cash') paid(@Param('propertyId') propertyId: string, @Param('rentRecordId') rentRecordId: string, @CurrentUser('id') userId: string) { return this.pms.markRentPaid(propertyId, rentRecordId, userId); }
  @Post('rent/send-reminders') reminders() { return { queued: true }; }
  @Post('rent/:rentRecordId/send-reminder') reminder(@Param('rentRecordId') rentRecordId: string) { return { queued: true, rentRecordId }; }
  @Get('rent/receipt/:rentRecordId') receipt(@Param('rentRecordId') rentRecordId: string) { return { rentRecordId, receiptUrl: null }; }
  @Get('complaints') complaints(@Param('propertyId') propertyId: string, @Query('status') status?: ComplaintStatus, @Query('category') category?: string) { return this.pms.listComplaints(propertyId, status, category); }
  @Post('complaints') createComplaint(@Param('propertyId') propertyId: string, @CurrentUser('id') userId: string, @Body() body: any) { return this.pms.createComplaint(propertyId, body.tenantId ?? userId, body); }
  @Put('complaints/:id') updateComplaint(@Param('id') id: string, @Body() body: any) { return this.pms.updateComplaint(id, body); }
  @Post('complaints/:id/escalate') escalate(@Param('id') id: string) { return this.pms.updateComplaint(id, { status: 'ESCALATED', escalatedAt: new Date() }); }
  @Post('complaints/:id/reopen') reopen(@Param('id') id: string) { return this.pms.updateComplaint(id, { status: 'OPEN', reopenCount: { increment: 1 } }); }
  @Get('tenants') tenants(@Param('propertyId') propertyId: string) { return this.pms.tenants(propertyId); }
  @Get('tenants/:tenantId') tenant(@Param('propertyId') propertyId: string, @Param('tenantId') tenantId: string) { return { propertyId, tenantId }; }
  @Put('tenants/:tenantId') updateTenant(@Param('tenantId') tenantId: string, @Body() body: any) { return { tenantId, ...body }; }
  @Post('bookings/:bookingId/inspection') inspection(@Param('bookingId') bookingId: string, @Body() body: any) { return { bookingId, inspection: body }; }
  @Put('bookings/:bookingId/inspection') updateInspection(@Param('bookingId') bookingId: string, @Body() body: any) { return { bookingId, inspection: body }; }
  @Post('bookings/:bookingId/propose-settlement') settlement(@Param('bookingId') bookingId: string, @Body() body: any) { return { bookingId, ...body }; }
  @Get('bookings/:bookingId/settlement') getSettlement(@Param('bookingId') bookingId: string) { return { bookingId }; }
  @Post('expenses') createExpense(@Param('propertyId') propertyId: string, @CurrentUser('id') userId: string, @Body() body: any) { return this.pms.createExpense(propertyId, userId, body); }
  @Get('expenses') expenses(@Param('propertyId') propertyId: string, @Query() query: any) { return this.pms.expenses(propertyId, query); }
  @Put('expenses/:id') updateExpense(@Param('id') id: string, @Body() body: any) { return { id, ...body }; }
  @Delete('expenses/:id') deleteExpense(@Param('id') id: string) { return { id, deleted: true }; }
  @Get('expenses/summary') expenseSummary(@Param('propertyId') propertyId: string, @Query('month') month?: string, @Query('year') year?: string) { return this.pms.expenseSummary(propertyId, month ? Number(month) : undefined, year ? Number(year) : undefined); }
  @Get('food-menu') foodMenu(@Param('propertyId') propertyId: string) { return this.pms.foodMenu(propertyId); }
  @Put('food-menu') upsertFoodMenu(@Param('propertyId') propertyId: string, @Body() body: any) { return this.pms.upsertFoodMenu(propertyId, Array.isArray(body) ? body : body.items); }
  @Get('food-menu/today') todayMenu(@Param('propertyId') propertyId: string) { return this.pms.todayMenu(propertyId); }
  @Get('food-ratings') foodRatings(@Param('propertyId') propertyId: string) { return this.pms.foodRatings(propertyId); }
  @Get('staff') staff(@Param('propertyId') propertyId: string) { return this.pms.staff(propertyId); }
  @Post('staff') addStaff(@Param('propertyId') propertyId: string, @Body() body: any) { return this.pms.addStaff(propertyId, body); }
  @Put('staff/:staffId') updateStaff(@Param('staffId') staffId: string, @Body() body: any) { return this.pms.updateStaff(staffId, body); }
  @Delete('staff/:staffId') removeStaff(@Param('staffId') staffId: string) { return this.pms.removeStaff(staffId); }
  @Post('staff/attendance') markAttendance(@Param('propertyId') propertyId: string, @Body() body: any) { return this.pms.attendance(propertyId, body); }
  @Get('staff/attendance') attendance(@Param('propertyId') propertyId: string) { return this.pms.attendance(propertyId); }
  @Get('visitors') visitors(@Param('propertyId') propertyId: string) { return this.pms.visitors(propertyId); }
  @Post('visitors') createVisitor(@Param('propertyId') propertyId: string, @Body() body: any) { return this.pms.createVisitor(propertyId, body); }
  @Put('visitors/:id') checkoutVisitor(@Param('id') id: string) { return this.pms.checkoutVisitor(id); }
  @Get('meters') meters(@Param('propertyId') propertyId: string) { return this.pms.meters(propertyId); }
  @Post('meters') addMeter(@Param('propertyId') propertyId: string, @Body() body: any) { return this.pms.addMeter(propertyId, body); }
  @Get('meters/bill/:roomId/:month/:year') meterBill(@Param() params: any) { return params; }
  @Get('assets') assets(@Param('propertyId') propertyId: string) { return this.pms.assets(propertyId); }
  @Post('assets') createAsset(@Param('propertyId') propertyId: string, @Body() body: any) { return this.pms.createAsset(propertyId, body); }
  @Put('assets/:id') updateAsset(@Param('id') id: string, @Body() body: any) { return this.pms.updateAsset(id, body); }
}
