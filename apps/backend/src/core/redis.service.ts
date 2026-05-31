import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  private lastErrorLoggedAt = 0;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });
    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => {
      const now = Date.now();
      if (now - this.lastErrorLoggedAt > 30000) {
        this.lastErrorLoggedAt = now;
        this.logger.error(`Redis connection error: ${err.message || 'Connection refused. Retrying...'}`, '');
      }
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Atomic GET + DEL via pipeline — returns value and deletes in one round trip
  async getAndDel(key: string): Promise<string | null> {
    const pipeline = this.client.pipeline();
    pipeline.get(key);
    pipeline.del(key);
    const results = await pipeline.exec();
    const getResult = results?.[0];
    if (!getResult || getResult[0]) return null; // error
    return getResult[1] as string | null;
  }

  getClient(): Redis {
    return this.client;
  }
}
