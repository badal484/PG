import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

const TTL = {
  PROPERTY: 300,           // 5 min
  SEARCH_RESULTS: 120,     // 2 min
  OWNER_STATS: 900,        // 15 min
  BED_AVAILABILITY: 60,    // 60 sec
  OTP: 600,                // 10 min
  BED_LOCK: 900,           // 15 min checkout lock
} as const;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB ?? 0),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // ── Raw get/set/del ──────────────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      this.logger.warn(`Redis set failed for ${key}: ${(err as Error).message}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    try {
      if (keys.length) await this.client.del(...keys);
    } catch (err) {
      this.logger.warn(`Redis del failed: ${(err as Error).message}`);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length) await this.client.del(...keys);
    } catch (err) {
      this.logger.warn(`Redis delByPattern failed for ${pattern}: ${(err as Error).message}`);
    }
  }

  // ── Typed domain methods ─────────────────────────────────────────────────────

  getProperty<T>(propertyId: string) {
    return this.get<T>(`property:${propertyId}`);
  }

  setProperty(propertyId: string, data: unknown) {
    return this.set(`property:${propertyId}`, data, TTL.PROPERTY);
  }

  invalidateProperty(propertyId: string) {
    return this.del(`property:${propertyId}`, `beds:${propertyId}`);
  }

  // ──

  getSearchResults<T>(cacheKey: string) {
    return this.get<T>(`search:${cacheKey}`);
  }

  setSearchResults(cacheKey: string, results: unknown) {
    return this.set(`search:${cacheKey}`, results, TTL.SEARCH_RESULTS);
  }

  // ──

  getOwnerStats<T>(ownerId: string) {
    return this.get<T>(`owner_stats:${ownerId}`);
  }

  setOwnerStats(ownerId: string, stats: unknown) {
    return this.set(`owner_stats:${ownerId}`, stats, TTL.OWNER_STATS);
  }

  invalidateOwnerStats(ownerId: string) {
    return this.del(`owner_stats:${ownerId}`);
  }

  // ──

  getBedAvailability<T>(propertyId: string) {
    return this.get<T>(`beds:${propertyId}`);
  }

  setBedAvailability(propertyId: string, data: unknown) {
    return this.set(`beds:${propertyId}`, data, TTL.BED_AVAILABILITY);
  }

  // ──

  async setOTP(phone: string, otp: string): Promise<void> {
    await this.set(`otp:${phone}`, otp, TTL.OTP);
  }

  async getOTP(phone: string): Promise<string | null> {
    return this.get<string>(`otp:${phone}`);
  }

  async deleteOTP(phone: string): Promise<void> {
    return this.del(`otp:${phone}`);
  }

  // ──

  async lockBed(bedId: string, userId: string): Promise<boolean> {
    const key = `bed_lock:${bedId}`;
    const result = await this.client.set(key, userId, 'EX', TTL.BED_LOCK, 'NX');
    return result === 'OK';
  }

  async getBedLockOwner(bedId: string): Promise<string | null> {
    return this.get<string>(`bed_lock:${bedId}`);
  }

  async unlockBed(bedId: string): Promise<void> {
    return this.del(`bed_lock:${bedId}`);
  }

  // ── Health check ─────────────────────────────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
