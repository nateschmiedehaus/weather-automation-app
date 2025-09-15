import React, { useMemo } from 'react'
import { Lightbulb, Activity, CloudRainWind, Wind, Sun, Snowflake, TrendingUp } from 'lucide-react'
import { featureNames } from '../lib/predict'

type Wx = { date:string; tempF:number; rhPct:number; vpdKpa:number; precipIn:number; pop:number; windMph:number; gustMph:number; cloudCover:number; precipType:string }

const chip = (text:string, cls:string) => (
  <span className={`px-2 py-0.5 rounded-full border text-[11px] ${cls}`}>{text}</span>
)

const AIInsights: React.FC<{ forecast: Array<Wx>; predictions: any[] }>=({ forecast, predictions })=>{
  const items = useMemo(()=>{
    const d0 = forecast?.[0]
    const d2 = forecast?.[2]
    const next3 = forecast?.slice(0,3) || []
    const drynessMom = (d0 && d2) ? (d0.vpdKpa - d2.vpdKpa) : 0
    const tempDelta3 = (d0 && d2) ? (d0.tempF - d2.tempF) : 0
    const rainLikely = next3.some(d=> d.precipType==='Rain' || d.pop>0.55)
    const windy = next3.some(d=> d.gustMph>26)

    // Inspect features roughly for promos/weekend composites
    const fx = (predictions?.[0]?.features as number[]) || []
    const idx = (name:string)=> featureNames.findIndex(n=> n===name)
    const weekendxPromo = fx[idx('WeekendxPromo')] ?? 0
    const vpdxhdd = fx[idx('VPDxHDD')] ?? 0

    const insights: Array<{icon: JSX.Element; title:string; desc:string; tags:string[]; status:'emerging'|'validated'}> = []

    if (drynessMom>0.35 && vpdxhdd>0.15) {
      insights.push({
        icon: <Activity className="w-4 h-4"/>,
        title: 'Dryness + Heating Momentum',
        desc: 'Rising dryness and heating demand likely to elevate humidifier/filters conversion.',
        tags: ['DrynessMomentum','VPD×HDD','Comfort'],
        status: 'validated'
      })
    }

    if (tempDelta3>7 && (d0?.rhPct ?? 0)>60) {
      insights.push({
        icon: <Sun className="w-4 h-4"/>,
        title: 'Humid Warm Surge',
        desc: 'Sudden warm & humid spell suggests elevated wellness/indoor air demand.',
        tags: ['ComfortShock','Humidity','Wellness'],
        status: 'emerging'
      })
    }

    if (rainLikely && windy) {
      insights.push({
        icon: <CloudRainWind className="w-4 h-4"/>,
        title: 'Storm Delay → Post‑Storm Recovery',
        desc: 'Expect short‑term activity drop; plan a post‑storm recovery push (outdoor gear, patio).',
        tags: ['Storm','Recovery','Timing'],
        status: 'validated'
      })
    }

    if (weekendxPromo>0.1) {
      insights.push({
        icon: <TrendingUp className="w-4 h-4"/>,
        title: 'Weekend × Promo Resonance',
        desc: 'Promotions set to resonate more over the weekend — schedule budget staging accordingly.',
        tags: ['Weekend×Promo','Resonance','Staging'],
        status: 'emerging'
      })
    }

    if (!insights.length) {
      insights.push({ icon:<Lightbulb className="w-4 h-4"/>, title:'Stable outlook', desc:'No strong composite signals detected', tags:['Stable'], status:'validated'})
    }

    return insights.slice(0,3)
  }, [forecast, predictions])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((ins, i)=> (
        <div key={i} className="glass-subtle p-4 border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">{ins.icon}</span>
              <div className="text-sm font-semibold text-gray-900">{ins.title}</div>
            </div>
            {chip(ins.status==='validated' ? 'Validated' : 'Emerging', ins.status==='validated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200')}
          </div>
          <div className="text-xs text-gray-700 mb-2">{ins.desc}</div>
          <div className="flex flex-wrap gap-1">
            {ins.tags.map(t => chip(t, 'bg-gray-50 text-gray-700 border-gray-200'))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AIInsights

