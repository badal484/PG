// @ts-nocheck
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { BookingStatus } from '@roomly/database';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateReviewDto) {
    // Validate booking belongs to tenant and is completed/confirmed
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: dto.bookingId,
        tenantId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
    });

    if (!booking) {
      throw new NotFoundException('No eligible booking found for this property');
    }

    // Check if review already exists for this booking
    const existing = await this.prisma.review.findFirst({
      where: { bookingId: dto.bookingId, tenantId },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this booking');
    }

    return this.prisma.review.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        bookingId: dto.bookingId,
        rating: dto.rating,
        foodRating: dto.foodRating,
        maintenanceRating: dto.maintenanceRating,
        staffRating: dto.staffRating,
        valueForMoneyRating: dto.valueForMoneyRating,
        comment: dto.comment,
        photoUrls: dto.photoUrls as any,
      },
    });
  }

  async findByProperty(propertyId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { propertyId, isPublished: true },
      include: {
        tenant: { select: { firstName: true, lastName: true, profilePhoto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return { reviews, avgRating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length };
  }

  async findMyReviews(tenantId: string) {
    return this.prisma.review.findMany({
      where: { tenantId },
      include: { property: { select: { id: true, name: true, city: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async moderateReview(reviewId: string, isPublished: boolean) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isPublished },
    });
  }
}
