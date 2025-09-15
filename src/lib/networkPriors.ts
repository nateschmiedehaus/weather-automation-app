import { featureNames } from './features'

export type Prior = { mu: number[]; sigma: number; poolSize: number }

const idx = Object.fromEntries(featureNames.map((n, i) => [n, i])) as Record<string, number>

function baseMu(): number[] { return Array(featureNames.length).fill(0) }

// Demo priors by category × climate zone emphasizing relevant meteorology
export function getCategoryClimatePrior(category: string, climate: string): Prior {
  const mu = baseMu()
  let sigma = 0.6
  let pool = 3

  const set = (name: string, val: number) => { mu[idx[name]] = val }

  if (/humidifier|indoor|winter/i.test(category)) {
    // Humidity-centric products
    set('VPD(kPa)', 0.35)
    set('DP_AnomF', -0.1) // lower dew point → stronger signal
    set('RH_Anom', -0.12) // lower RH → stronger signal
    set('HDD', 0.08)
    set('Dryness01', 0.25)
    set('DrynessTrend', 0.12)
    set('VPDxHDD', 0.15)
    sigma = 0.45
    pool = 7
  } else if (/summer|outdoor/i.test(category)) {
    set('TempF', 0.18)
    set('VPD(kPa)', 0.12)
    set('Weekend', 0.06)
    set('WeekendxPromo', 0.08)
    sigma = 0.55
    pool = 6
  } else if (/rain/i.test(category)) {
    set('PrecipIn', 0.25)
    set('RH_Anom', 0.08)
    sigma = 0.5
    pool = 5
  }

  // Climate adjustments
  if (/humid_continental|marine/.test(climate)) {
    mu[idx['HDD']] += 0.05
    mu[idx['TempF']] += 0.04
  }
  if (/humid_subtropical|tropical/.test(climate)) {
    mu[idx['RH_Anom']] += -0.05
    mu[idx['VPD(kPa)']] += 0.05
  }

  // Simulated anonymity: require k≥5 to use prior strongly
  const poolSize = pool
  return { mu, sigma, poolSize }
}

export function blendPriorAndOnline(prior: Prior, thetaOnline: number[] | null): { theta: number[]; confidence: number } {
  const mu = prior.mu
  if (!thetaOnline || prior.poolSize < 5) {
    return { theta: mu, confidence: 0.6 }
  }
  const theta = mu.map((m, i) => 0.5 * m + 0.5 * thetaOnline[i])
  return { theta, confidence: 0.75 }
}
