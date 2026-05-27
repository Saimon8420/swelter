// Magnus–Tetens coefficients (Alduchov & Eskridge 1996).
const B = 17.625;
const C = 243.04;

// Saturation vapour pressure over water, hPa.
export const satVaporPressure = (tC: number): number => 6.112 * Math.exp((B * tC) / (C + tC));

// Actual vapour pressure at temp tC and relative humidity rh (%), hPa.
export const vaporPressure = (tC: number, rh: number): number => satVaporPressure(tC) * (rh / 100);

// Dew point (°C) from temperature and relative humidity.
export const rhToDewPoint = (tC: number, rh: number): number => {
  const gamma = Math.log(rh / 100) + (B * tC) / (C + tC);
  return (C * gamma) / (B - gamma);
};

// Relative humidity (%) from temperature and dew point.
export const dewPointToRh = (tC: number, dewPointC: number): number =>
  100 * Math.exp((B * dewPointC) / (C + dewPointC) - (B * tC) / (C + tC));
