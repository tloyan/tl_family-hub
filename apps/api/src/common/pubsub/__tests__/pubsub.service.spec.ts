import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockPublish = vi.fn();
const mockClose = vi.fn().mockResolvedValue(['OK', 'OK']);
const mockAsyncIterableIterator = vi.fn().mockReturnValue({ next: vi.fn() });

vi.mock('graphql-redis-subscriptions', () => ({
  RedisPubSub: class {
    publish = mockPublish;
    close = mockClose;
    asyncIterableIterator = mockAsyncIterableIterator;
  },
}));

vi.mock('ioredis', () => ({
  default: class {},
}));

import { PubSubService } from '../pubsub.service';

describe('PubSubService', () => {
  const originalEnv = process.env['REDIS_URL'];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env['REDIS_URL'] = 'redis://localhost:6379';
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env['REDIS_URL'] = originalEnv;
    } else {
      delete process.env['REDIS_URL'];
    }
  });

  it('throws if REDIS_URL is not set', () => {
    delete process.env['REDIS_URL'];

    expect(() => new PubSubService()).toThrow('REDIS_URL environment variable is required');
  });

  it('creates service successfully when REDIS_URL is set', () => {
    const service = new PubSubService();
    expect(service).toBeDefined();
  });

  it('publish() delegates to RedisPubSub.publish with correct topic and payload', async () => {
    const service = new PubSubService();
    const payload = { invitationId: '123', householdId: '456' };

    await service.publish('invitation.accepted', payload);

    expect(mockPublish).toHaveBeenCalledWith('invitation.accepted', payload);
  });

  it('asyncIterableIterator() delegates to RedisPubSub.asyncIterableIterator', () => {
    const service = new PubSubService();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = service.asyncIterableIterator('household.member_changed');

    expect(mockAsyncIterableIterator).toHaveBeenCalledWith('household.member_changed');
    expect(result).toHaveProperty('next');
  });

  it('onModuleDestroy() closes the PubSub connection', async () => {
    const service = new PubSubService();

    await service.onModuleDestroy();

    expect(mockClose).toHaveBeenCalled();
  });
});
