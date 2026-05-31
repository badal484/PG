import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentType, PaymentStatus, BookingStatus } from '@roomly/database';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockBooking = {
  id: 'booking-1',
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  propertyId: 'prop-1',
  status: BookingStatus.PENDING_PAYMENT,
  depositAmount: 20000,
  firstMonthRent: 12000,
  platformFee: 500,
  commissionAmount: 1200,
  commissionRate: 10,
  monthlyRent: 12000,
  property: { id: 'prop-1', name: 'Test PG' },
};

const mockPrisma = {
  booking: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
  rentRecord: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  escrow: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  depositSettlement: {
    create: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  describe('createPaymentOrder', () => {
    it('creates order for deposit payment', async () => {
      mockPrisma.booking.findUnique.mockResolvedValueOnce(mockBooking);
      mockPrisma.payment.create.mockResolvedValueOnce({ id: 'pay-1', amount: 20000 });

      const result = await service.createPaymentOrder('tenant-1', {
        bookingId: 'booking-1',
        type: PaymentType.DEPOSIT,
      });

      expect(result).toHaveProperty('razorpayOrderId');
      expect(result.amount).toBe(2_000_000); // 20000 * 100 paise
    });

    it('throws NotFoundException for invalid booking', async () => {
      mockPrisma.booking.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createPaymentOrder('tenant-1', { bookingId: 'bad-id', type: PaymentType.DEPOSIT }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if not tenant booking', async () => {
      mockPrisma.booking.findUnique.mockResolvedValueOnce(mockBooking);

      await expect(
        service.createPaymentOrder('other-user', { bookingId: 'booking-1', type: PaymentType.DEPOSIT }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyPayment', () => {
    it('throws BadRequestException on invalid signature', async () => {
      await expect(
        service.verifyPayment({
          razorpayOrderId: 'order_123',
          razorpayPaymentId: 'pay_123',
          razorpaySignature: 'invalid_signature',
          paymentId: 'internal-pay-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('initiateRefund', () => {
    it('throws if payment is not in CAPTURED state', async () => {
      mockPrisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: PaymentStatus.PENDING,
        amount: 5000,
      });

      await expect(
        service.initiateRefund({ paymentId: 'pay-1', amount: 5000, reason: 'test' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if refund amount exceeds payment', async () => {
      mockPrisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: PaymentStatus.CAPTURED,
        amount: 5000,
      });

      await expect(
        service.initiateRefund({ paymentId: 'pay-1', amount: 10000, reason: 'test' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('processes full refund successfully', async () => {
      mockPrisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: PaymentStatus.CAPTURED,
        amount: 5000,
      });
      mockPrisma.payment.update.mockResolvedValueOnce({ id: 'pay-1', status: PaymentStatus.REFUNDED });

      const result = await service.initiateRefund(
        { paymentId: 'pay-1', amount: 5000, reason: 'tenant request' },
        'admin-1',
      );

      expect(result.success).toBe(true);
      expect(result.refundAmount).toBe(5000);
    });
  });
});
