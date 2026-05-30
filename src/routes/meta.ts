import { Router } from "express";
import { DISCLAIMER } from "../lib/categories";

const INDICES = [
  { id: "heat-index", name: "Heat Index", source: "NWS Rothfusz regression + Steadman", inputs: ["temperature", "humidity"] },
  { id: "wind-chill", name: "Wind Chill", source: "NWS / Environment Canada 2001 (JAG-TI)", inputs: ["temperature", "windSpeed"] },
  { id: "humidex", name: "Humidex", source: "Environment Canada (Masterton & Richardson 1979)", inputs: ["temperature", "humidity"] },
  { id: "dew-point", name: "Dew Point", source: "Magnus–Tetens", inputs: ["temperature", "humidity"] },
  { id: "wet-bulb", name: "Wet-Bulb Temperature", source: "Stull (2011)", inputs: ["temperature", "humidity"] },
  { id: "apparent-temperature", name: "Apparent Temperature", source: "Steadman / Australian BoM", inputs: ["temperature", "humidity", "windSpeed"] },
  { id: "wbgt", name: "Wet-Bulb Globe Temperature", source: "ISO 7243 / OSHA (shade & simplified in-sun estimate)", inputs: ["temperature", "humidity", "solarRadiation?"] },
  { id: "utci", name: "Universal Thermal Climate Index", source: "Bröde et al. (2012)", inputs: ["temperature", "humidity", "windSpeed", "meanRadiantTemp?"] },
];

export function metaRoutes(): Router {
  const r = Router();

  r.get("/meta", (_req, res) => {
    res.json({
      name: "Swelter",
      description: "Thermal-comfort & heat-safety API — pure computation, no API key.",
      version: "1.0.0",
      endpoints: [
        "/heat-index", "/wind-chill", "/humidex", "/dew-point", "/wet-bulb",
        "/apparent-temperature", "/wbgt", "/utci", "/comfort", "/batch",
        "/reference", "/meta", "/health", "/docs", "/openapi.json",
      ],
      docs: "/docs",
    });
  });

  r.get("/reference", (_req, res) => {
    res.json({
      units: {
        temperature: "°C (metric) / °F (imperial)",
        windSpeed: "m·s⁻¹ (metric) / mph (imperial)",
        solarRadiation: "W·m⁻² (both)",
        humidity: "% relative",
      },
      conventions: {
        heatIndexValidRange: "≈ ≥27 °C and ≥40% RH; below → air temperature",
        windChillValidRange: "≤10 °C and wind >4.8 km/h; outside → air temperature",
        humidex: "Celsius-scale index only; no °F/imperial form is produced regardless of the requested units",
        wbgt: "shade uses 0.7·Tnwb+0.3·Ta; in-sun uses 0.7·Tnwb+0.2·Tg+0.1·Ta with Tg≈Ta+0.015·S (estimate)",
        utci: "mean radiant temperature assumed equal to air temperature when meanRadiantTemp omitted",
      },
      indices: INDICES,
      disclaimer: DISCLAIMER,
    });
  });

  return r;
}
