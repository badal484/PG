import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../cache/redis.service';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = {
  session: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockRedis = {
  setOTP: jest.fn(),
  getOTP: jest.fn(),
  deleteOTP: jest.fn(),
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('creates a session and returns message', async () => {
      mockPrisma.session.create.mockResolvedValueOnce({ id: 'sess-1', otpExpiry: new Date() });

      const result = await service.sendOtp({ phone: '9876543210' });

      expect(result.message).toMatch(/OTP/i);
      expect(mockPrisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: expect.any(String) }),
        }),
      );
    });

    it('normalizes phone number', async () => {
      mockPrisma.session.create.mockResolvedValueOnce({ id: 'sess-2', otpExpiry: new Date() });
      await service.sendOtp({ phone: '+91 98765 43210' });
      // Should not throw
    });
  });

  describe('verifyOtp', () => {
    it('returns tokens on valid OTP', async () => {
      mockPrisma.session.findFirst.mockResolvedValueOnce({
        id: 'sess-1',
        otpHash: '$2a$10$hash',
        otpExpiry: new Date(Date.now() + 60_000),
        isUsed: false,
      });
      mockPrisma.user.upsert.mockResolvedValueOnce({
        id: 'user-1',
        phone: '9876543210',
        role: 'TENANT',
        firstName: null,
        isActive: true,
      });
      mockPrisma.session.update.mockResolvedValueOnce({});
      mockPrisma.refreshToken.create.mockResolvedValueOnce({ token: 'refresh-token' });

      // In dev mode OTP is always '123456'
      const result = await service.verifyOtp({ phone: '9876543210', otp: '123456' });

      expect(result).toHaveProperty('accessToken');
    });

    it('throws on expired OTP', async () => {
      mockPrisma.session.findFirst.mockResolvedValueOnce({
        id: 'sess-1',
        otpHash: '$2a$10$hash',
        otpExpiry: new Date(Date.now() - 1000), // expired
        isUsed: false,
      });

      await expect(service.verifyOtp({ phone: '9876543210', otp: '123456' })).rejects.toThrow();
    });
  });
});
