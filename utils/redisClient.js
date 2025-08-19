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

await client.connect();

export default client;