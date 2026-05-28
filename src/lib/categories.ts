export interface Band { category: string; message: string }

export const DISCLAIMER =
  "Swelter provides informational thermal-comfort estimates from published " +
  "meteorological formulas — not medical, occupational-safety, or emergency guidance. " +
  "For heat-stress safety decisions consult OSHA/ACGIH standards and qualified professionals.";

// NWS heat index categories (°C thresholds converted from °F: 80/90/103/125°F).
export function heatIndexBand(v: number): Band {
  if (v >= 51.7) return { category: "Extreme Danger", message: "Heat stroke highly likely." };
  if (v >= 39.4) return { category: "Danger", message: "Heat cramps/exhaustion likely; heat stroke possible with prolonged exposure." };
  if (v >= 32.2) return { category: "Extreme Caution", message: "Heat cramps and exhaustion possible with prolonged activity." };
  if (v >= 26.7) return { category: "Caution", message: "Fatigue possible with prolonged exposure and activity." };
  return { category: "None", message: "No significant heat stress." };
}

// NWS wind chill: frostbite time thresholds (°C wind-chill).
export function windChillBand(v: number): Band {
  if (v <= -48) return { category: "Extreme", message: "Frostbite in 5 minutes or less on exposed skin." };
  if (v <= -28) return { category: "Severe", message: "Frostbite in about 10–30 minutes on exposed skin." };
  if (v <= -10) return { category: "Cold", message: "Uncomfortable; risk of frostbite with prolonged exposure." };
  return { category: "Mild", message: "Low wind-chill risk." };
}

// Environment Canada humidex comfort scale.
export function humidexBand(v: number): Band {
  if (v >= 46) return { category: "Dangerous", message: "Heat stroke imminent; avoid exertion." };
  if (v >= 40) return { category: "Great discomfort", message: "Avoid exertion." };
  if (v >= 30) return { category: "Some discomfort", message: "Some discomfort." };
  return { category: "Comfortable", message: "Little to no discomfort." };
}

// Dew-point "mugginess" scale (°C dew point).
export function dewPointBand(dp: number): Band {
  if (dp >= 24) return { category: "Oppressive", message: "Oppressive, miserable humidity." };
  if (dp >= 21) return { category: "Uncomfortable", message: "Very humid, quite uncomfortable." };
  if (dp >= 18) return { category: "Sticky", message: "Sticky, noticeably humid." };
  if (dp >= 16) return { category: "Comfortable", message: "Comfortable but slightly humid." };
  if (dp >= 10) return { category: "Comfortable", message: "Comfortable, pleasant." };
  return { category: "Dry", message: "Dry air." };
}

// Apparent temperature comfort labels (°C).
export function apparentBand(v: number): Band {
  if (v >= 40) return { category: "Very hot", message: "Dangerous heat; limit exposure." };
  if (v >= 27) return { category: "Hot", message: "Hot; stay hydrated." };
  if (v >= 16) return { category: "Comfortable", message: "Comfortable." };
  if (v >= 0) return { category: "Cool", message: "Cool." };
  return { category: "Cold", message: "Cold; risk of wind-chill effects." };
}

// WBGT flag system (ISO 7243 / U.S. military, °C).
export function wbgtBand(v: number): Band {
  if (v >= 32.2) return { category: "Black flag", message: "Extreme risk; suspend strenuous activity (work-rest ~10/50)." };
  if (v >= 31.1) return { category: "Red flag", message: "High risk; heavy exertion curtailed (work-rest ~30/30)." };
  if (v >= 29.4) return { category: "Yellow flag", message: "Moderate risk; take frequent breaks (work-rest ~45/15)." };
  if (v >= 27.8) return { category: "Green flag", message: "Low risk; stay alert and hydrated." };
  return { category: "White flag", message: "Minimal heat-stress risk." };
}

// UTCI 10-band thermal-stress scale (°C).
export function utciBand(v: number): Band {
  if (v > 46) return { category: "Extreme heat stress", message: "Extreme heat stress." };
  if (v > 38) return { category: "Very strong heat stress", message: "Very strong heat stress." };
  if (v > 32) return { category: "Strong heat stress", message: "Strong heat stress." };
  if (v > 26) return { category: "Moderate heat stress", message: "Moderate heat stress." };
  if (v > 9) return { category: "No thermal stress", message: "No thermal stress." };
  if (v > 0) return { category: "Slight cold stress", message: "Slight cold stress." };
  if (v > -13) return { category: "Moderate cold stress", message: "Moderate cold stress." };
  if (v > -27) return { category: "Strong cold stress", message: "Strong cold stress." };
  if (v > -40) return { category: "Very strong cold stress", message: "Very strong cold stress." };
  return { category: "Extreme cold stress", message: "Extreme cold stress." };
}
