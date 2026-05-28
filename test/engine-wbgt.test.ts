import { describe, it, expect } from "vitest";
import { wbgt, wetBulb } from "../src/engine/thermal";
import { round1 } from "../src/lib/units";

describe("WBGT", () => {
  it("shade WBGT uses 0.7·Twb + 0.3·Ta", () => {
    const r = wbgt(35, 50); // no solar
    const expected = 0.7 * wetBulb(35, 50) + 0.3 * 35;
    expect(round1(r.value)).toBe(round1(expected));
    expect(r.inSun).toBe(false);
  });
  it("in-sun WBGT is higher than shade for same reading", () => {
    const shade = wbgt(35, 50).value;
    const sun = wbgt(35, 50, 800).value;
    expect(sun).toBeGreaterThan(shade);
  });
  it("flags inSun=true when solar provided", () => {
    expect(wbgt(35, 50, 800).inSun).toBe(true);
  });
});
