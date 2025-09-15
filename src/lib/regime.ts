export type Regime = 'dry_cold' | 'heat' | 'storm' | 'normal'

export function detectRegime(tempF: number, rhPct: number, precipIn: number): Regime {
  if (precipIn > 0.3) return 'storm'
  const dry = rhPct < 40
  if (tempF <= 45 && dry) return 'dry_cold'
  if (tempF >= 85) return 'heat'
  return 'normal'
}

export function regimeEmbedding(r: Regime): number[] {
  switch (r) {
    case 'dry_cold': return [1,0,0,0]
    case 'heat': return [0,1,0,0]
    case 'storm': return [0,0,1,0]
    default: return [0,0,0,1]
  }
}

// Demo analog count: return a plausible number of similar historical events
export function similarEventCount(r: Regime, climate: string): number {
  if (r === 'dry_cold' && climate.includes('humid')) return 24 + Math.floor(Math.random()*12)
  if (r === 'heat') return 18 + Math.floor(Math.random()*10)
  if (r === 'storm') return 12 + Math.floor(Math.random()*8)
  return 8 + Math.floor(Math.random()*6)
}

