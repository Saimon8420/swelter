import { cToF, fToC, msToKmh } from "../lib/units";
import { rhToDewPoint, vaporPressure } from "../lib/humidity";
import { utciApprox } from "./utci";

// Heat Index — NWS Rothfusz regression (computed in °F, returned in °C).
export function heatIndex(tC: number, rh: number): { value: number; inRange: boolean } {
  const T = cToF(tC);
  // Steadman "simple" formula first; full regression only applies at/above 80°F.
  const simple = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);
  if ((simple + T) / 2 < 80) return { value: tC, inRange: false };

  let HI =
    -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh -
    0.00683783 * T * T - 0.05481717 * rh * rh + 0.00122874 * T * T * rh +
    0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;

  if (rh < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (rh > 85 && T >= 80 && T <= 87) {
    HI += ((rh - 85) / 10) * ((87 - T) / 5);
  }
  return { value: fToC(HI), inRange: true };
}

// Wind Chill — NWS/Environment Canada 2001 (metric form: °C, km/h).
export function windChill(tC: number, windMs: number): { value: number; inRange: boolean } {
  const kmh = msToKmh(windMs);
  // Valid only for T ≤ 10°C and wind > 4.8 km/h.
  if (tC > 10 || kmh <= 4.8) return { value: tC, inRange: false };
  const v16 = Math.pow(kmh, 0.16);
  const wc = 13.12 + 0.6215 * tC - 11.37 * v16 + 0.3965 * tC * v16;
  return { value: wc, inRange: true };
}

// Humidex — Environment Canada (Masterton & Richardson 1979). dewPoint in °C.
export function humidex(tC: number, dewPointC: number): number {
  const dp = dewPointC + 273.15; // K
  const e = 6.11 * Math.exp(5417.7530 * (1 / 273.16 - 1 / dp));
  return tC + 0.5555 * (e - 10);
}

// Dew point — Magnus (re-exported for endpoint symmetry).
export function dewPoint(tC: number, rh: number): number {
  return rhToDewPoint(tC, rh);
}

// Wet-bulb temperature — Stull (2011) empirical approximation. °C, RH %.
export function wetBulb(tC: number, rh: number): number {
  return (
    tC * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(tC + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035
  );
}

// Apparent Temperature — Steadman / Australian BoM. wind in m/s (10 m).
export function apparentTemperature(tC: number, rh: number, windMs: number): number {
  const e = vaporPressure(tC, rh); // hPa
  return tC + 0.33 * e - 0.7 * windMs - 4.0;
}

// WBGT — ISO 7243 weightings. Shade default; in-sun when solar load supplied.
// Tnwb ≈ psychrometric wet-bulb (Stull); Tg ≈ Ta + 0.015·S (simplified estimate).
export function wbgt(
  tC: number,
  rh: number,
  solarRadiation?: number,
): { value: number; inSun: boolean } {
  const twb = wetBulb(tC, rh);
  if (solarRadiation && solarRadiation > 0) {
    const tg = tC + 0.015 * solarRadiation;
    return { value: 0.7 * twb + 0.2 * tg + 0.1 * tC, inSun: true };
  }
  return { value: 0.7 * twb + 0.3 * tC, inSun: false };
}

// UTCI — Bröde et al. (2012). Assumes Tmrt = Ta (no radiation) when
// meanRadiantTemp is absent. Wind is clamped to the model domain (0.5–17 m/s)
// inside utciApprox.
export function utci(
  tC: number,
  rh: number,
  windMs: number,
  mrtC?: number,
): { value: number; assumedMrt: boolean } {
  const assumedMrt = mrtC === undefined;
  const mrt = assumedMrt ? tC : mrtC!;
  return { value: utciApprox(tC, mrt, windMs, rh), assumedMrt };
}
