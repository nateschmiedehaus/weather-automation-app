import React, { Suspense, lazy, useMemo } from 'react'
import { featureNames } from '../../lib/predict'
import WeatherPanel from '../WeatherPanel'

type Props = {
  brand: any
  predictions: any[]
  onBack: () => void
  forecast?: Array<any>
}

const ExplorerView: React.FC<Props> = ({ brand, predictions, onBack, forecast }) => {
  const cats = Object.keys(brand.products.categories)
  const contribByCat: Record<string, Array<{name:string; contribution:number}>> = {}

  cats.forEach(cat => {
    const p = predictions.find(s => s.category===cat)
    if (p) {
      const x: number[] = (p.features || []) as any
      const th: number[] = ((p as any).theta || []).length ? (p as any).theta : x.map(()=>0)
      const pairs = x.map((v:number,i:number)=> ({ name: featureNames[i] || `f${i}`, raw: th[i]*v }))
      const total = pairs.reduce((s,a)=> s + Math.abs(a.raw), 0) || 1
      const norm = pairs.map(a => ({ name: a.name, contribution: a.raw/total })) // fraction [-1..1], sums to ±1
      contribByCat[cat] = norm
        .sort((a,b)=> Math.abs(b.contribution)-Math.abs(a.contribution))
        .slice(0,5)
    }
  })

  const ExplorerCharts = useMemo(() => lazy(() => import('../charts/ExplorerCharts')) as any, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="px-3 py-1 rounded-full bg-white border text-gray-700 hover:bg-gray-50">← Back</button>
            <h2 className="text-xl font-semibold">Explorer — What drives each category?</h2>
            <div/>
          </div>

          {forecast && (
            <div className="mb-6">
              <WeatherPanel forecast={forecast as any} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cats.map(cat => (
              <div key={cat} className="border rounded-lg p-4">
                <div className="font-medium mb-1 capitalize">{cat}</div>
                <div className="text-xs text-gray-500 mb-2">Top 5 drivers (model‑weighted, normalized)</div>
                {contribByCat[cat]?.length ? (
                  <div className="space-y-2">
                    {contribByCat[cat].map(row => (
                      <div key={row.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{row.name}</span>
                        <div className="flex items-center space-x-2 w-1/2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{width: `${Math.min(100, Math.abs(row.contribution)*100)}%`}}></div>
                          </div>
                          <span className="text-xs text-gray-600 w-14 text-right">{(row.contribution*100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No contribution data yet.</div>
                )}
                <div className="mt-4">
                  <Suspense fallback={<div className="text-xs text-gray-400">Loading chart…</div>}>
                    <ExplorerCharts data={contribByCat[cat] || []} />
                  </Suspense>
                </div>
                <div className="text-xs text-gray-600 mt-3">
                  Plain English: Top factors currently shifting <span className="font-medium">{cat}</span> performance, normalized by magnitude. Sign indicates direction.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExplorerView
