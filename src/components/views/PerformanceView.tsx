import React, { useMemo } from 'react'
import CalibrationChart from '../charts/CalibrationChart'
import HoldoutChart from '../charts/HoldoutChart'
import WeatherPanel from '../WeatherPanel'

type Props = {
  actions30d: number
  roasLiftPct: number
  accuracyPct: number
  onBack: () => void
  forecast?: Array<any>
}

const PerformanceView: React.FC<Props> = ({ actions30d, roasLiftPct, accuracyPct, onBack, forecast }) => {
  const calib = useMemo(()=>{
    // synthetic reliability bins
    return [
      { bin:'0–20', predicted:0.2, observed:0.18 },
      { bin:'20–40', predicted:0.4, observed:0.38 },
      { bin:'40–60', predicted:0.6, observed:0.58 },
      { bin:'60–80', predicted:0.8, observed:0.77 },
      { bin:'80–100', predicted:0.95, observed:0.9 },
    ]
  },[])
  const holdout = useMemo(()=>{
    const arr:any[] = []
    for (let i=0;i<14;i++){
      arr.push({ day:`D${i+1}`, control: 12000 + i*200 + Math.round(Math.random()*400), treated: 12500 + i*260 + Math.round(Math.random()*450) })
    }
    return arr
  },[])
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="px-3 py-1 rounded-full bg-white border text-gray-700 hover:bg-gray-50">← Back</button>
            <h2 className="text-xl font-semibold">Performance (Last 30 Days — Demo)</h2>
            <div/>
          </div>

          {forecast && (
            <div className="mb-6">
              <WeatherPanel forecast={forecast as any} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <div className="text-xs text-gray-500">Automation Actions</div>
              <div className="text-2xl font-bold">{actions30d}</div>
              <div className="text-xs text-gray-600">Budget changes auto-applied</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-xs text-gray-500">Avg ROAS Lift</div>
              <div className="text-2xl font-bold">{roasLiftPct}%</div>
              <div className="text-xs text-gray-600">Promotion-aware estimates</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-xs text-gray-500">Decision Accuracy</div>
              <div className="text-2xl font-bold">{accuracyPct}%</div>
              <div className="text-xs text-gray-600">Out-of-window validation</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium mb-2">Calibration (Reliability)</div>
              <CalibrationChart data={calib} />
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium mb-2">Holdout — Predicted vs Observed</div>
              <HoldoutChart data={holdout} />
            </div>
          </div>

          <div className="text-sm text-gray-700">
            This demo illustrates the volume and quality of automated decisions when promotions, campaigns, weather, and ad spend are integrated.  
            In production, these KPIs are computed from Shopify/Meta/Google/Klaviyo logs and validated against holdouts.
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceView
