import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@roomly/database';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a review for a confirmed/completed booking' })
  create(@CurrentUser('id') tenantId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(tenantId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my submitted reviews' })
  getMyReviews(@CurrentUser('id') tenantId: string) {
    return this.reviewsService.findMyReviews(tenantId);
  }

  @Public()
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all published reviews for a property' })
  getPropertyReviews(@Param('propertyId') propertyId: string) {
    return this.reviewsService.findByProperty(propertyId);
  }

  @Patch(':id/moderate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Publish or unpublish a review' })
  moderate(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.reviewsService.moderateReview(id, isPublished);
  }
}
