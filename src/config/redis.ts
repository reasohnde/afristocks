import Redis from 'ioredis';

// No-op mock Redis for when Redis is unavailable
const mockRedis = {
  get: async () => null,
  set: async () => 'OK',
  setex: async () => 'OK',
  del: async () => 0,
  on: () => mockRedis,
  connect: async () => {},
  disconnect: async () => {},
  status: 'end',
} as any;

let redis: Redis;
let redisAvailable = false;

try {
  const instance = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    retryStrategy: (times: number) => {
      if (times > 1) return null;
      return 500;
    },
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  instance.on('connect', () => {
    redisAvailable = true;
    console.log('✅ Redis connected');
  });
  instance.on('error', () => {});

  // Try to connect, fall back to mock if it fails
  instance.connect().then(() => {
    redisAvailable = true;
  }).catch(() => {
    console.warn('⚠️  Redis non disponible - le serveur continue sans cache');
  });

  // Wrap all calls in a safe proxy that falls back to mock on error
  redis = new Proxy(instance, {
    get(target, prop) {
      const original = (target as any)[prop];
      if (typeof original === 'function' && ['get', 'set', 'setex', 'del', 'expire', 'ttl', 'keys'].includes(prop as string)) {
        return async (...args: any[]) => {
          try {
            return await original.apply(target, args);
          } catch {
            return (mockRedis as any)[prop]?.(...args) ?? null;
          }
        };
      }
      return original;
    }
  }) as any;
} catch {
  console.warn('⚠️  Redis non disponible - le serveur continue sans cache');
  redis = mockRedis;
}

export { redis };
