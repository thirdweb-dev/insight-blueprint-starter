import dotenv from "dotenv";
dotenv.config();

export function getEnv(key: string) {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV !== "test") {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value as string;
}
