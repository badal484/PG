import { Injectable, Logger } from '@nestjs/common';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { PrismaService } from '../../prisma/prisma.service';

export interface PropertySearchRecord {
  objectID: string;
  name: string;
  slug: string;
  city: string;
  locality: string;
  pincode: string;
  addressLine1: string;
  genderPolicy: string;
  tier: string;
  verificationStatus: string;
  isListed: boolean;
  mainPhotoUrl: string | null;
  availableBeds: number;
  totalBeds: number;
  minPrice: number;
  maxPrice: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  _geoloc?: { lat: number; lng: number };
}

@Injectable()
export class AlgoliaService {
  private readonly logger = new Logger(AlgoliaService.name);
  private client: SearchClient | null = null;
  private index: SearchIndex | null = null;

  constructor(private readonly prisma: PrismaService) {
    const appId = process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;

    if (appId && adminKey) {
      this.client = algoliasearch(appId, adminKey);
      this.index = this.client.initIndex(
        process.env.ALGOLIA_INDEX_NAME ?? 'properties',
      );
      this.configureIndex().catch((err) =>
        this.logger.warn(`Algolia index config failed: ${err.message}`),
      );
    } else {
      this.logger.warn('Algolia not configured — search sync disabled');
    }
  }

  // ── Sync individual property ─────────────────────────────────────────────────

  async syncPropertyToAlgolia(propertyId: string): Promise<void> {
    if (!this.index) return;

    try {
      const property = await this.prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          beds: { select: { id: true, monthlyRent: true, status: true } },
          photos: { where: { isHero: true }, take: 1 },
          reviews: { select: { overallRating: true } },
        },
      });

      if (!property || !property.isListed || !property.isActive) {
        await this.removePropertyFromAlgolia(propertyId);
        return;
      }

      const availableBeds = property.beds.filter((b: any) => b.status === 'VACANT').length;
      const prices = property.beds.map((b: any) => b.monthlyRent).filter((p: number) => p > 0);
      const ratings = property.reviews.map((r: any) => r.overallRating);
      const avgRating = ratings.length
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0;

      // Build amenities list from individual boolean flags
      const amenities: string[] = [];
      if (property.hasWifi) amenities.push('WiFi');
      if (property.hasAC) amenities.push('AC');
      if (property.hasGym) amenities.push('Gym');
      if (property.hasFood) amenities.push('Meals');
      if (property.hasWorkspace) amenities.push('Coworking');
      if (property.hasWashingMachine) amenities.push('Laundry');
      if (property.hasParkingBike) amenities.push('Bike Parking');
      if (property.hasParkingCar) amenities.push('Car Parking');
      if (property.hasDailyCleaning) amenities.push('Daily Cleaning');
      if (property.hasHotWater24x7) amenities.push('24x7 Hot Water');

      const record: PropertySearchRecord = {
        objectID: property.id,
        name: property.name,
        slug: property.slug,
        city: property.city,
        locality: property.addressLine2 ?? property.addressLine1,
        pincode: property.pincode,
        addressLine1: property.addressLine1,
        genderPolicy: property.genderPolicy,
        tier: property.tier,
        verificationStatus: property.verificationStatus,
        isListed: property.isListed,
        mainPhotoUrl: property.mainPhotoUrl ?? (property.photos[0] as any)?.url ?? null,
        availableBeds,
        totalBeds: property.beds.length,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: property.reviews.length,
        amenities,
      };

      if (property.latitude && property.longitude) {
        record._geoloc = { lat: property.latitude, lng: property.longitude };
      }

      await this.index.saveObject(record);
      this.logger.log(`Synced property ${propertyId} to Algolia`);
    } catch (err) {
      this.logger.error(`Algolia sync failed for ${propertyId}: ${(err as Error).message}`);
    }
  }

  // ── Remove property ──────────────────────────────────────────────────────────

  async removePropertyFromAlgolia(propertyId: string): Promise<void> {
    if (!this.index) return;

    try {
      await this.index.deleteObject(propertyId);
      this.logger.log(`Removed property ${propertyId} from Algolia`);
    } catch (err) {
      this.logger.error(`Algolia delete failed for ${propertyId}: ${(err as Error).message}`);
    }
  }

  // ── Full reindex ─────────────────────────────────────────────────────────────

  async syncAllProperties(): Promise<{ synced: number; failed: number }> {
    const properties = await this.prisma.property.findMany({
      where: { isActive: true, isListed: true },
      select: { id: true },
    });

    let synced = 0;
    let failed = 0;

    for (const { id } of properties) {
      try {
        await this.syncPropertyToAlgolia(id);
        synced++;
      } catch {
        failed++;
      }
    }

    this.logger.log(`Algolia full reindex: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }

  // ── Index configuration ──────────────────────────────────────────────────────

  private async configureIndex(): Promise<void> {
    if (!this.index) return;

    await this.index.setSettings({
      searchableAttributes: ['name', 'city', 'locality', 'pincode', 'addressLine1'],
      attributesForFaceting: [
        'filterOnly(verificationStatus)',
        'filterOnly(isListed)',
        'genderPolicy',
        'tier',
        'city',
        'locality',
        'amenities',
      ],
      customRanking: [
        'desc(verificationStatus)',
        'desc(tier)',
        'desc(availableBeds)',
        'desc(rating)',
      ],
      ranking: ['geo', 'typo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    });
  }
}
