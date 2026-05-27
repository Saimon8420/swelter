import { describe, it, expect } from "vitest";
import { apparentTemperature } from "../src/engine/thermal";
import { round1 } from "../src/lib/units";

describe("apparent temperature (BoM AT)", () => {
  it("feels hotter than air in warm humid still air", () => {
    // AT = Ta + 0.33e − 0.70v − 4.00.  Ta 30, RH 70%, wind 1 m/s → ~35.1°C
    // (e ≈ 42.4 hPa sat × 70% = 29.7 hPa; 30 + 0.33·29.7 − 0.7 − 4 = 35.1).
    const at = apparentTemperature(30, 70, 1);
    expect(round1(at)).toBeCloseTo(35.1, 0);
    expect(at).toBeGreaterThan(30);
  });
  it("wind lowers the feels-like", () => {
    expect(apparentTemperature(30, 70, 8)).toBeLessThan(apparentTemperature(30, 70, 1));
  });
});
