import React, { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts'

type Wx = { date:string; tempF:number; rhPct:number; precipIn:number; windMph:number; gustMph:number; dewPointF:number; vpdKpa:number; hdd:number; condition:string; precipType: 'Rain'|'Snow'|''; cloudCover:number; uvIndex:number; pressureHpa:number; visibilityMi:number; pop:number; sunrise:string; sunset:string }
const WeatherPanel: React.FC<{ forecast: Array<Wx> }>=({ forecast })=>{
  const today = forecast?.[0]
  const next = forecast?.slice(0,7).map(d=>({ day: new Date(d.date).toLocaleDateString(undefined,{weekday:'short'}), temp: Math.round(d.tempF), precip: +(d.pop*100).toFixed(0), wind: Math.round(d.windMph), rh: Math.round(d.rhPct) })) || []
  const highlight = (() => {
    if (!forecast || forecast.length<3) return { title:'Stable outlook', desc:'No strong shifts detected', icon:'🌤️' }
    const d0 = forecast[0], d1 = forecast[1], d2 = forecast[2]
    const next3 = [d0,d1,d2]
    const next7 = forecast.slice(0,7)
    const popMax3 = Math.max(...next3.map(d=>d.pop))
    const gustMax3 = Math.max(...next3.map(d=>d.gustMph))
    const windAvg3 = next3.reduce((s,d)=> s + d.windMph,0)/3
    const vpdMom3 = (d0.vpdKpa - d2.vpdKpa)
    const tempChange3 = d0.tempF - d2.tempF
    const rhAvg3 = next3.reduce((s,d)=> s + d.rhPct,0)/3
    const snowLikely = next3.some(d=> d.precipType==='Snow' || (d.precipIn>0.2 && d.tempF<32))
    const rainLikely = next3.some(d=> d.precipType==='Rain' || d.pop>0.55)
    const overcast = next3.every(d=> d.cloudCover>0.75)
    const maxUV7 = Math.max(...next7.map(d=>d.uvIndex))
    const tempRange7 = Math.max(...next7.map(d=>d.tempF)) - Math.min(...next7.map(d=>d.tempF))
    const vpdMom7 = next7[0].vpdKpa - next7[next7.length-1].vpdKpa

    if (snowLikely) return { title:'Snow Event Expected', desc:'High chance of snow in the next few days', icon:'❄️' }
    if (rainLikely && (gustMax3>24 || windAvg3>17)) return { title:'Storm Risk Rising', desc:'Elevated precip probability with strong winds', icon:'⛈️' }
    if (rainLikely) return { title:'Rain Episode', desc:'Likely rain in the short term', icon:'🌧️' }
    if (vpdMom3>0.35 && d0.hdd>5) return { title:'Dry Cold Momentum', desc:'Dryness rising with heating demand ↑', icon:'❄️' }
    if (tempChange3>7 && rhAvg3>58) return { title:'Humid Warm Surge', desc:'Sudden warm & humid spell', icon:'🌡️' }
    if (gustMax3>28) return { title:'Wind Advisory', desc:'Strong gusts expected', icon:'🌬️' }
    if (maxUV7>8) return { title:'High UV Window', desc:'Elevated UV index expected', icon:'☀️' }
    if (tempRange7>20) return { title:'Temperature Whiplash', desc:'Large swings over the next week', icon:'🌪️' }
    if (vpdMom7>0.5 && rhAvg3<45) return { title:'Drying Trend', desc:'Air drying out notably', icon:'💨' }
    if (overcast) return { title:'Overcast Pattern', desc:'High cloud cover likely to persist', icon:'☁️' }
    // As a last resort, occasionally surface an interesting neutral highlight based on middling signals
    const midPop = next3.some(d=> d.pop>0.35 && d.pop<0.55)
    if (midPop && Math.random()<0.5) return { title:'Scattered Showers Possible', desc:'Intermittent light precip possible', icon:'🌦️' }
    return { title:'Stable outlook', desc:'No strong shifts detected', icon:'🌤️' }
  })()
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-3 border rounded-xl p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Outlook highlight</div>
            <div className="text-sm font-semibold text-gray-900">{highlight.title}</div>
            <div className="text-xs text-gray-600">{highlight.desc}</div>
          </div>
          <div className="text-3xl">{highlight.icon}</div>
        </div>
      </div>
      <div className="md:col-span-2 border rounded-xl p-4 bg-white">
        <div className="text-sm font-medium mb-2">7‑Day Temperature Outlook</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={next}>
            <defs>
              <linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={['auto','auto']} />
            <Tooltip />
            <Area type="monotone" dataKey="temp" stroke="#3b82f6" fill="url(#tgrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="border rounded-xl p-4 bg-white">
        <div className="text-sm font-medium mb-2">Precipitation Chance</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={next}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v)=>`${v}%`} />
            <Tooltip formatter={(v:number)=>`${v}%`} />
            <Bar dataKey="precip" fill="#0ea5e9" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Temp</div><div className="text-lg font-bold">{Math.round(today?.tempF ?? 0)}°F</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Feels Like</div><div className="text-lg font-bold">{Math.round((today?.tempF ?? 0) - 2)}°F</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">RH</div><div className="text-lg font-bold">{Math.round(today?.rhPct ?? 0)}%</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Dew Point</div><div className="text-lg font-bold">{Math.round(today?.dewPointF ?? 0)}°F</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">VPD</div><div className="text-lg font-bold">{(today?.vpdKpa ?? 0).toFixed(2)} kPa</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">HDD</div><div className="text-lg font-bold">{Math.round(today?.hdd ?? 0)}</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Wind</div><div className="text-lg font-bold">{Math.round(today?.windMph ?? 0)} mph</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Gusts</div><div className="text-lg font-bold">{Math.round(today?.gustMph ?? 0)} mph</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Pressure</div><div className="text-lg font-bold">{Math.round(today?.pressureHpa ?? 0)} hPa</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">UV Index</div><div className="text-lg font-bold">{Math.round(today?.uvIndex ?? 0)}</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Visibility</div><div className="text-lg font-bold">{Math.round(today?.visibilityMi ?? 0)} mi</div></div>
        <div className="border rounded-lg p-3 bg-white"><div className="text-xs text-gray-500">Cloud Cover</div><div className="text-lg font-bold">{Math.round((today?.cloudCover ?? 0)*100)}%</div></div>
      </div>
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4 bg-white">
          <div className="text-sm font-medium mb-2">7‑Day Humidity Trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={next}>
              <defs>
                <linearGradient id="hgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v)=>`${v}%`} />
              <Tooltip formatter={(v:number)=>`${v}%`} />
              <Area type="monotone" dataKey="rh" stroke="#22c55e" fill="url(#hgrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <div className="text-sm font-medium mb-2">7‑Day Wind Trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={next}>
              <defs>
                <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="wind" stroke="#64748b" fill="url(#wgrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default WeatherPanel
