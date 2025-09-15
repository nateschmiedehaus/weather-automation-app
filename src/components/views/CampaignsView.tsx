import React, { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import WeatherPanel from '../WeatherPanel'

type Props = {
  brand: any
  brandKey: string
  campaigns: any[]
  setCampaigns: (fn: (prev: any[]) => any[]) => void
  weather: any
  onBack: () => void
  onApply?: () => void
  forecast?: Array<any>
}

const channelEffectiveness: Record<string, Record<'meta'|'google'|'tt'|'email', number>> = {
  winter:   { meta: 0.7, google: 0.9, tt: 0.4, email: 0.8 },
  rain:     { meta: 0.6, google: 0.8, tt: 0.5, email: 0.7 },
  summer:   { meta: 0.9, google: 0.9, tt: 0.6, email: 0.6 },
  outdoor:  { meta: 0.9, google: 0.8, tt: 0.6, email: 0.6 },
} as any

const CampaignsView: React.FC<Props> = ({ brand, brandKey, campaigns, setCampaigns, weather, onBack, onApply, forecast }) => {
  const categories = Object.keys(brand.products.categories)
  const ctx = useMemo(()=>({
    tempF: weather?.current?.temperature ?? 65,
    precip: weather?.current?.precipitation ?? 0,
    comfort: (weather?.scientific?.comfortIndex ?? 50)/100,
  }), [weather])

  const toggleTag = (cid: string, tag: string) => {
    setCampaigns((prev: any[]) => prev.map(c => {
      if (c.id !== cid) return c
      const tags = new Set<string>(c.categoryTags || [])
      if (tags.has(tag)) tags.delete(tag); else tags.add(tag)
      return { ...c, categoryTags: Array.from(tags) }
    }))
  }

  const ChannelBars = ({ tag, channels }:{ tag: string; channels: ('meta'|'google'|'tt'|'email')[] }) => {
    const eff = channelEffectiveness[tag] || { meta:0.8, google:0.8, tt:0.5, email:0.6 }
    const data = channels.map(ch => ({ name: ch, value: Math.round((eff[ch]||0.6)*100) }))
    return (
      <div className="w-full h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip formatter={(v) => `${v}%`} labelStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" radius={[6,6,0,0]} fill="url(#grad2)" />
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const suggestion = (tag:string) => {
    const t = ctx.tempF, p = ctx.precip, com = ctx.comfort
    if (brandKey==='kingsford' && tag==='summer') {
      if (t>75 && p<0.1) return '↑ Strong (hot & dry)'
      if (p>0.2 || t<55) return '↓ Pause (rain/cold)'
      return '→ Steady'
    }
    if (brandKey==='norsari' && tag==='winter') {
      if (t>65) return '↓ Pause (off‑season)'
      if (t<40) return '↑↑ Strong (cold snap)'
      return '→ Scale moderately'
    }
    if (tag==='rain') return p>0.2 ? '↑ Rain active' : '→ Low'
    return '→ Steady'
  }

  const suggestionValue = (tag:string) => {
    const t = ctx.tempF, p = ctx.precip
    if (brandKey==='kingsford' && tag==='summer') {
      if (t>75 && p<0.1) return 0.9
      if (p>0.2 || t<55) return 0.0
      return 0.6
    }
    if (brandKey==='norsari' && tag==='winter') {
      if (t>65) return 0.0
      if (t<40) return 0.85
      return 0.6
    }
    if (tag==='rain') return p>0.2 ? 0.75 : 0.4
    return 0.6
  }

  const clamp01 = (v:number) => Math.max(0, Math.min(1, v))

  const applyAll = () => {
    setCampaigns((prev:any[]) => prev.map(c => {
      const tags = c.categoryTags || []
      const sug = tags.length ? clamp01(tags.map((t:string)=>suggestionValue(t)).reduce((a:number,b:number)=>a+b,0)/tags.length) : (c.budgetWeight ?? 0.5)
      return { ...c, budgetWeight: sug }
    }))
    onApply && onApply()
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="px-3 py-1 rounded-full bg-white border text-gray-700 hover:bg-gray-50">← Back</button>
            <h2 className="text-xl font-semibold">Campaigns (Meta · Google)</h2>
            <div>
              {campaigns.length>0 && (
                <button onClick={applyAll} className="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700">Apply All Suggested</button>
              )}
            </div>
          </div>

          {forecast && (
            <div className="mb-6">
              <WeatherPanel forecast={forecast as any} />
            </div>
          )}

          {campaigns.length===0 ? (
            <div className="text-gray-600">No active campaigns detected for the selected date.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((c:any) => (
                <div key={c.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Campaign {c.id.toUpperCase()}</div>
                    <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">{c.channels.join(' + ')}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Regions: {(c.regions ?? ['US']).join(', ')}</div>
                  <div className="text-sm text-gray-600">Budget push: {(c.budgetWeight ?? 0.5).toFixed(2)}</div>

                  <div className="mt-3">
                    <label className="text-xs text-gray-500">Category tags (drive alignment)</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((cat: string) => {
                        const on = (c.categoryTags||[]).includes(cat)
                        return (
                          <button key={cat} onClick={()=> toggleTag(c.id, cat)}
                            className={`px-2 py-1 rounded-full text-xs border ${on ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-700 border-gray-200'} hover:opacity-90`}>{cat}</button>
                        )
                      })}
                    </div>
                  </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Per‑tag channel visibility</div>
                  <div className="grid grid-cols-2 gap-3">
                    {(c.categoryTags||[]).slice(0,4).map((tag:string)=>(
                      <div key={tag} className="border rounded-lg p-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">{tag} • {suggestion(tag)}</div>
                        <ChannelBars tag={tag} channels={c.channels} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Allocation */}
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Suggested budget reallocation</div>
                  {(() => {
                    const tags = (c.categoryTags||[])
                    const avg = tags.length ? tags.reduce((s:string[],t:string)=>s,[ ]).length : 0
                    const suggested = tags.length ? clamp01(tags.map((t:string)=>suggestionValue(t)).reduce((a:number,b:number)=>a+b,0)/tags.length) : 0.5
                    const current = clamp01(c.budgetWeight ?? 0.5)
                    const pct = (n:number)=> Math.round(n*100)
                    return (
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>Current: {pct(current)}%</span>
                          <span>Suggested: {pct(suggested)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="bg-indigo-400 h-2 rounded-full" style={{width: `${pct(current)}%`}} />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${pct(suggested)}%`}} />
                        </div>
                        <div className="mt-3 text-right">
                          <button className="px-3 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={()=>{
                            setCampaigns((prev:any[])=> prev.map(x=> x.id===c.id ? { ...x, budgetWeight: suggested } : x))
                            onApply && onApply()
                          }}>Apply Suggested Allocation</button>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-600">Automation for this campaign</div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer"/>
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-emerald-500 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-5 transition"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CampaignsView
