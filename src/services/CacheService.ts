interface ICacheEntry<T> {
  expiresAt: number;
  value: T;
}

function resolveSessionStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export const CACHE_TTL = {
  communities: 5 * 60 * 1000,
  roles: 3 * 60 * 1000,
  records: 60 * 1000,
  membership: 3 * 60 * 1000
} as const;

export class CacheService {
  private readonly memory = new Map<string, ICacheEntry<unknown>>();
  private readonly pending = new Map<string, Promise<unknown>>();

  public constructor(
    private readonly prefix = 'ssd-communities',
    private readonly storage: Storage | undefined = resolveSessionStorage(),
    private readonly now: () => number = Date.now
  ) {}

  public get<T>(key: string): T | undefined {
    const storageKey = this.toStorageKey(key);
    const memoryEntry = this.memory.get(storageKey) as ICacheEntry<T> | undefined;
    if (memoryEntry) {
      if (memoryEntry.expiresAt > this.now()) {
        return memoryEntry.value;
      }
      this.remove(key);
      return undefined;
    }

    if (!this.storage) {
      return undefined;
    }
    try {
      const serialized = this.storage.getItem(storageKey);
      if (!serialized) {
        return undefined;
      }
      const entry = JSON.parse(serialized) as ICacheEntry<T>;
      if (entry.expiresAt <= this.now()) {
        this.remove(key);
        return undefined;
      }
      this.memory.set(storageKey, entry as ICacheEntry<unknown>);
      return entry.value;
    } catch {
      this.storage.removeItem(storageKey);
      return undefined;
    }
  }

  public set<T>(key: string, value: T, ttlMs: number): T {
    const storageKey = this.toStorageKey(key);
    const entry: ICacheEntry<T> = { expiresAt: this.now() + ttlMs, value };
    this.memory.set(storageKey, entry as ICacheEntry<unknown>);
    if (this.storage) {
      try {
        this.storage.setItem(storageKey, JSON.stringify(entry));
      } catch {
        // Memory caching remains available when browser storage is unavailable or full.
      }
    }
    return value;
  }

  public async getOrCreate<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const storageKey = this.toStorageKey(key);
    const inFlight = this.pending.get(storageKey) as Promise<T> | undefined;
    if (inFlight) {
      return inFlight;
    }

    const request = factory().then(
      (value) => {
        this.pending.delete(storageKey);
        return this.set(key, value, ttlMs);
      },
      (error: unknown) => {
        this.pending.delete(storageKey);
        throw error;
      }
    );
    this.pending.set(storageKey, request as Promise<unknown>);
    return request;
  }

  public remove(key: string): void {
    const storageKey = this.toStorageKey(key);
    this.memory.delete(storageKey);
    this.pending.delete(storageKey);
    this.storage?.removeItem(storageKey);
  }

  public removeByPrefix(keyPrefix: string): void {
    const storagePrefix = this.toStorageKey(keyPrefix);
    const memoryKeys = Array.from(this.memory.keys());
    memoryKeys.forEach((key) => {
      if (key.indexOf(storagePrefix) === 0) {
        this.memory.delete(key);
      }
    });

    if (!this.storage) {
      return;
    }
    const storageKeys: string[] = [];
    for (let index = 0; index < this.storage.length; index += 1) {
      const key = this.storage.key(index);
      if (key && key.indexOf(storagePrefix) === 0) {
        storageKeys.push(key);
      }
    }
    storageKeys.forEach((key) => this.storage?.removeItem(key));
  }

  public clear(): void {
    this.removeByPrefix('');
    this.pending.clear();
  }

  private toStorageKey(key: string): string {
    return `${this.prefix}:${key}`;
  }
}