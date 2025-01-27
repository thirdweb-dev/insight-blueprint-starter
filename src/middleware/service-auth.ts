import { createMiddleware } from "hono/factory";
import { getEnv } from "../lib/env.js";

const SERVICE_KEY = [
  getEnv("SERVICE_AUTH_KEY"),
  // add more service keys here as needed
];

export const serviceAuth = createMiddleware(async (c, next) => {
  const serviceApiKeyHeader = c.req.header("x-service-api-key");
  if (!serviceApiKeyHeader || !SERVICE_KEY.includes(serviceApiKeyHeader)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});
