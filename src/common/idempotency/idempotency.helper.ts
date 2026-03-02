import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Idempotency helper for event processing.
 * Ensures processing logic runs only once per unique event.
 * Backed by Redis using atomic SET NX EX.
 */
@Injectable()
export class IdempotencyHelper implements OnModuleDestroy {
  private readonly logger = new Logger(IdempotencyHelper.name);
  private readonly redis: Redis;
  private readonly ttlSecondsDefault: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    this.ttlSecondsDefault = Number(this.configService.get<string>('IDEMPOTENCY_TTL', '86400'));
    this.redis = new Redis({
      host,
      port,
    });
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch (err) {
      this.logger.error('Error disconnecting Redis', err);
    }
  }

  /**
   * Atomically marks a key as processed if it does not exist.
   * Returns true if this is the first time (safe to process).
   */
  async markIfNotProcessed(key: string, ttlSeconds = this.ttlSecondsDefault): Promise<boolean> {
    try {
      // Use string argument format for full TypeScript compatibility
      const redisKey = `idempotency:${key}`;
      const result = await this.redis.set(redisKey, 'processed', 'EX', ttlSeconds, 'NX');

      return result === 'OK';
    } catch (err) {
      this.logger.error(`Redis error for key: ${key}`, err);
      return false;
    }
  }

  /**
   * Wrap event processing logic safely.
   * Guarantees callback runs only once per unique key.
   */
  async executeOnce<T>(
    key: string,
    callback: () => Promise<T>,
    ttlSeconds = this.ttlSecondsDefault,
  ): Promise<{ executed: boolean; result?: T }> {
    const isNew = await this.markIfNotProcessed(key, ttlSeconds);

    if (!isNew) {
      this.logger.warn(`Duplicate event skipped for key: ${key}`);
      return { executed: false };
    }

    try {
      const result = await callback();
      return { executed: true, result };
    } catch (err) {
      this.logger.error(`Processing failed for key: ${key}`, err);

      // Remove key to allow retry if processing fails
      try {
        await this.redis.del(`idempotency:${key}`);
      } catch (deleteErr) {
        this.logger.error(`Failed to delete key after error: ${key}`, deleteErr);
      }

      throw err;
    }
  }

  /**
   * Optional manual check
   */
  async isProcessed(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(`idempotency:${key}`);
      return exists === 1;
    } catch (err) {
      this.logger.error(`Redis exists check failed for key: ${key}`, err);
      return false;
    }
  }
}
