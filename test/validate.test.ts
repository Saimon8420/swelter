import { describe, it, expect } from "vitest";
import { parseReading } from "../src/lib/validate";
import { round1 } from "../src/lib/units";

describe("parseReading", () => {
  it("accepts a metric reading and fills humidity both ways", () => {
    const r = parseReading({ temperature: 30, humidity: 50 });
    expect(r.tempC).toBe(30);
    expect(r.rh).toBe(50);
    expect(round1(r.dewPointC!)).toBeCloseTo(18.4, 1);
  });
  it("converts imperial temperature to Celsius", () => {
    const r = parseReading({ temperature: 86, humidity: 50, units: "imperial" });
    expect(round1(r.tempC)).toBe(30);
  });
  it("converts imperial wind (mph) to m/s", () => {
    const r = parseReading({ temperature: 5, windSpeed: 10, units: "imperial" }, { requireWind: true });
    expect(round1(r.windMs!)).toBe(4.5);
  });
  it("derives RH from dewPoint", () => {
    const r = parseReading({ temperature: 28, dewPoint: 20 });
    expect(round1(r.rh!)).toBeCloseTo(61.6, 0);
  });
  it("rejects dewPoint above temperature", () => {
    expect(() => parseReading({ temperature: 20, dewPoint: 25 })).toThrow(/dew ?point/i);
  });
  it("rejects humidity over 100", () => {
    expect(() => parseReading({ temperature: 20, humidity: 120 })).toThrow();
  });
  it("rejects temperature out of range", () => {
    expect(() => parseReading({ temperature: 200, humidity: 50 })).toThrow();
  });
  it("requires humidity when asked", () => {
    expect(() => parseReading({ temperature: 30 }, { requireHumidity: true })).toThrow(/humidity|dew/i);
  });
  it("requires wind when asked", () => {
    expect(() => parseReading({ temperature: 5 }, { requireWind: true })).toThrow(/wind/i);
  });
});
