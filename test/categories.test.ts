import { describe, it, expect } from "vitest";
import {
  heatIndexBand, windChillBand, humidexBand, dewPointBand,
  apparentBand, wbgtBand, utciBand, DISCLAIMER,
} from "../src/lib/categories";

describe("category bands", () => {
  it("heat index bands escalate", () => {
    expect(heatIndexBand(28).category).toBe("Caution");
    expect(heatIndexBand(35).category).toBe("Extreme Caution");
    expect(heatIndexBand(45).category).toBe("Danger");
    expect(heatIndexBand(55).category).toBe("Extreme Danger");
  });
  it("wind chill band mentions frostbite for extreme cold", () => {
    expect(windChillBand(-30).message).toMatch(/frostbite/i);
  });
  it("humidex danger above 45", () => {
    expect(humidexBand(47).category).toMatch(/danger/i);
  });
  it("dew point 'oppressive' above 24", () => {
    expect(dewPointBand(26).category).toMatch(/oppressive|miserable/i);
  });
  it("wbgt returns a flag color", () => {
    expect(wbgtBand(33).category).toMatch(/black|red|flag/i);
  });
  it("utci extreme heat stress above 46", () => {
    expect(utciBand(47).category).toMatch(/extreme heat/i);
  });
  it("apparent band labels a comfortable value", () => {
    expect(apparentBand(22).category).toMatch(/comfort/i);
  });
  it("disclaimer mentions not medical/safety advice", () => {
    expect(DISCLAIMER).toMatch(/not medical/i);
  });
});
