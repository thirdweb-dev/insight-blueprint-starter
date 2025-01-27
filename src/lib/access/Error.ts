import type { StatusCode } from "hono/utils/http-status";

export class BlueprintAccessError extends Error {
  public status: StatusCode;

  constructor(message: string, status: StatusCode) {
    super(message);
    this.name = "AccessError";
    this.status = status;
  }
}
