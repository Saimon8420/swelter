import { Router } from "express";
import { parseReading, type Units } from "../lib/validate";
import { cToF, round1 } from "../lib/units";
import { heatIndex, windChill, humidex, dewPoint, wetBulb, apparentTemperature, wbgt, utci } from "../engine/thermal";
import {
  heatIndexBand, windChillBand, humidexBand, dewPointBand,
  apparentBand, wbgtBand, utciBand, DISCLAIMER,
} from "../lib/categories";

export function formatTemp(c: number, units: Units): number {
  return round1(units === "imperial" ? cToF(c) : c);
}

export function indexRoutes(): Router {
  const r = Router();

  r.post("/heat-index", (req, res) => {
    const rd = parseReading(req.body, { requireHumidity: true });
    const { value, inRange } = heatIndex(rd.tempC, rd.rh!);
    const band = heatIndexBand(value);
    res.json({
      index: "heat-index",
      value: formatTemp(value, rd.units),
      units: rd.units,
      category: band.category,
      message: band.message,
      ...(inRange ? {} : { note: "Below the heat-index valid range (≈27 °C / 80 °F); air temperature returned per NWS convention." }),
      disclaimer: DISCLAIMER,
    });
  });

  r.post("/wind-chill", (req, res) => {
    const rd = parseReading(req.body, { requireWind: true });
    const { value, inRange } = windChill(rd.tempC, rd.windMs!);
    const band = windChillBand(value);
    res.json({
      index: "wind-chill",
      value: formatTemp(value, rd.units),
      units: rd.units,
      category: band.category,
      message: band.message,
      ...(inRange ? {} : { note: "Outside the wind-chill valid range (≤10 °C and wind >4.8 km/h); air temperature returned per NWS convention." }),
      disclaimer: DISCLAIMER,
    });
  });

  r.post("/humidex", (req, res) => {
    const rd = parseReading(req.body, { requireHumidity: true });
    const value = humidex(rd.tempC, rd.dewPointC!);
    const band = humidexBand(value);
    res.json({ index: "humidex", value: round1(value), units: rd.units, category: band.category, message: band.message, disclaimer: DISCLAIMER });
  });

  r.post("/dew-point", (req, res) => {
    const rd = parseReading(req.body, { requireHumidity: true });
    const value = dewPoint(rd.tempC, rd.rh!);
    const band = dewPointBand(value);
    res.json({ index: "dew-point", value: formatTemp(value, rd.units), units: rd.units, humidity: round1(rd.rh!), category: band.category, message: band.message, disclaimer: DISCLAIMER });
  });

  return r;
}
