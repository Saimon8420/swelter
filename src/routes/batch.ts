import { Router } from "express";
import { parseReading } from "../lib/validate";
import { computeComfort } from "./comfort";
import { HttpError } from "../middleware/errors";

export function batchRoutes(): Router {
  const r = Router();
  r.post("/batch", (req, res) => {
    const body = req.body ?? {};
    const readings = body.readings;
    if (!Array.isArray(readings)) throw new HttpError(400, "readings must be an array");
    if (readings.length > 500) throw new HttpError(400, "too many readings (max 500)");
    const topUnits = body.units;
    const results = readings.map((raw) => {
      const merged = topUnits && raw?.units === undefined ? { ...raw, units: topUnits } : raw;
      return computeComfort(parseReading(merged));
    });
    res.json({ count: results.length, results });
  });
  return r;
}
