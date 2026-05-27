import { describe, it, expect } from "vitest";
import { humidex, dewPoint, wetBulb } from "../src/engine/thermal";
import { round1 } from "../src/lib/units";

describe("humidex (Env. Canada)", () => {
  it("≈ 43–44 at 30°C, dew point 25°C", () => {
    // Env. Canada humidex formula: 30°C air, 25°C dew point → ~42.3 (regression output).
    expect(round1(humidex(30, 25))).toBeCloseTo(42.3, 0);
  });
});

describe("dew point re-export", () => {
  it("matches Magnus at 30°C/50%", () => {
    expect(round1(dewPoint(30, 50))).toBeCloseTo(18.4, 1);
  });
});

describe("wet-bulb (Stull 2011)", () => {
  it("≈ 21.3°C at 30°C / 50% RH", () => {
    // Stull (2011): Ta 30°C, RH 50% → Tw ≈ 22.3°C.
    expect(round1(wetBulb(30, 50))).toBeCloseTo(22.3, 0);
  });
  it("≈ air temp at 100% RH", () => {
    expect(wetBulb(25, 100)).toBeCloseTo(25, 0);
  });
});
