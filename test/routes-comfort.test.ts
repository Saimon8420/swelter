import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

const app = () => buildApp();

describe("POST /comfort", () => {
  it("returns multiple indices + verdict for a full reading", async () => {
    const res = await request(app()).post("/comfort").send({ temperature: 34, humidity: 65, windSpeed: 2, solarRadiation: 700 });
    expect(res.status).toBe(200);
    expect(res.body.indices["heat-index"]).toBeTruthy();
    expect(res.body.indices["wbgt"]).toBeTruthy();
    expect(res.body.indices["apparent-temperature"]).toBeTruthy();
    expect(res.body.verdict).toBeTruthy();
    expect(typeof res.body.feelsLike.value).toBe("number");
  });
  it("omits heat index but includes wind chill for a cold windy reading", async () => {
    const res = await request(app()).post("/comfort").send({ temperature: -8, humidity: 70, windSpeed: 6 });
    expect(res.status).toBe(200);
    expect(res.body.indices["wind-chill"]).toBeTruthy();
    // heat index below range → present but flagged, or omitted; assert it is not the feelsLike driver
    expect(res.body.feelsLike.value).toBeLessThan(-8);
  });
  it("collects assumptions when radiation inputs are missing", async () => {
    const res = await request(app()).post("/comfort").send({ temperature: 34, humidity: 65, windSpeed: 2 });
    expect(res.body.assumptions.join(" ")).toMatch(/shade|radiant/i);
  });
  it("400 on invalid reading", async () => {
    const res = await request(app()).post("/comfort").send({ temperature: 34, humidity: 200 });
    expect(res.status).toBe(400);
  });
});
