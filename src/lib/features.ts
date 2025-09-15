import { dewPointF, vpd, hdd, rhAnomaly, dewPointAnomalyF, drynessIndex } from './meteorology'

export type Scenario = {
  tempAdj: number
  precipAdj: number
  promoAdj: number
  campaignAdj: number
  adSpendAdj: number
}

export type FeatureVector = {
  tempF: number
  rhPct: number
  precipIn: number
  dpF: number
  vpdKpa: number
  hdd: number
  rhAnom: number
  dpAnomF: number
  dryness01: number
  drynessTrend: number
  weekend: number
  promoActive: number
  promoStrength: number
  campaignActive: number
  campaignStrength: number
  spendTodayNorm: number
  spend7dNorm: number
  vpdTimesHdd: number
  weekendTimesPromo: number
  drynessMomentum7d: number
  comfortShock7d: number
}

export function buildFeatureVector(opts: {
  weather: any
  scenario?: Scenario
  spendTodayNorm?: number
  spend7dNorm?: number
  date?: Date
  promoActive?: boolean
  campaignActive?: boolean
  recent?: Array<{ tempF:number; rhPct:number }>
}): FeatureVector {
  const { weather, scenario, spendTodayNorm = 0.5, spend7dNorm = 0.5, date = new Date(), promoActive, campaignActive, recent } = opts
  const month = date.getMonth()
  const isWeekend = [0,6].includes(date.getDay()) ? 1 : 0

  // Base from weather
  let tempF = Number(weather?.current?.temperature ?? 65)
  let rhPct = Number(weather?.current?.humidity ?? 55)
  let precipIn = Number(weather?.current?.precipitation ?? 0)

  // Scenario adjustments
  if (scenario) {
    tempF = tempF * (1 + scenario.tempAdj * 0.15)
    precipIn = Math.max(0, precipIn + scenario.precipAdj * 0.5)
  }

  const dpF = dewPointF(tempF, rhPct)
  const v = vpd(tempF, rhPct)
  const h = hdd(tempF)
  const rha = rhAnomaly(rhPct, month)
  const dpa = dewPointAnomalyF(dpF, month)
  const dry = drynessIndex(tempF, rhPct, month)
  // Demo dryness trend: compare with slight temp shift as proxy
  const dryPrev = drynessIndex(tempF - 2, rhPct, month)
  const dryTrend = Math.max(-1, Math.min(1, dry - dryPrev))

  const promoStrength = Math.max(0, Math.min(1, (scenario?.promoAdj ?? 0)))
  const campaignStrength = Math.max(0, Math.min(1, (scenario?.campaignAdj ?? 0)))
  // Recent 7d trends (demo): compute dryness momentum and comfort shock
  let drynessMomentum7d = 0
  let comfortShock7d = 0
  if (recent && recent.length>2) {
    const vpds = recent.map(r => vpd(r.tempF, r.rhPct))
    const mom = vpds[vpds.length-1] - vpds[0]
    drynessMomentum7d = Math.max(-1, Math.min(1, mom/2.5))
    const tDelta = (recent[recent.length-1].tempF - recent[0].tempF)
    comfortShock7d = Math.max(-1, Math.min(1, tDelta/20))
  }

  return {
    tempF, rhPct, precipIn,
    dpF, vpdKpa: v,
    hdd: h,
    rhAnom: rha,
    dpAnomF: dpa,
    dryness01: dry,
    drynessTrend: dryTrend,
    weekend: isWeekend,
    promoActive: (promoActive ? 1 : 0) || (promoStrength > 0 ? 1 : 0),
    promoStrength,
    campaignActive: (campaignActive ? 1 : 0) || (campaignStrength > 0 ? 1 : 0),
    campaignStrength,
    spendTodayNorm: Math.max(0, Math.min(1, spendTodayNorm * (1 + (scenario?.adSpendAdj ?? 0) * 0.5))),
    spend7dNorm: Math.max(0, Math.min(1, spend7dNorm)),
    vpdTimesHdd: v * h,
    weekendTimesPromo: isWeekend * promoStrength,
    drynessMomentum7d,
    comfortShock7d,
  }
}

export function toArray(f: FeatureVector): number[] {
  return [
    f.tempF, f.rhPct, f.precipIn, f.dpF, f.vpdKpa,
    f.hdd, f.rhAnom, f.dpAnomF, f.dryness01, f.drynessTrend,
    f.weekend,
    f.promoActive, f.promoStrength,
    f.campaignActive, f.campaignStrength,
    f.spendTodayNorm, f.spend7dNorm,
    f.vpdTimesHdd, f.weekendTimesPromo,
    f.drynessMomentum7d, f.comfortShock7d,
  ]
}

export const featureNames = [
  'TempF','RH%','PrecipIn','DewPointF','VPD(kPa)',
  'HDD','RH_Anom','DP_AnomF','Dryness01','DrynessTrend','Weekend',
  'PromoActive','PromoStrength','CampaignActive','CampaignStrength',
  'SpendToday','Spend7d','VPDxHDD','WeekendxPromo','DrynessMomentum7d','ComfortShock7d'
]
