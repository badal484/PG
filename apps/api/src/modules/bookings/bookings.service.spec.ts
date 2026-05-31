import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../cache/redis.service';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockBed = {
  id: 'bed-1',
  propertyId: 'prop-1',
  status: 'VACANT',
  monthlyRent: 12000,
  depositAmount: 20000,
  isListedOnMarketplace: true,
  property: {
    id: 'prop-1',
    ownerId: 'owner-1',
    name: 'Test PG',
    platformFee: 500,
    commissionRate: 10,
    allowMonthlyStay: true,
  },
};

const mockPrisma = {
  bed: { findUnique: jest.fn(), update: jest.fn() },
  booking: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
};

const mockSearch = { syncPropertyToAlgolia: jest.fn() };
const mockNotif = { notifyBookingConfirmed: jest.fn() };
const mockRedis = { lockBed: jest.fn().mockResolvedValue(true), unlockBed: jest.fn() };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SearchService, useValue: mockSearch },
        { provide: NotificationsService, useValue: mockNotif },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates booking for vacant bed', async () => {
      mockPrisma.bed.findUnique.mockResolvedValueOnce(mockBed);
      mockPrisma.booking.create.mockResolvedValueOnce({
        id: 'booking-1',
        status: 'PENDING_KYC',
        bedId: 'bed-1',
        tenantId: 'tenant-1',
        monthlyRent: 12000,
        depositAmount: 20000,
      });

      const result = await service.initiateBooking('tenant-1', {
        bedId: 'bed-1',
        moveInDate: '2025-07-01',
        stayType: 'MONTHLY' as any,
      });

      expect(result).toHaveProperty('id', 'booking-1');
    });

    it('throws if bed is occupied', async () => {
      mockPrisma.bed.findUnique.mockResolvedValueOnce({ ...mockBed, status: 'OCCUPIED' });

      await expect(
        service.initiateBooking('tenant-1', {
          bedId: 'bed-1',
          moveInDate: '2025-07-01',
          stayType: 'MONTHLY' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for invalid bed', async () => {
      mockPrisma.bed.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.initiateBooking('tenant-1', {
          bedId: 'nonexistent',
          moveInDate: '2025-08-01',
          stayType: 'MONTHLY' as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
