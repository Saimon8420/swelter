import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

const app = () => buildApp();

describe("GET /meta", () => {
  it("returns product metadata", async () => {
    const res = await request(app()).get("/meta");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Swelter");
    expect(Array.isArray(res.body.endpoints)).toBe(true);
  });
});

describe("GET /reference", () => {
  it("lists indices, sources, and units", async () => {
    const res = await request(app()).get("/reference");
    expect(res.status).toBe(200);
    expect(res.body.units.temperature).toMatch(/°C|Celsius/i);
    expect(res.body.indices.find((i: any) => i.id === "utci")).toBeTruthy();
    expect(res.body.disclaimer).toMatch(/not medical/i);
  });
});
