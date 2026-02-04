import type { RedisOptions } from "ioredis";
import {env} from '../config/env.js'

export const connection: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};


