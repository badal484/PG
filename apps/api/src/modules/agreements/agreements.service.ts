import { Injectable, NotFoundException } from '@nestjs/common';
import { AgreementStatus } from '@roomly/database';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgreementsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tenant: true, owner: true, property: true },
    });
    if (!booking) throw new NotFoundException({ code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });

    const content = [
      `Rent Agreement for ${booking.property.name}`,
      `Tenant: ${booking.tenant.firstName ?? booking.tenant.phone}`,
      `Property: ${booking.property.addressLine1}, ${booking.property.city}`,
      `Rent: INR ${booking.monthlyRent}`,
      `Deposit: INR ${booking.depositAmount}`,
      `Move-in: ${booking.moveInDate.toISOString().slice(0, 10)}`,
      `Notice period: ${booking.noticePeriodDays} days`,
      `Rules: ${booking.property.rules ?? 'As published by the property'}`,
      'Platform terms: Booking, rent, refund and dispute actions are governed by ROOMLY policies.',
    ].join('\n');

    return this.prisma.agreement.create({
      data: {
        bookingId,
        tenantId: booking.tenantId,
        ownerId: booking.ownerId,
        propertyId: booking.propertyId,
        status: AgreementStatus.DRAFT,
        templateVersion: 'v1',
        content,
      },
    });
  }

  get(id: string) {
    return this.prisma.agreement.findUnique({ where: { id }, include: { booking: true, property: true } });
  }

  pdf(id: string) {
    return this.prisma.agreement.findUnique({ where: { id }, select: { id: true, pdfUrl: true, content: true } });
  }

  sendForSign(id: string) {
    return this.prisma.agreement.update({
      where: { id },
      data: {
        status: AgreementStatus.SENT,
        digioRequestId: `digio_${Date.now()}`,
      },
    });
  }

  digioCallback(payload: any) {
    return this.prisma.agreement.updateMany({
      where: { digioRequestId: payload.requestId ?? payload.digioRequestId },
      data: { status: AgreementStatus.SIGNED, tenantSignedAt: new Date(), pdfUrl: payload.pdfUrl },
    });
  }
}
