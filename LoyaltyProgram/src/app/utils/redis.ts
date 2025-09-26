import Redis from "ioredis";

let redis: Redis | null = null;

if (!redis) {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null, // important for Next.js
  });
}

export default redis;
