import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

const app = () => buildApp();

describe("docs", () => {
  it("GET /openapi.json returns the spec with request examples", async () => {
    const res = await request(app()).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    const hi = res.body.paths["/heat-index"].post;
    expect(hi.requestBody.content["application/json"].example.temperature).toBeDefined();
  });
  it("GET /docs serves the Scalar HTML page", async () => {
    const res = await request(app()).get("/docs");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/api-reference/);
  });
  it("GET / redirects to /docs", async () => {
    const res = await request(app()).get("/");
    expect([301, 302]).toContain(res.status);
    expect(res.headers.location).toBe("/docs");
  });
});
