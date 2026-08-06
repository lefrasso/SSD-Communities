import { describe, expect, it, jest } from '@jest/globals';
import { CacheService } from './CacheService';

describe('CacheService', () => {
  it('expires entries at their TTL', () => {
    let now = 100;
    const cache = new CacheService('ttl-test', undefined, () => now);
    cache.set('communities', ['Azure'], 50);
    expect(cache.get<string[]>('communities')).toEqual(['Azure']);
    now = 151;
    expect(cache.get<string[]>('communities')).toBeUndefined();
  });

  it('deduplicates concurrent cache misses', async () => {
    const cache = new CacheService('pending-test', undefined, () => 100);
    const factory = jest.fn(async () => ['Azure']);
    const first = cache.getOrCreate('communities', 1000, factory);
    const second = cache.getOrCreate('communities', 1000, factory);
    await expect(first).resolves.toEqual(['Azure']);
    await expect(second).resolves.toEqual(['Azure']);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('removes related keys by prefix', () => {
    const cache = new CacheService('prefix-test', undefined, () => 100);
    cache.set('roles:1', ['lead'], 1000);
    cache.set('roles:2', ['owner'], 1000);
    cache.set('charter:1', ['draft'], 1000);
    cache.removeByPrefix('roles:');
    expect(cache.get('roles:1')).toBeUndefined();
    expect(cache.get('roles:2')).toBeUndefined();
    expect(cache.get('charter:1')).toEqual(['draft']);
  });
});