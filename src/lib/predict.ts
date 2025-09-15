import { buildFeatureVector, toArray, FeatureVector, featureNames } from './features'
import { getCategoryClimatePrior, blendPriorAndOnline } from './networkPriors'
import { OnlineState, initOnline, ucbScore, updateOnline, theta } from './online'
import { climateZoneForLatLng } from './meteorology'

export type PredictInput = {
  brandKey: string
  brand: { location: { lat: number; lng: number } }
  category: string
  weather: any
  scenario?: any
  spendTodayNorm?: number
  spend7dNorm?: number
  geoKey?: string
}

export type PredictOutput = {
  features: FeatureVector
  x: number[]
  theta: number[]
  mean: number
  ucb: number
  confidence: number
  priorPool: number
  var: number
}

// Simple demo registry for per‑cohort online states
const onlineRegistry: Record<string, OnlineState> = {}

export function cohortKey(brandKey: string, category: string, geoKey?: string): string {
  return `${brandKey}::${category}::${geoKey ?? 'default'}`
}

export function ensureState(key: string, dim: number): OnlineState {
  if (!onlineRegistry[key]) onlineRegistry[key] = initOnline(dim, 5)
  return onlineRegistry[key]
}

export function scoreCategory(input: PredictInput): PredictOutput {
  const { brandKey, brand, category, weather, scenario, spendTodayNorm = 0.5, spend7dNorm = 0.5 } = input
  const features = buildFeatureVector({ weather, scenario, spendTodayNorm, spend7dNorm })
  const x = toArray(features)
  const key = cohortKey(brandKey, category, input.geoKey)
  const st = ensureState(key, x.length)

  const climate = climateZoneForLatLng(brand.location.lat, brand.location.lng)
  const prior = getCategoryClimatePrior(category, climate)
  const thOnline = theta(st)
  const blend = blendPriorAndOnline(prior, thOnline)

  // Temporarily swap state theta towards blended theta for scoring (demo):
  // mean = x·theta_blend, var from A^{-1}
  let mean = 0
  for (let i = 0; i < x.length; i++) mean += blend.theta[i] * x[i]
  const u = ucbScore(st, x, 1.1)
  const ucbVal = 0.5 * u.ucb + 0.5 * mean

  return {
    features,
    x,
    theta: blend.theta,
    mean,
    ucb: ucbVal,
    confidence: blend.confidence,
    priorPool: prior.poolSize,
    var: u.var,
  }
}

// Demo update step: use a pseudo reward from current feature mix (dryness + spend support) when user applies actions
export function updateCategory(input: PredictInput, reward?: number): void {
  const { brandKey, category } = input
  const out = scoreCategory(input)
  const pseudo = typeof reward === 'number' ? reward : (0.6 * out.features.dryness01 + 0.3 * out.features.promoStrength + 0.1 * out.features.spendTodayNorm)
  const st = ensureState(cohortKey(brandKey, category, input.geoKey), out.x.length)
  const newSt = updateOnline(st, out.x, pseudo)
  onlineRegistry[cohortKey(brandKey, category, input.geoKey)] = newSt
}

export { featureNames }
