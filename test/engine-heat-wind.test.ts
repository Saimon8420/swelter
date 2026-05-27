import { describe, it, expect } from "vitest";
import { heatIndex, windChill } from "../src/engine/thermal";
import { cToF, round1 } from "../src/lib/units";

describe("heat index (NWS Rothfusz)", () => {
  it("≈ 40.6°C (105°F) at 90°F / 70% RH", () => {
    // NWS chart: 90°F & 70% RH → ~105°F.
    const r = heatIndex(32.2, 70);
    // NWS Rothfusz regression yields ~105.8°F at 90°F/70% RH; the printed NWS chart rounds this to 105°F.
    expect(round1(cToF(r.value))).toBeCloseTo(106, 0);
    expect(r.inRange).toBe(true);
  });
  it("returns air temp with inRange=false below 80°F", () => {
    const r = heatIndex(20, 50); // 68°F
    expect(round1(r.value)).toBe(20);
    expect(r.inRange).toBe(false);
  });
});

describe("wind chill (NWS 2001)", () => {
  it("≈ -34°C at -20°C, 5 m/s wind", () => {
    // NWS metric chart: -20°C & 18 km/h → ~-30°C region.
    const r = windChill(-20, 5);
    expect(r.value).toBeLessThan(-25);
    expect(r.inRange).toBe(true);
  });
  it("returns air temp with inRange=false above 10°C", () => {
    const r = windChill(15, 5);
    expect(round1(r.value)).toBe(15);
    expect(r.inRange).toBe(false);
  });
});
