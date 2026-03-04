import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

@Injectable()
export class PubSubService implements OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);
  private readonly pubSub: RedisPubSub;

  constructor() {
    const redisUrl = process.env['REDIS_URL'];
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    this.pubSub = new RedisPubSub({
      publisher: new Redis(redisUrl),
      subscriber: new Redis(redisUrl),
    });

    const host = new URL(redisUrl).hostname;
    this.logger.log(`PubSub configured for Redis host: ${host}`);
  }

  async publish(topic: string, payload: unknown): Promise<void> {
    await this.pubSub.publish(topic, payload);
  }

  asyncIterableIterator<T>(topic: string): AsyncIterableIterator<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.pubSub.asyncIterableIterator<T>(topic);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pubSub.close();
    this.logger.log('PubSub connections closed');
  }
}
