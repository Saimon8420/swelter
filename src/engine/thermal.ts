import { cToF, fToC, msToMph, msToKmh } from "../lib/units";

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
