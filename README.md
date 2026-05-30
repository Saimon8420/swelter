# Swelter

Free public thermal-comfort & heat-safety API — Heat Index, Wind Chill, Humidex, Dew Point, Wet-Bulb, Apparent Temperature, WBGT, and UTCI, plus a combined "feels like" verdict and batch mode. Pure computation, no API key, no state, no rate-limit surprises.

Send a weather reading (temperature, humidity or dew point, wind speed, optional solar radiation / mean radiant temperature) and get back safety-categorized, plain-English thermal-comfort indices — metric or imperial.

## Endpoints

**Compute (POST):**

| Endpoint | Description |
|---|---|
| `POST /heat-index` | NWS Heat Index |
| `POST /wind-chill` | NWS / Environment Canada Wind Chill |
| `POST /humidex` | Environment Canada Humidex |
| `POST /dew-point` | Dew point temperature |
| `POST /wet-bulb` | Stull (2011) wet-bulb temperature |
| `POST /apparent-temperature` | Steadman / BoM apparent temperature ("feels like") |
| `POST /wbgt` | Wet-Bulb Globe Temperature (shade or estimated in-sun) |
| `POST /utci` | Universal Thermal Climate Index |
| `POST /comfort` | Combined verdict: every index above + a single "feels like" basis + safety category |
| `POST /batch` | Up to 500 readings in one request, each run through `/comfort` |

**Meta / docs (GET):**

| Endpoint | Description |
|---|---|
| `GET /reference` | Units, conventions, formula sources, category bands |
| `GET /meta` | API name, version, endpoint list |
| `GET /health` | Liveness check |
| `GET /docs` | Interactive Scalar API reference |
| `GET /openapi.json` | Raw OpenAPI 3 spec |

## Units

Every compute endpoint accepts an optional `"units": "metric" | "imperial"` field (default `"metric"`):

- **Temperature** — °C (metric) / °F (imperial)
- **Wind speed** — m·s⁻¹ (metric) / mph (imperial)
- **Solar radiation** — W·m⁻² (both — unitless conversion, no imperial form)
- **Humidity** — supply **either** `humidity` (% relative humidity) **or** `dewPoint` (in the request's units); the missing one is derived for you

> **Humidex is Celsius-only.** Humidex is a Celsius-scale index defined directly against dry-bulb/dew-point in °C — it has no standard Fahrenheit form. `/humidex` and the `humidex` entry inside `/comfort` and `/batch` always report their value in metric (°C-scale) regardless of the request's `units`, and carry a `note` field saying so. This is documented rather than silently converted, because a Fahrenheit-scaled "humidex" isn't a real thing.

## Example: `POST /comfort`

```bash
curl -X POST https://<your-deployment>/comfort \
  -H "content-type: application/json" \
  -d '{"temperature":34,"humidity":65,"windSpeed":2,"solarRadiation":700}'
```

Real response, captured from a running build of this repo (byte-accurate — not hand-written):

```json
{
  "feelsLike": {
    "basis": "apparent-temperature",
    "value": 40
  },
  "verdict": {
    "category": "Dangerous",
    "message": "Heat stroke imminent; avoid exertion."
  },
  "indices": {
    "heat-index": {
      "value": 44.4,
      "category": "Danger",
      "message": "Heat cramps/exhaustion likely; heat stroke possible with prolonged exposure."
    },
    "humidex": {
      "value": 48,
      "category": "Dangerous",
      "message": "Heat stroke imminent; avoid exertion.",
      "note": "Celsius-scale index (not converted to imperial)."
    },
    "dew-point": {
      "value": 26.5,
      "category": "Oppressive",
      "message": "Oppressive, miserable humidity."
    },
    "wet-bulb": {
      "value": 28.5
    },
    "wbgt": {
      "value": 32.2,
      "category": "Black flag",
      "message": "Extreme risk; suspend strenuous activity (work-rest ~10/50)."
    },
    "wind-chill": {
      "value": 34,
      "category": "Mild",
      "message": "Low wind-chill risk.",
      "note": "Outside valid range; air temp returned."
    },
    "apparent-temperature": {
      "value": 40,
      "category": "Very hot",
      "message": "Dangerous heat; limit exposure."
    },
    "utci": {
      "value": 36.7,
      "category": "Strong heat stress",
      "message": "Strong heat stress."
    }
  },
  "assumptions": [
    "UTCI assumes mean radiant temperature equals air temperature."
  ],
  "units": "metric",
  "disclaimer": "Swelter provides informational thermal-comfort estimates from published meteorological formulas — not medical, occupational-safety, or emergency guidance. For heat-stress safety decisions consult OSHA/ACGIH standards and qualified professionals."
}
```

Note how each index degrades gracefully rather than failing: Wind Chill is outside its valid range for this reading (34 °C is far above its ≤10 °C domain), so it returns the plain air temperature with a `note` flagging that instead of a fabricated wind-chill value. The same honesty convention applies to Heat Index below its valid range.

## Disclaimer

> Swelter provides informational thermal-comfort estimates from published meteorological formulas — not medical, occupational-safety, or emergency guidance. For heat-stress safety decisions consult OSHA/ACGIH standards and qualified professionals.

This disclaimer is returned in every compute response (`disclaimer` field) and via `GET /reference` and `GET /meta`.

## Formulas & sources

Mirrors what `GET /reference` reports at runtime:

| Index | Source |
|---|---|
| Heat Index | NWS Rothfusz regression + Steadman |
| Wind Chill | NWS / Environment Canada 2001 (JAG-TI) |
| Humidex | Environment Canada (Masterton & Richardson 1979) |
| Dew Point | Magnus–Tetens |
| Wet-Bulb Temperature | Stull (2011) |
| Apparent Temperature | Steadman / Australian BoM |
| Wet-Bulb Globe Temperature (WBGT) | ISO 7243 / OSHA — shade formula `0.7·Tnwb + 0.3·Ta`; in-sun is an estimate, `0.7·Tnwb + 0.2·Tg + 0.1·Ta` with `Tg ≈ Ta + 0.015·S` |
| Universal Thermal Climate Index (UTCI) | Bröde et al. (2012) — mean radiant temperature assumed equal to air temperature when `meanRadiantTemp` is omitted |

Valid-range conventions:

- **Heat Index** — meaningful ≈ ≥27 °C and ≥40% RH; outside that range the plain air temperature is returned instead of an extrapolated value.
- **Wind Chill** — meaningful ≤10 °C with wind >4.8 km/h; outside that range the plain air temperature is returned.

## Local development

```bash
npm install
npm run dev      # tsx watch src/index.ts — local dev server
npm test         # vitest run — unit + route tests
npm run build    # esbuild bundle → api/index.js (Vercel entrypoint)
npm run typecheck
```

### Environment variables (optional)

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Both are **optional**. Swelter rate-limits via Upstash Redis when these are set; if they're absent (e.g. local dev, or Upstash being briefly unreachable), the rate limiter fails **open** — requests are simply not throttled rather than the API breaking. No env vars are required to run or deploy Swelter.
