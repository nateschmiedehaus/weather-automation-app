import React from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

type Pt = { day: string; control: number; treated: number }

const HoldoutChart: React.FC<{ data: Pt[] }>=({ data })=>{
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v)=>`$${v.toLocaleString()}`} />
          <Tooltip formatter={(v:number)=>`$${v.toLocaleString()}`} />
          <Area type="monotone" dataKey="control" stroke="#64748b" fill="url(#c)" strokeWidth={2} name="Control" />
          <Area type="monotone" dataKey="treated" stroke="#10b981" fill="url(#t)" strokeWidth={2} name="With Weather AI" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HoldoutChart

