export * from "hono";

declare module "hono" {
  interface ContextVariableMap {
    correlationId: string;
  }
}
