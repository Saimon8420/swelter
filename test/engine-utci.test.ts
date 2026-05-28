import { describe, it, expect } from "vitest";
import { utci } from "../src/engine/thermal";
import { utciApprox } from "../src/engine/utci";

describe("UTCI (Bröde 2012)", () => {
  // Reference points from the official UTCI documentation tables.
  // Ta=Tmrt, wind at 10 m, RH → UTCI (°C).
  it("Ta 30, Tmrt 30, wind 0.5 m/s, RH 50% → ~32°C", () => {
    const r = utci(30, 50, 0.5, 30);
    expect(r.value).toBeGreaterThan(30);
    expect(r.value).toBeLessThan(35);
    expect(r.assumedMrt).toBe(false);
  });
  it("wind sharply lowers UTCI in the cold", () => {
    const calm = utci(-10, 60, 0.5, -10).value;
    const windy = utci(-10, 60, 10, -10).value;
    expect(windy).toBeLessThan(calm);
  });
  it("assumes Tmrt = Ta when meanRadiantTemp omitted", () => {
    const r = utci(25, 50, 3);
    expect(r.assumedMrt).toBe(true);
  });
});

describe("UTCI — official reference values (validation gate)", () => {
  // The raw polynomial pinned against the exact published test value from
  // pythermalcomfort's `test_utci_optimized`: _utci_optimized([25,27],1,1,1.5) == [24.73, 26.57]
  // (tdb=25/27, va=1, D=Tmrt-Ta=1, Pa=1.5 kPa). We feed Pa via RH so that
  // vaporPressure(Ta,RH)/10 ≈ 1.5 kPa; Magnus vs the ISO es() differ <0.05°C.
  // Source: https://github.com/CenterForTheBuiltEnvironment/pythermalcomfort
  //         tests/test_utci.py::test_utci_optimized
  it("raw polynomial matches _utci_optimized pin (Pa≈1.5, D=1)", () => {
    // Ta=25: choose RH giving Pa≈1.5 kPa. satVP(25)=31.685 hPa → RH≈47.34% → Pa≈1.500.
    expect(Math.abs(utciApprox(25, 26, 1, 47.34) - 24.73)).toBeLessThanOrEqual(0.15);
    // Ta=27: satVP(27)=35.62 hPa → RH≈42.11% → Pa≈1.500.
    expect(Math.abs(utciApprox(27, 28, 1, 42.11) - 26.57)).toBeLessThanOrEqual(0.15);
  });

  // Diverse reference cases (tdb, tr, rh, v → UTCI °C), from the official
  // UTCI validation table shipped with pythermalcomfort's test suite:
  // https://raw.githubusercontent.com/FedericoTartarini/validation-data-comfort-models/main/ts_utci.json
  // (published tolerance there is ±0.1°C; we assert the looser ±0.6°C required here,
  //  which comfortably absorbs the Magnus-vs-ISO vapour-pressure difference).
  const cases: Array<{ ta: number; tr: number; rh: number; v: number; exp: number; label: string }> = [
    { ta: 30, tr: 27, rh: 50, v: 1, exp: 29.6, label: "hot, slight negative radiation" },
    { ta: 9, tr: 9, rh: 50, v: 1, exp: 8.7, label: "cold, no radiation delta" },
    { ta: 27, tr: 22, rh: 50, v: 16, exp: 15.8, label: "very windy (16 m/s)" },
    { ta: 19, tr: 24, rh: 50, v: 1, exp: 20.0, label: "high radiation (Tmrt +5)" },
    { ta: 25, tr: 27, rh: 50, v: 1, exp: 25.2, label: "mild, positive radiation" },
    { ta: 27, tr: 22, rh: 50, v: 10, exp: 20.0, label: "windy (10 m/s)" },
    { ta: 25, tr: 25, rh: 50, v: 1, exp: 24.6, label: "neutral, no radiation (SI 76.4°F/24.6°C ref)" },
  ];
  for (const c of cases) {
    it(`${c.label}: utci(${c.ta},${c.tr},${c.v}) ≈ ${c.exp}°C`, () => {
      expect(Math.abs(utci(c.ta, c.rh, c.v, c.tr).value - c.exp)).toBeLessThanOrEqual(0.6);
    });
  }
});
