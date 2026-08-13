import dotenv from "dotenv";
import IORedis from "ioredis";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const createRedisConnection = (options = {}) =>
  new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    ...options,
  });

export { REDIS_URL };
