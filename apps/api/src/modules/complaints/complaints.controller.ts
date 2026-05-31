import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto, ListComplaintsQueryDto } from './dto/complaint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@roomly/database';

@ApiTags('Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'File a new complaint' })
  create(@CurrentUser('id') tenantId: string, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List complaints (role-filtered)' })
  findAll(
    @Query() query: ListComplaintsQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.complaintsService.findAll(query, userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.complaintsService.findOne(id, userId, role);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WARDEN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update complaint status or assign staff' })
  update(@Param('id') id: string, @Body() dto: UpdateComplaintDto, @CurrentUser('id') userId: string) {
    return this.complaintsService.update(id, dto, userId);
  }

  @Patch(':id/escalate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Escalate a complaint' })
  escalate(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.complaintsService.escalate(id, adminId);
  }
}
