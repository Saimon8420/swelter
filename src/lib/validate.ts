import { z } from "zod";
import { fToC, mphToMs } from "./units";
import { rhToDewPoint, dewPointToRh } from "./humidity";
import { HttpError } from "../middleware/errors";

export type Units = "metric" | "imperial";

export interface Reading {
  tempC: number;
  rh?: number;
  dewPointC?: number;
  windMs?: number;
  solarRadiation?: number;
  mrtC?: number;
  units: Units;
}

export interface ParseOpts {
  requireHumidity?: boolean;
  requireWind?: boolean;
}

// Raw shape — bounds are in the CALLER's units, so keep them generous and
// re-check the physically-meaningful bound (dewPoint ≤ temp) after conversion.
const schema = z.object({
  temperature: z.number(),
  humidity: z.number().min(0).max(100).optional(),
  dewPoint: z.number().optional(),
  windSpeed: z.number().min(0).optional(),
  solarRadiation: z.number().min(0).max(1500).optional(),
  meanRadiantTemp: z.number().optional(),
  units: z.enum(["metric", "imperial"]).default("metric"),
});

export function parseReading(body: unknown, opts: ParseOpts = {}): Reading {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid reading", parsed.error.flatten());
  }
  const b = parsed.data;
  const toC = (t: number) => (b.units === "imperial" ? fToC(t) : t);
  const toMs = (v: number) => (b.units === "imperial" ? mphToMs(v) : v);

  const tempC = toC(b.temperature);
  if (tempC < -90 || tempC > 60) throw new HttpError(400, "temperature out of range (−90…60 °C)");

  const windMs = b.windSpeed === undefined ? undefined : toMs(b.windSpeed);
  if (windMs !== undefined && windMs > 120) throw new HttpError(400, "windSpeed out of range");

  const mrtC = b.meanRadiantTemp === undefined ? undefined : toC(b.meanRadiantTemp);
  if (mrtC !== undefined && (mrtC < -90 || mrtC > 150)) {
    throw new HttpError(400, "meanRadiantTemp out of range (−90…150 °C)");
  }

  let rh = b.humidity;
  let dewPointC = b.dewPoint === undefined ? undefined : toC(b.dewPoint);

  if (dewPointC !== undefined && dewPointC > tempC + 0.001) {
    throw new HttpError(400, "dewPoint cannot exceed temperature");
  }
  // If the caller supplies both humidity and dewPoint, they must agree — otherwise
  // different indices would use contradictory moisture. Reject rather than emit inconsistent data.
  if (rh !== undefined && dewPointC !== undefined) {
    const expectedDewPoint = rhToDewPoint(tempC, rh);
    if (Math.abs(dewPointC - expectedDewPoint) > 0.5) {
      throw new HttpError(400, "humidity and dewPoint are inconsistent; supply only one");
    }
  }
  // Derive the missing humidity representation.
  if (rh !== undefined && dewPointC === undefined) dewPointC = rhToDewPoint(tempC, rh);
  if (dewPointC !== undefined && rh === undefined) rh = dewPointToRh(tempC, dewPointC);

  if (opts.requireHumidity && rh === undefined) {
    throw new HttpError(400, "humidity or dewPoint is required");
  }
  if (opts.requireWind && windMs === undefined) {
    throw new HttpError(400, "windSpeed is required");
  }

  return { tempC, rh, dewPointC, windMs, solarRadiation: b.solarRadiation, mrtC, units: b.units };
}
