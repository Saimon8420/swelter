import { describe, it, expect } from "vitest";
import { cToF, fToC, mphToMs, msToMph, msToKmh, round1 } from "../src/lib/units";

describe("units", () => {
  it("converts C↔F", () => {
    expect(round1(cToF(0))).toBe(32);
    expect(round1(cToF(100))).toBe(212);
    expect(round1(fToC(32))).toBe(0);
    expect(round1(fToC(212))).toBe(100);
  });
  it("round-trips C→F→C", () => {
    expect(round1(fToC(cToF(23.5)))).toBe(23.5);
  });
  it("converts wind units", () => {
    expect(round1(mphToMs(10))).toBe(4.5);
    expect(round1(msToMph(4.4704))).toBe(10);
    expect(round1(msToKmh(10))).toBe(36);
  });
  it("round1 rounds to one decimal", () => {
    expect(round1(1.2345)).toBe(1.2);
    expect(round1(1.25)).toBe(1.3);
  });
});
