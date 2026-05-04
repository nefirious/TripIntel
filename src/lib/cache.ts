
/**
 * Simple client-side cache utility using localStorage
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const cache = {
  set: <T>(key: string, data: T, ttlMs: number = 1000 * 60 * 60): void => {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now() + ttlMs,
      };
      localStorage.setItem(`tripintel_cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn('Cache set failed', e);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`tripintel_cache_${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      if (Date.now() > entry.timestamp) {
        localStorage.removeItem(`tripintel_cache_${key}`);
        return null;
      }

      return entry.data;
    } catch (e) {
      console.warn('Cache get failed', e);
      return null;
    }
  },

  clear: (key: string): void => {
    localStorage.removeItem(`tripintel_cache_${key}`);
  }
};
