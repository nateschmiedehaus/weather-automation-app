import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

type Row = { name: string; contribution: number }

const ExplorerCharts: React.FC<{ data: Row[] }> = ({ data }) => {
  const chartData = data.map(d => ({ ...d, value: Math.round(Math.abs(d.contribution) * 100) }))

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip formatter={(v) => `${v}%`} labelStyle={{ fontSize: 12 }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#grad)" />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ExplorerCharts

