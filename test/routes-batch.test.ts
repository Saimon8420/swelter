import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

const app = () => buildApp();

describe("POST /batch", () => {
  it("computes comfort for each reading", async () => {
    const res = await request(app()).post("/batch").send({
      readings: [
        { temperature: 34, humidity: 65, windSpeed: 2 },
        { temperature: -5, humidity: 70, windSpeed: 6 },
      ],
    });
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.results).toHaveLength(2);
    expect(res.body.results[0].verdict).toBeTruthy();
  });
  it("applies top-level units to each reading", async () => {
    const res = await request(app()).post("/batch").send({
      units: "imperial",
      readings: [{ temperature: 90, humidity: 70 }],
    });
    expect(res.status).toBe(200);
    expect(res.body.results[0].units).toBe("imperial");
  });
  it("rejects more than 500 readings with 400", async () => {
    const readings = Array.from({ length: 501 }, () => ({ temperature: 25, humidity: 50 }));
    const res = await request(app()).post("/batch").send({ readings });
    expect(res.status).toBe(400);
  });
  it("400 when readings is not an array", async () => {
    const res = await request(app()).post("/batch").send({ readings: "nope" });
    expect(res.status).toBe(400);
  });
});
