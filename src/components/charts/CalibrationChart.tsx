import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

type Pt = { bin: string; predicted: number; observed: number }

const CalibrationChart: React.FC<{ data: Pt[] }>=({ data })=>{
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="bin" tick={{ fontSize: 12 }} />
          <YAxis domain={[0,1]} tickFormatter={(v)=>`${Math.round(v*100)}%`} />
          <Tooltip formatter={(v:number)=>`${Math.round(v*100)}%`} />
          <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} dot={false} name="Predicted" />
          <Line type="monotone" dataKey="observed" stroke="#10b981" strokeWidth={2} dot={false} name="Observed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CalibrationChart

