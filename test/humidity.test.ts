import { describe, it, expect } from "vitest";
import { satVaporPressure, vaporPressure, rhToDewPoint, dewPointToRh } from "../src/lib/humidity";
import { round1 } from "../src/lib/units";

describe("humidity (Magnus)", () => {
  it("saturation vapour pressure ~ 23.4 hPa at 20°C", () => {
    expect(satVaporPressure(20)).toBeCloseTo(23.4, 0);
  });
  it("dew point at 30°C / 50% RH ≈ 18.4°C", () => {
    expect(round1(rhToDewPoint(30, 50))).toBeCloseTo(18.4, 1);
  });
  it("dew point equals air temp at 100% RH", () => {
    expect(round1(rhToDewPoint(25, 100))).toBe(25);
  });
  it("round-trips RH→dewPoint→RH", () => {
    const dp = rhToDewPoint(28, 65);
    expect(round1(dewPointToRh(28, dp))).toBeCloseTo(65, 0);
  });
  it("vapour pressure = sat × RH/100", () => {
    expect(vaporPressure(20, 50)).toBeCloseTo(satVaporPressure(20) * 0.5, 5);
  });
});
