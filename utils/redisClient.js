import { createClient } from "redis";

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_HOST,
    port: 15608,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Redis connected!");
  }
};

export default client;
