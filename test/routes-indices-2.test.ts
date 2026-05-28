import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

const app = () => buildApp();

describe("POST /wet-bulb", () => {
  it("200 with survivability note near 35°C wet-bulb", async () => {
    const res = await request(app()).post("/wet-bulb").send({ temperature: 40, humidity: 75 });
    expect(res.status).toBe(200);
    expect(res.body.index).toBe("wet-bulb");
    expect(typeof res.body.value).toBe("number");
  });
});

describe("POST /apparent-temperature", () => {
  it("200 requires humidity and wind", async () => {
    const res = await request(app()).post("/apparent-temperature").send({ temperature: 30, humidity: 70, windSpeed: 2 });
    expect(res.status).toBe(200);
    expect(res.body.category).toBeTruthy();
  });
  it("400 without wind", async () => {
    const res = await request(app()).post("/apparent-temperature").send({ temperature: 30, humidity: 70 });
    expect(res.status).toBe(400);
  });
});

describe("POST /wbgt", () => {
  it("shade result carries an assumption when no solar", async () => {
    const res = await request(app()).post("/wbgt").send({ temperature: 35, humidity: 50 });
    expect(res.status).toBe(200);
    expect(res.body.assumption).toMatch(/shade|solar/i);
  });
  it("in-sun result has no shade assumption and is higher", async () => {
    const shade = await request(app()).post("/wbgt").send({ temperature: 35, humidity: 50 });
    const sun = await request(app()).post("/wbgt").send({ temperature: 35, humidity: 50, solarRadiation: 800 });
    expect(sun.body.value).toBeGreaterThan(shade.body.value);
    expect(sun.body.assumption).toBeUndefined();
  });
});

describe("POST /utci", () => {
  it("assumes Tmrt=Ta when meanRadiantTemp omitted", async () => {
    const res = await request(app()).post("/utci").send({ temperature: 30, humidity: 50, windSpeed: 1 });
    expect(res.status).toBe(200);
    expect(res.body.assumption).toMatch(/radiant|Tmrt|air temp/i);
  });
});
