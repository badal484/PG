import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OwnerService } from './owner.service';

@ApiTags('Owner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('owner')
export class OwnerController {
  constructor(private readonly owner: OwnerService) {}

  @Get('dashboard') dashboard(@CurrentUser('id') ownerId: string) { return this.owner.dashboard(ownerId); }
  @Get('properties') properties(@CurrentUser('id') ownerId: string) { return this.owner.properties(ownerId); }
  @Get('finance/pl') profitLoss(@CurrentUser('id') ownerId: string, @Query() query: any) { return this.owner.profitLoss(ownerId, query); }
  @Get('finance/expenses') expenses(@CurrentUser('id') ownerId: string) { return this.owner.expenses(ownerId); }
  @Get('analytics/occupancy') occupancy(@CurrentUser('id') ownerId: string) { return this.owner.occupancy(ownerId); }
  @Get('analytics/revenue') revenue(@CurrentUser('id') ownerId: string) { return this.owner.revenue(ownerId); }
  @Get('team') team(@CurrentUser('id') ownerId: string) { return this.owner.team(ownerId); }
  @Post('team') addTeam(@CurrentUser('id') ownerId: string, @Body() body: any) { return this.owner.addTeamMember(ownerId, body); }
  @Put('team/:staffId/assign') assign(@Param('staffId') staffId: string, @Body('propertyId') propertyId: string) { return this.owner.assignStaff(staffId, propertyId); }
  @Get('subscription') subscription(@CurrentUser('id') ownerId: string) { return this.owner.subscription(ownerId); }
  @Put('subscription') updateSubscription(@CurrentUser('id') ownerId: string, @Body() body: any) { return this.owner.updateSubscription(ownerId, body); }
  @Get('commissions') commissions(@CurrentUser('id') ownerId: string) { return this.owner.commissions(ownerId); }
}
