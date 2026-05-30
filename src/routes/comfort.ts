import { Router } from "express";
import { parseReading, type Reading } from "../lib/validate";
import { round1 } from "../lib/units";
import { formatTemp } from "./indices";
import { heatIndex, windChill, humidex, dewPoint, wetBulb, apparentTemperature, wbgt, utci } from "../engine/thermal";
import {
  heatIndexBand, windChillBand, humidexBand, dewPointBand,
  apparentBand, wbgtBand, utciBand, DISCLAIMER, type Band,
} from "../lib/categories";

// Severity ranking for choosing the overall verdict (higher = worse).
const SEVERITY = [
  "None", "Mild", "White flag", "Comfortable", "Dry", "Cool", "Cold",
  "Caution", "Some discomfort", "Green flag", "Sticky", "No thermal stress",
  "Slight cold stress", "Moderate cold stress", "Yellow flag", "Extreme Caution",
  "Uncomfortable", "Great discomfort", "Hot", "Moderate heat stress", "Strong cold stress",
  "Red flag", "Danger", "Strong heat stress", "Very strong cold stress", "Severe",
  "Very hot", "Very strong heat stress", "Black flag", "Dangerous",
  "Extreme Danger", "Extreme heat stress", "Extreme cold stress", "Extreme",
];
const rank = (c: string) => { const i = SEVERITY.indexOf(c); return i < 0 ? 0 : i; };

export interface ComfortResult {
  feelsLike: { basis: string; value: number };
  verdict: Band;
  indices: Record<string, { value: number; category?: string; message?: string; note?: string }>;
  assumptions: string[];
  units: string;
  disclaimer: string;
}

export function computeComfort(rd: Reading): ComfortResult {
  const indices: ComfortResult["indices"] = {};
  const assumptions: string[] = [];
  const bands: Band[] = [];
  const hasHum = rd.rh !== undefined;
  const hasWind = rd.windMs !== undefined;

  if (hasHum) {
    const hi = heatIndex(rd.tempC, rd.rh!);
    const b = heatIndexBand(hi.value);
    indices["heat-index"] = { value: formatTemp(hi.value, rd.units), category: b.category, message: b.message, ...(hi.inRange ? {} : { note: "Below valid range; air temp returned." }) };
    if (hi.inRange) bands.push(b);

    const hx = humidex(rd.tempC, rd.dewPointC!);
    const hb = humidexBand(hx);
    indices["humidex"] = { value: round1(hx), category: hb.category, message: hb.message, note: "Celsius-scale index (not converted to imperial)." };
    bands.push(hb);

    const dp = dewPoint(rd.tempC, rd.rh!);
    const db = dewPointBand(dp);
    indices["dew-point"] = { value: formatTemp(dp, rd.units), category: db.category, message: db.message };

    const wb = wetBulb(rd.tempC, rd.rh!);
    indices["wet-bulb"] = { value: formatTemp(wb, rd.units), ...(wb >= 31 ? { note: "Approaching survivability limit." } : {}) };

    const wg = wbgt(rd.tempC, rd.rh!, rd.solarRadiation);
    const wgb = wbgtBand(wg.value);
    indices["wbgt"] = { value: formatTemp(wg.value, rd.units), category: wgb.category, message: wgb.message };
    bands.push(wgb);
    if (!wg.inSun) assumptions.push("WBGT computed for shade (no solarRadiation supplied).");
  }

  if (hasWind) {
    const wc = windChill(rd.tempC, rd.windMs!);
    const b = windChillBand(wc.value);
    indices["wind-chill"] = { value: formatTemp(wc.value, rd.units), category: b.category, message: b.message, ...(wc.inRange ? {} : { note: "Outside valid range; air temp returned." }) };
    if (wc.inRange) bands.push(b);
  }

  if (hasHum && hasWind) {
    const at = apparentTemperature(rd.tempC, rd.rh!, rd.windMs!);
    const ab = apparentBand(at);
    indices["apparent-temperature"] = { value: formatTemp(at, rd.units), category: ab.category, message: ab.message };
    bands.push(ab);

    const ut = utci(rd.tempC, rd.rh!, rd.windMs!, rd.mrtC);
    const ub = utciBand(ut.value);
    indices["utci"] = { value: formatTemp(ut.value, rd.units), category: ub.category, message: ub.message };
    bands.push(ub);
    if (ut.assumedMrt) assumptions.push("UTCI assumes mean radiant temperature equals air temperature.");
  }

  // feelsLike basis: prefer AT, else heat index (warm) or wind chill (cold), else air temp.
  let feelsLike: ComfortResult["feelsLike"];
  if (hasHum && hasWind) feelsLike = { basis: "apparent-temperature", value: indices["apparent-temperature"].value };
  else if (hasHum && heatIndex(rd.tempC, rd.rh!).inRange) feelsLike = { basis: "heat-index", value: indices["heat-index"].value };
  else if (hasWind && windChill(rd.tempC, rd.windMs!).inRange) feelsLike = { basis: "wind-chill", value: indices["wind-chill"].value };
  else feelsLike = { basis: "air-temperature", value: formatTemp(rd.tempC, rd.units) };

  const verdict = bands.length ? bands.reduce((a, b) => (rank(b.category) > rank(a.category) ? b : a)) : { category: "None", message: "No significant thermal stress." };

  return { feelsLike, verdict, indices, assumptions, units: rd.units, disclaimer: DISCLAIMER };
}

export function comfortRoutes(): Router {
  const r = Router();
  r.post("/comfort", (req, res) => {
    const rd = parseReading(req.body);
    res.json(computeComfort(rd));
  });
  return r;
}
