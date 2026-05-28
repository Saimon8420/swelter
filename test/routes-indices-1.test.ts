import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

const app = () => buildApp();

describe("POST /heat-index", () => {
  it("200 with category + imperial output", async () => {
    const res = await request(app()).post("/heat-index").send({ temperature: 90, humidity: 70, units: "imperial" });
    expect(res.status).toBe(200);
    expect(res.body.index).toBe("heat-index");
    expect(res.body.units).toBe("imperial");
    expect(res.body.value).toBeGreaterThan(100);
    expect(res.body.category).toBeTruthy();
    expect(res.body.disclaimer).toMatch(/not medical/i);
  });
  it("adds a note below the valid range", async () => {
    const res = await request(app()).post("/heat-index").send({ temperature: 20, humidity: 50 });
    expect(res.status).toBe(200);
    expect(res.body.note).toMatch(/below|air temp|valid/i);
  });
  it("400 on humidity > 100", async () => {
    const res = await request(app()).post("/heat-index").send({ temperature: 30, humidity: 150 });
    expect(res.status).toBe(400);
  });
});

describe("POST /wind-chill", () => {
  it("200 with frostbite guidance in the cold", async () => {
    const res = await request(app()).post("/wind-chill").send({ temperature: -20, windSpeed: 5 });
    expect(res.status).toBe(200);
    expect(res.body.value).toBeLessThan(-20);
    expect(res.body.category).toBeTruthy();
  });
  it("400 without windSpeed", async () => {
    const res = await request(app()).post("/wind-chill").send({ temperature: -20 });
    expect(res.status).toBe(400);
  });
});

describe("POST /humidex & /dew-point", () => {
  it("humidex 200", async () => {
    const res = await request(app()).post("/humidex").send({ temperature: 30, humidity: 70 });
    expect(res.status).toBe(200);
    expect(res.body.value).toBeGreaterThan(30);
  });
  it("dew-point 200 returns dew point value", async () => {
    const res = await request(app()).post("/dew-point").send({ temperature: 30, humidity: 50 });
    expect(res.body.value).toBeCloseTo(18.4, 0);
  });
  it("humidex always reports metric even for imperial input", async () => {
    const res = await request(app()).post("/humidex").send({ temperature: 86, humidity: 70, units: "imperial" });
    expect(res.status).toBe(200);
    expect(res.body.units).toBe("metric");
    expect(res.body.note).toMatch(/celsius/i);
  });
});
