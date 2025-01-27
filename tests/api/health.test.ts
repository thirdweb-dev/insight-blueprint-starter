import { describe, expect, test } from "vitest";

import { Access } from "../../src/lib/access/index.js";

const access = new Access();

describe("Service Health", () => {
  test("GET `/health` route", async () => {
    const res = await access.app.request("/health");
    expect(res.status).toEqual(200);
    expect(await res.json()).toEqual({
      status: "ok",
      correlationId: expect.any(String),
    });
  });
});
