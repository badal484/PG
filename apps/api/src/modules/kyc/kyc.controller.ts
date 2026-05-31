import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { InitiateKycDto, SubmitKycDocumentsDto, AdminVerifyKycDto } from './dto/kyc.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@roomly/database';

@ApiTags('KYC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate KYC process' })
  initiate(@CurrentUser('id') userId: string, @Body() dto: InitiateKycDto) {
    return this.kycService.initiate(userId, dto);
  }

  @Get('status/:requestId')
  status(@Param('requestId') requestId: string) {
    return { requestId, status: 'PENDING' };
  }

  @Post('callback')
  callback(@Body() body: any) {
    return { received: true, ...body };
  }

  @Post('manual')
  manual(@CurrentUser('id') userId: string, @Body() dto: InitiateKycDto) {
    return this.kycService.initiate(userId, { ...dto, method: 'MANUAL_UPLOAD' } as any);
  }

  @Post('verify-pan')
  verifyPan(@Body() body: any) {
    return { verified: true, panNumber: body.panNumber };
  }

  @Patch(':id/documents')
  @ApiOperation({ summary: 'Submit KYC documents' })
  submitDocuments(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitKycDocumentsDto,
  ) {
    return this.kycService.submitDocuments(id, userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my KYC records' })
  getMyKyc(@CurrentUser('id') userId: string) {
    return this.kycService.getMyKyc(userId);
  }

  @Get('admin/pending')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get all pending KYC records' })
  getPending() {
    return this.kycService.getPendingKyc();
  }

  @Patch(':id/admin/verify')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Verify or reject KYC' })
  adminVerify(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminVerifyKycDto,
  ) {
    return this.kycService.adminVerify(id, adminId, dto);
  }
}
