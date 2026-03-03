import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HealthResolver } from '../health.resolver';

describe('HealthResolver', () => {
  let resolver: HealthResolver;
  const originalVersion = process.env['npm_package_version'];

  beforeEach(() => {
    resolver = new HealthResolver();
  });

  afterEach(() => {
    // Restore env to avoid polluting other tests if an assertion fails mid-test
    if (originalVersion !== undefined) {
      process.env['npm_package_version'] = originalVersion;
    } else {
      delete process.env['npm_package_version'];
    }
  });

  it('returns a HealthStatus with status ok', () => {
    const result = resolver.health();

    expect(result.status).toBe('ok');
  });

  it('returns a valid ISO timestamp', () => {
    const result = resolver.health();

    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('returns npm_package_version when set', () => {
    process.env['npm_package_version'] = '1.2.3';

    const result = resolver.health();

    expect(result.version).toBe('1.2.3');
  });

  it('falls back to 0.1.0 when npm_package_version is not set', () => {
    delete process.env['npm_package_version'];

    const result = resolver.health();

    expect(result.version).toBe('0.1.0');
  });
});
