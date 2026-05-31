import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  UpdateTenantProfileDto,
  UpdateOwnerProfileDto,
  ListUsersQueryDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@roomly/database';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get own profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get own profile' })
  getMe(@CurrentUser('id') userId: string) {
    return this.getMyProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update own profile' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.updateProfile(userId, dto);
  }

  @Patch('profile/tenant')
  @ApiOperation({ summary: 'Update tenant-specific profile' })
  updateTenantProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateTenantProfileDto) {
    return this.usersService.updateTenantProfile(userId, dto);
  }

  @Patch('profile/owner')
  @ApiOperation({ summary: 'Update owner banking/business profile' })
  updateOwnerProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateOwnerProfileDto) {
    return this.usersService.updateOwnerProfile(userId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get own usage statistics' })
  getMyStats(@CurrentUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Get('me/kyc')
  @ApiOperation({ summary: 'Get current user KYC status' })
  getMyKyc(@CurrentUser('id') userId: string) {
    return this.usersService.getKycStatus(userId);
  }

  @Post('me/kyc/initiate')
  @ApiOperation({ summary: 'Initiate current user KYC' })
  initiateKyc(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.usersService.initiateKyc(userId, body);
  }

  @Post('me/kyc/verify')
  @ApiOperation({ summary: 'Verify current user KYC' })
  verifyKyc(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.usersService.verifyKyc(userId, body);
  }

  @Get('me/notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  notifications(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.usersService.notifications(userId, query);
  }

  @Put('me/notifications/:id/read')
  @ApiOperation({ summary: 'Mark one notification read' })
  readNotification(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.readNotification(userId, id);
  }

  @Put('me/notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications read' })
  readAllNotifications(@CurrentUser('id') userId: string) {
    return this.usersService.readAllNotifications(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get any user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] List all users with filters' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Toggle user active/inactive status' })
  toggleStatus(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.usersService.toggleUserStatus(id, adminId);
  }
}
