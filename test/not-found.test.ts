import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

const app = () => buildApp();

describe("unknown routes", () => {
  it("returns JSON 404 for an unknown route", async () => {
    const res = await request(app()).get("/no-such-route");
    expect(res.status).toBe(404);
    expect(typeof res.body.error).toBe("string");
  });
  it("still serves a real route", async () => {
    const res = await request(app()).post("/dew-point").send({ temperature: 30, humidity: 50 });
    expect(res.status).toBe(200);
  });
});
