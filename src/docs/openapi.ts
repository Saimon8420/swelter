const reading = {
  type: "object",
  required: ["temperature"],
  properties: {
    temperature: { type: "number", description: "Air temperature (°C metric / °F imperial)", example: 34 },
    humidity: { type: "number", minimum: 0, maximum: 100, description: "Relative humidity %", example: 65 },
    dewPoint: { type: "number", description: "Dew point (alternative to humidity)", example: 20 },
    windSpeed: { type: "number", minimum: 0, description: "Wind speed (m·s⁻¹ metric / mph imperial)", example: 2 },
    solarRadiation: { type: "number", minimum: 0, maximum: 1500, description: "Solar load W·m⁻² (upgrades WBGT/UTCI to in-sun)", example: 700 },
    meanRadiantTemp: { type: "number", description: "Mean radiant temp (upgrades UTCI)", example: 40 },
    units: { type: "string", enum: ["metric", "imperial"], default: "metric" },
  },
} as const;

const body = (example: Record<string, unknown>) => ({
  required: true,
  content: { "application/json": { schema: reading, example } },
});

const ok = { "200": { description: "OK" }, "400": { description: "Invalid input" } };

const post = (summary: string, tag: string, example: Record<string, unknown>) => ({
  post: { summary, tags: [tag], requestBody: body(example), responses: ok },
});

export const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Swelter",
    version: "1.0.0",
    description:
      "Thermal-comfort & heat-safety API. Send a weather reading (temperature, humidity, wind, optional sun) " +
      "and receive Heat Index, Wind Chill, Humidex, Dew Point, Wet-Bulb, Apparent Temperature, WBGT and UTCI " +
      "with safety categories and plain-English guidance. Metric or imperial. Pure computation, no API key. " +
      "Informational only — not medical or occupational-safety advice.",
  },
  servers: [{ url: "https://swelter-dev.vercel.app", description: "Production" }],
  paths: {
    "/heat-index": post("Heat Index (NWS)", "Indices", { temperature: 34, humidity: 65 }),
    "/wind-chill": post("Wind Chill (NWS 2001)", "Indices", { temperature: -8, windSpeed: 6 }),
    "/humidex": post("Humidex (Env. Canada)", "Indices", { temperature: 30, humidity: 70 }),
    "/dew-point": post("Dew point + RH↔dew-point", "Indices", { temperature: 30, humidity: 50 }),
    "/wet-bulb": post("Wet-bulb temperature (Stull)", "Indices", { temperature: 40, humidity: 75 }),
    "/apparent-temperature": post("Apparent temperature (BoM feels-like)", "Indices", { temperature: 30, humidity: 70, windSpeed: 2 }),
    "/wbgt": post("Wet-Bulb Globe Temperature", "Heat stress", { temperature: 35, humidity: 50, solarRadiation: 800 }),
    "/utci": post("Universal Thermal Climate Index", "Heat stress", { temperature: 30, humidity: 50, windSpeed: 1, meanRadiantTemp: 45 }),
    "/comfort": post("All applicable indices + verdict", "Summary", { temperature: 34, humidity: 65, windSpeed: 2, solarRadiation: 700 }),
    "/batch": {
      post: {
        summary: "Comfort for many readings (≤500)",
        tags: ["Summary"],
        requestBody: {
          required: true,
          content: { "application/json": { example: { units: "metric", readings: [{ temperature: 34, humidity: 65, windSpeed: 2 }, { temperature: -5, humidity: 70, windSpeed: 6 }] } } },
        },
        responses: ok,
      },
    },
    "/reference": { get: { summary: "Formulas, sources, units, conventions", tags: ["Meta"], responses: { "200": { description: "OK" } } } },
    "/meta": { get: { summary: "Product metadata", tags: ["Meta"], responses: { "200": { description: "OK" } } } },
    "/health": { get: { summary: "Health check", tags: ["Meta"], responses: { "200": { description: "OK" } } } },
  },
};
