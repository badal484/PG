import { Injectable } from '@nestjs/common';
import { PropertyTier, VerificationStatus } from '@roomly/database';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [gmv, activeProperties, tenants, disputes, pendingVerifications] = await Promise.all([
      this.prisma.payment.aggregate({ where: { status: 'CAPTURED' }, _sum: { amount: true } }),
      this.prisma.property.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'TENANT' } }),
      this.prisma.depositSettlement.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      this.prisma.property.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
    ]);
    return { gmv: gmv._sum.amount ?? 0, activeProperties, tenants, disputes, pendingVerifications };
  }

  pendingProperties() {
    return this.prisma.property.findMany({ where: { verificationStatus: VerificationStatus.PENDING }, orderBy: { createdAt: 'asc' } });
  }

  approveProperty(id: string, adminId: string, body: any) {
    return this.prisma.property.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        tier: body.tier ?? PropertyTier.VERIFIED_STANDARD,
        verifiedByUserId: adminId,
        verifiedAt: new Date(),
        isListed: true,
      },
    });
  }

  rejectProperty(id: string, reason: string) {
    return this.prisma.property.update({ where: { id }, data: { verificationStatus: VerificationStatus.REJECTED, metaDescription: reason } });
  }

  bookings(query: any) {
    return this.prisma.booking.findMany({ where: query.status ? { status: query.status } : {}, include: { tenant: true, property: true }, take: Number(query.limit ?? 50), orderBy: { createdAt: 'desc' } });
  }

  disputes() { return this.prisma.depositSettlement.findMany({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } }, orderBy: { createdAt: 'desc' } }); }
  resolveDispute(settlementId: string, body: any, adminId: string) { return this.prisma.depositSettlement.update({ where: { id: settlementId }, data: { ...body, resolvedByAdminId: adminId, resolvedAt: new Date() } }); }
  escrow() { return this.prisma.escrowAccount.findMany({ include: { booking: true }, orderBy: { createdAt: 'desc' } }); }
  commissions() { return this.prisma.commission.findMany({ orderBy: { createdAt: 'desc' } }); }
  users() { return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); }
  suspendUser(id: string) { return this.prisma.user.update({ where: { id }, data: { isActive: false } }); }
  auditLog() { return this.prisma.adminActionLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); }
  analytics() { return this.prisma.propertyAnalytics.findMany({ orderBy: { date: 'desc' }, take: 100 }); }
}
