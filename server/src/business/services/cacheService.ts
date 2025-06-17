import NodeCache from 'node-cache';

// Cache options
const DEFAULT_TTL = 60 * 60; 
const CHECK_PERIOD = 120; 
const contentCache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CHECK_PERIOD,
  useClones: false 
});
export class CacheService {
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found
   */
  static get<T>(key: string): T | undefined {
    return contentCache.get<T>(key);
  }

  /**
   * Store a value in cache
   * @param key Cache key
   * @param value Value to store
   * @param ttl Time to live in seconds (optional)
   * @returns true if successful
   */
  static set<T>(key: string, value: T, ttl?: number): boolean {
    return contentCache.set(key, value, ttl || DEFAULT_TTL);
  }

  /**
   * Get or generate a cached value
   * @param key Cache key
   * @param generator Function to generate value if not found in cache
   * @param ttl Time to live in seconds (optional)
   * @returns Value from cache or generated value
   */
  static async getOrSet<T>(
    key: string,
    generator: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = contentCache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await generator();
    contentCache.set(key, value, ttl || DEFAULT_TTL);
    return value;
  }

  /**
   * Delete a cache entry
   * @param key The key to delete
   */
  static delete(key: string): boolean {
    return Boolean(contentCache.del(key));
  }

  static flush(): void {
    contentCache.flushAll();
  }

  /**
   * Remove cache items by pattern
   * @param pattern String pattern (will be converted to RegExp)
   */
  static deleteByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keys = contentCache.keys();
    const matchedKeys = keys.filter((key: string) => regex.test(key));
    
    if (matchedKeys.length) {
      contentCache.del(matchedKeys);
    }
  }
} 