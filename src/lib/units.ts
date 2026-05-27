export const cToF = (c: number): number => (c * 9) / 5 + 32;
export const fToC = (f: number): number => ((f - 32) * 5) / 9;
export const mphToMs = (mph: number): number => mph * 0.44704;
export const msToMph = (ms: number): number => ms / 0.44704;
export const msToKmh = (ms: number): number => ms * 3.6;
export const round1 = (n: number): number => Math.round((n + Number.EPSILON) * 10) / 10;
