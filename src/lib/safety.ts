export type SafetyState = { status: 'OK'|'DEGRADED'|'HALT'; reasons: string[]; damping: number }

export function computeSafety(forecast: Array<any>): SafetyState {
  if (!forecast || forecast.length<3) return { status:'DEGRADED', reasons:['insufficient_forecast'], damping: 0.8 }
  const next3 = forecast.slice(0,3)
  const uvMax = Math.max(...next3.map((d:any)=> d.uvIndex ?? 0))
  const gustMax = Math.max(...next3.map((d:any)=> d.gustMph ?? 0))
  const popMax = Math.max(...next3.map((d:any)=> d.pop ?? 0))
  const tempRange = Math.max(...next3.map((d:any)=> d.tempF ?? 0)) - Math.min(...next3.map((d:any)=> d.tempF ?? 0))
  const reasons: string[] = []
  let status: SafetyState['status'] = 'OK'
  let damping = 1.0

  // Soft dampers
  if (gustMax > 26) { reasons.push('wind_gusts'); damping *= 0.8; }
  if (popMax > 0.6) { reasons.push('precip_probability'); damping *= 0.85; }
  if (tempRange > 20) { reasons.push('temp_whiplash'); damping *= 0.9; }

  // Hard halt (demo): extreme uncertainty placeholder
  const entropyProxy = Math.max(0, Math.min(1, (popMax + Math.min(1, gustMax/35) + Math.min(1, tempRange/25))/3))
  if (entropyProxy > 0.85) { status = 'HALT'; reasons.push('forecast_entropy_high'); damping = 0.0 }
  else if (reasons.length) { status = 'DEGRADED' }

  return { status, reasons, damping }
}

