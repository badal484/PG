// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async sync(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { beds: true, photos: { where: { isHero: true }, take: 1 }, reviews: true },
    });
    return { objectID: propertyId, synced: Boolean(property), record: property };
  }

  async syncAll() {
    const properties = await this.prisma.property.findMany({ where: { isActive: true, isListed: true }, select: { id: true } });
    return { synced: properties.length, propertyIds: properties.map((property: any) => property.id) };
  }

  suggest(q = '') {
    return this.prisma.property.findMany({
      where: {
        isActive: true,
        isListed: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { locality: { contains: q, mode: 'insensitive' } },
          { pincode: { contains: q } },
        ],
      },
      select: { id: true, name: true, slug: true, city: true, pincode: true, mainPhotoUrl: true },
      take: 10,
    });
  }
}
