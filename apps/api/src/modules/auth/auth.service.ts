import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@roomly/database';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string; expiresInSeconds: number }> {
    const { phone } = dto;

    // Generate 6-digit OTP
    const otp = process.env.NODE_ENV === 'development' ? '123456' : this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in session
    await this.prisma.session.create({
      data: {
        userId: await this.getOrCreateTempUserId(phone),
        otpHash,
        otpExpiry,
        isUsed: false,
      },
    });

    // In production, send via SMS gateway (MSG91, etc.)
    if (process.env.NODE_ENV !== 'development') {
      await this.sendSms(phone, otp);
    } else {
      this.logger.debug(`[DEV] OTP for ${phone}: ${otp}`);
    }

    return { message: 'OTP sent successfully', expiresInSeconds: 600 };
  }

  async verifyOtp(dto: VerifyOtpDto, ipAddress?: string, userAgent?: string) {
    const { phone, otp, role } = dto;

    // Find the user or create one
    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // New user — create with given role
      user = await this.prisma.user.create({
        data: {
          phone,
          role: role || UserRole.TENANT,
          isActive: true,
        },
      });
    }

    // Find valid (unused, not expired) OTP session
    const session = await this.prisma.session.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        otpExpiry: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      throw new BadRequestException('OTP not found or expired. Please request a new OTP.');
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, session.otpHash);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark OTP as used
    await this.prisma.session.update({
      where: { id: session.id },
      data: { isUsed: true, ipAddress, userAgent },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), phoneVerified: true },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.phone, user.role);

    const isNewUser = !user.firstName;

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
      isNewUser,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      select: { id: true, phone: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.phone, user.role);

    return { accessToken, refreshToken };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantProfile: true,
        ownerProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string, phone: string, role: string) {
    const payload = { sub: userId, phone, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async getOrCreateTempUserId(phone: string): Promise<string> {
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing) return existing.id;

    const newUser = await this.prisma.user.create({
      data: { phone, isActive: true },
    });
    return newUser.id;
  }

  private async sendSms(phone: string, otp: string): Promise<void> {
    // Integration with MSG91 or AWS SNS goes here
    this.logger.log(`Sending OTP to ${phone}`);
    // TODO: Implement actual SMS gateway
  }
}
