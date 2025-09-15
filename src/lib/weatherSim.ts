import { hashString, mulberry32 } from './rng'
import type { USState } from './geo'
import { dewPointF, vpd, hdd } from './meteorology'

export type DailyWx = {
  date: string
  tempF: number
  rhPct: number
  precipIn: number
  windMph: number
  gustMph: number
  condition: string
  precipType: 'Rain'|'Snow'|''
  dewPointF: number
  vpdKpa: number
  hdd: number
  cloudCover: number  // 0..1
  uvIndex: number     // 0..11
  pressureHpa: number
  visibilityMi: number
  pop: number         // probability of precip 0..1
  sunrise: string
  sunset: string
}

export function generateForecast(state: Pick<USState,'lat'|'lng'|'region'|'climate'|'coastal'>, start: Date, days: number): DailyWx[] {
  const out: DailyWx[] = []
  const { lat, lng, region, climate, coastal } = state
  const baseSeed = hashString(`${lat.toFixed(2)}:${lng.toFixed(2)}:${start.toDateString()}:${region}:${climate}:${coastal}`)
  const base = mulberry32(baseSeed)
  const dayOfYear = (d: Date) => Math.floor((+new Date(d.getFullYear(), d.getMonth(), d.getDate()) - +new Date(d.getFullYear(),0,0)) / 86400000)
  const doys = dayOfYear(start)
  // Regional/climate adjustments
  const tempAmp = (
    climate==='desert' ? 24 :
    climate==='mountain' ? 22 :
    climate==='mediterranean' ? 18 :
    climate==='marine_west' ? 15 :
    climate==='humid_subtropical' ? 20 : 21
  )
  const rhBaseAdj = (
    climate==='desert' ? -15 :
    climate==='humid_subtropical' ? +15 :
    climate==='marine_west' ? +8 :
    0
  )
  const precipBias = (
    climate==='desert' ? -0.3 :
    climate==='humid_subtropical' ? +0.2 :
    climate==='marine_west' ? +0.15 :
    climate==='mediterranean' ? (doys>270||doys<90 ? +0.2 : -0.2) : 0
  )
  const windBias = (
    climate==='mountain' ? +5 :
    region==='MIDWEST' ? +3 : 0
  )
  for (let i=0;i<days;i++) {
    const d = new Date(start); d.setDate(d.getDate()+i)
    const seed = mulberry32(hashString(`${baseSeed}-${i}`))
    // seasonal temp baseline (°F): vary by latitude and day of year
    const phase = Math.sin((2*Math.PI*(doys+i))/365)
    const latAdj = (50 - Math.min(50, Math.max(20, Math.abs(lat)))) * 0.2 // cooler at higher lat
    const tBase = 60 + phase*tempAmp - latAdj
    const tempF = tBase + (seed()-0.5)*8
    const rhPct = Math.max(15, Math.min(98, 55 + rhBaseAdj + (seed()-0.5)*25 - phase*8))
    const precipIn = Math.max(0, (seed()> (0.75 - precipBias) ? seed()*0.9 : 0))
    const windMph = Math.max(0, 5 + windBias + (seed()-0.5)*10)
    const cloudCover = Math.max(0, Math.min(1, 0.5 + (seed()-0.5)*0.8))
    const uvIndex = Math.max(0, Math.min(11, 7 + phase*3 + (seed()-0.5)*2))
    const pressureHpa = 1013 + (seed()-0.5)*20
    const visibilityMi = Math.max(1, 10 + (seed()-0.5)*4 - precipIn*6)
    const gustMph = Math.max(windMph, windMph + Math.abs(seed()-0.5)*8)
    const pop = Math.max(0, Math.min(1, precipIn>0 ? 0.6 + (seed()-0.5)*0.2 : 0.2 + (seed()-0.5)*0.2))
    const precipType = (precipIn>0.2 ? (tempF<32 ? 'Snow' : 'Rain') : '') as 'Rain'|'Snow'|''
    const condition = (()=>{
      if (precipIn>0.4 && tempF<32) return 'Snow'
      if (precipIn>0.4) return 'Rain'
      if (cloudCover>0.7) return 'Cloudy'
      if (windMph>22) return 'Windy'
      return seed()>0.5 ? 'Partly Cloudy' : 'Clear'
    })()
    // crude sunrise/sunset approximation
    const len = 12 + 4*Math.sin((2*Math.PI*(doys+i-80))/365)*Math.cos(Math.abs(lat)*Math.PI/180)
    const sunriseHour = Math.max(5.0, 12 - len/2)
    const sunsetHour = Math.min(21.0, 12 + len/2)
    const sunrise = new Date(d); sunrise.setHours(Math.floor(sunriseHour), Math.floor((sunriseHour%1)*60), 0, 0)
    const sunset = new Date(d); sunset.setHours(Math.floor(sunsetHour), Math.floor((sunsetHour%1)*60), 0, 0)
    const dpF = dewPointF(tempF, rhPct)
    const v = vpd(tempF, rhPct)
    const H = hdd(tempF)
    out.push({ date: d.toISOString(), tempF, rhPct, precipIn, windMph, gustMph, condition, precipType, dewPointF: dpF, vpdKpa: v, hdd: H, cloudCover, uvIndex, pressureHpa, visibilityMi, pop, sunrise: sunrise.toISOString(), sunset: sunset.toISOString() })
  }
  return out
}
