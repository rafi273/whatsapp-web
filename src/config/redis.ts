import Redis from "ioredis";
import "dotenv/config";

export default new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT) || 6379
});
