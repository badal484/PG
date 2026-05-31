// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiateKycDto, SubmitKycDocumentsDto, AdminVerifyKycDto } from './dto/kyc.dto';
import { KYCStatus, BookingStatus } from '@roomly/database';

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  async initiate(userId: string, dto: InitiateKycDto) {
    const existing = await this.prisma.kYCRecord.findFirst({
      where: { userId, status: { in: [KYCStatus.PENDING, KYCStatus.VERIFIED_DIGITAL, KYCStatus.VERIFIED_ASSISTED, KYCStatus.VERIFIED_MANUAL] } },
    });

    if (existing && [KYCStatus.VERIFIED_DIGITAL, KYCStatus.VERIFIED_ASSISTED, KYCStatus.VERIFIED_MANUAL].includes(existing.status)) {
      throw new BadRequestException('KYC already verified');
    }

    return this.prisma.kYCRecord.create({
      data: {
        userId,
        method: dto.method,
        status: KYCStatus.PENDING,
        aadhaarNumber: dto.aadhaarNumber,
      },
    });
  }

  async submitDocuments(kycId: string, userId: string, dto: SubmitKycDocumentsDto) {
    const record = await this.prisma.kYCRecord.findFirst({
      where: { id: kycId, userId },
    });

    if (!record) throw new NotFoundException('KYC record not found');

    return this.prisma.kYCRecord.update({
      where: { id: kycId },
      data: {
        ...dto,
        status: KYCStatus.PENDING,
      },
    });
  }

  async getMyKyc(userId: string) {
    return this.prisma.kYCRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminVerify(kycId: string, adminId: string, dto: AdminVerifyKycDto) {
    const record = await this.prisma.kYCRecord.findUnique({ where: { id: kycId } });
    if (!record) throw new NotFoundException('KYC record not found');

    const status = dto.status as KYCStatus;

    const updated = await this.prisma.kYCRecord.update({
      where: { id: kycId },
      data: {
        status,
        verifiedAt: [KYCStatus.VERIFIED_MANUAL, KYCStatus.VERIFIED_DIGITAL, KYCStatus.VERIFIED_ASSISTED].includes(status) ? new Date() : undefined,
        failureReason: dto.failureReason,
      },
    });

    // Mark booking as PENDING_PAYMENT if KYC verified and booking in PENDING_KYC
    if ([KYCStatus.VERIFIED_MANUAL, KYCStatus.VERIFIED_DIGITAL, KYCStatus.VERIFIED_ASSISTED].includes(status)) {
      await this.prisma.booking.updateMany({
        where: { tenantId: record.userId, status: BookingStatus.PENDING_KYC },
        data: { status: BookingStatus.PENDING_PAYMENT, kycRecordId: kycId },
      });

      await this.prisma.user.update({
        where: { id: record.userId },
        data: { isVerified: true },
      });
    }

    return updated;
  }

  async getPendingKyc() {
    return this.prisma.kYCRecord.findMany({
      where: { status: KYCStatus.PENDING },
      include: {
        user: { select: { id: true, phone: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
