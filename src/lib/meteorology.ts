// Basic meteorology helpers for the demo. Units default to imperial where noted.

export type TempUnit = 'F' | 'C'

// Convert Fahrenheit to Celsius
export const fToC = (f: number) => (f - 32) * 5/9
// Convert Celsius to Fahrenheit
export const cToF = (c: number) => (c * 9/5) + 32

// Magnus formula approximation for dew point (returns °F if input tempF)
export function dewPointF(tempF: number, rhPct: number): number {
  const tC = fToC(tempF)
  const rh = Math.max(1e-6, Math.min(100, rhPct))
  const a = 17.27, b = 237.7
  const alpha = (a * tC) / (b + tC) + Math.log(rh / 100)
  const dpC = (b * alpha) / (a - alpha)
  return cToF(dpC)
}

// Vapor Pressure Deficit approximation (kPa). Input tempF, rh %.
export function vpd(tempF: number, rhPct: number): number {
  // Saturation vapor pressure (Tetens, using °C)
  const tC = fToC(tempF)
  const es = 0.6108 * Math.exp((17.27 * tC) / (tC + 237.3)) // kPa
  const ea = (rhPct / 100) * es
  return Math.max(0, es - ea) // kPa
}

// Heating/Cooling Degree Days contributions for one day given a base.
export function hdd(tempF: number, baseF = 65): number { return Math.max(0, baseF - tempF) }
export function cdd(tempF: number, baseF = 65): number { return Math.max(0, tempF - baseF) }

// Simple monthly climatology baselines for RH and dew point (demo only)
const monthlyRhBaseline: number[] = [65,62,60,58,60,64,66,67,66,64,66,66]
const monthlyDpBaselineF: number[] = [35,36,38,43,51,58,62,60,55,48,41,37]

export function rhAnomaly(rhPct: number, monthIdx: number): number {
  const base = monthlyRhBaseline[monthIdx % 12]
  return rhPct - base
}

export function dewPointAnomalyF(dpF: number, monthIdx: number): number {
  const base = monthlyDpBaselineF[monthIdx % 12]
  return dpF - base
}

// Composite dryness index (0..1) from VPD, RH anomaly, and dew point anomaly.
export function drynessIndex(tempF: number, rhPct: number, monthIdx: number): number {
  const dp = dewPointF(tempF, rhPct)
  const v = vpd(tempF, rhPct) // kPa, typical 0..3
  const rha = -rhAnomaly(rhPct, monthIdx) // inverse so dry → positive
  const dpa = -dewPointAnomalyF(dp, monthIdx)
  // Normalize components to rough 0..1 scales
  const vN = Math.min(1, v / 2.5)
  const rN = Math.min(1, Math.max(0, (rha + 20) / 40))
  const dN = Math.min(1, Math.max(0, (dpa + 20) / 40))
  // Weighted blend
  return Math.max(0, Math.min(1, 0.5*vN + 0.3*rN + 0.2*dN))
}

// Simple Köppen‑like climate zone inference (very rough demo heuristic)
export function climateZoneForLatLng(lat: number, lng: number): 'humid_continental'|'humid_subtropical'|'marine_west_coast'|'semi_arid'|'tropical'|'arid' {
  if (lat < -20 || lat > 20) {
    if (lat > 40) return 'humid_continental'
    if (lat > 30) return 'humid_subtropical'
    return 'marine_west_coast'
  }
  if (Math.abs(lng) > 110) return 'semi_arid'
  return 'tropical'
}

