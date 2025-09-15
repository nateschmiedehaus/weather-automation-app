import React from 'react'
import WeatherPanel from '../WeatherPanel'

type Props = {
  scenario: any
  setScenario: React.Dispatch<React.SetStateAction<any>>
  runDemoPipeline: () => void
  onBack: () => void
  forecast?: Array<any>
}

const SimulatorView: React.FC<Props> = ({ scenario, setScenario, runDemoPipeline, onBack, forecast }) => {
  const Row = ({label, children}:{label:string; children:any}) => (
    <div className="flex items-center justify-between py-3 border-b">
      <div className="text-sm text-gray-700">{label}</div>
      <div className="w-2/3">{children}</div>
    </div>
  );
  const simClass = (()=>{
    if (scenario.precipAdj>0.6) return 'weather-thunder'
    if (scenario.tempAdj<=-0.5 && scenario.precipAdj>0.2) return 'weather-blizzard'
    if (scenario.tempAdj>=0.5) return 'weather-sunshine'
    if (scenario.precipAdj>0.2) return 'weather-rain'
    return ''
  })()
  return (
    <div className={`min-h-screen bg-gray-50 ${simClass}`}>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="px-3 py-1 rounded-full bg-white border text-gray-700 hover:bg-gray-50">← Back</button>
            <h2 className="text-xl font-semibold">Scenario Simulator</h2>
            <div/>
          </div>

          {forecast && (
            <div className="mb-6">
              <WeatherPanel forecast={forecast as any} />
            </div>
          )}

          {/* State badges */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <span className={`px-2 py-1 rounded-full ${scenario.tempAdj<=-0.4?'bg-blue-50 text-blue-800 border border-blue-200':scenario.tempAdj>=0.4?'bg-orange-50 text-orange-800 border border-orange-200':'bg-gray-50 text-gray-700 border'}`}>
              {scenario.tempAdj<=-0.4?'Cold':scenario.tempAdj>=0.4?'Warm':'Neutral temp'}
            </span>
            <span className={`px-2 py-1 rounded-full ${scenario.precipAdj>=0.6?'bg-indigo-50 text-indigo-800 border border-indigo-200':scenario.precipAdj===0?'bg-emerald-50 text-emerald-800 border border-emerald-200':'bg-gray-50 text-gray-700 border'}`}>
              {scenario.precipAdj>=0.6?'Stormy':scenario.precipAdj===0?'Dry':'Typical precip'}
            </span>
            <span className={`px-2 py-1 rounded-full ${scenario.promoAdj>0?'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200':'bg-gray-50 text-gray-700 border'}`}>
              {scenario.promoAdj>0?'Promo boost':'Promo baseline'}
            </span>
            <span className={`px-2 py-1 rounded-full ${scenario.campaignAdj>0?'bg-amber-50 text-amber-800 border border-amber-200':'bg-gray-50 text-gray-700 border'}`}>
              {scenario.campaignAdj>0?'Campaign push':'Campaign baseline'}
            </span>
          </div>

          <div className="mb-4">
            <div className="mb-3">
              {/* Visual scenario illustration */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
                  <div className="text-3xl mb-2">❄️</div>
                  <div className="text-xs text-gray-700">Cold snap</div>
                </div>
                <div className="p-4 rounded-xl border bg-gradient-to-br from-indigo-50 to-cyan-50 text-center">
                  <div className="text-3xl mb-2">⛈️</div>
                  <div className="text-xs text-gray-700">Stormy</div>
                </div>
                <div className="p-4 rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-xs text-gray-700">BBQ weekend</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-2">Presets</div>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs" onClick={()=> setScenario({ ...scenario, tempAdj:-1, precipAdj:0, promoAdj:0, campaignAdj:0 })}>Cold snap</button>
              <button className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs" onClick={()=> setScenario({ ...scenario, tempAdj:0, precipAdj:0.8, promoAdj:0.1, campaignAdj:0 })}>Stormy</button>
              <button className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs" onClick={()=> setScenario({ ...scenario, tempAdj:0.6, precipAdj:0, promoAdj:0.1, campaignAdj:0.2 })}>BBQ weekend</button>
              <button className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs" onClick={()=> setScenario({ ...scenario, tempAdj:0, precipAdj:-1, promoAdj:0, campaignAdj:0 })}>Baseline</button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">Test "what-if" conditions. Changes affect the demo date snapshot.</p>

          <Row label="Temperature adjustment">
            <input type="range" min={-1} max={1} step={0.1} className="w-full"
              value={scenario.tempAdj}
              onChange={(e)=> setScenario((s:any)=>({...s, tempAdj: parseFloat(e.target.value)}))}
            />
          </Row>
          <Row label="Precipitation override (0 = dry, 1 = heavy)">
            <input type="range" min={-1} max={1} step={0.05} className="w-full"
              value={scenario.precipAdj}
              onChange={(e)=> setScenario((s:any)=>({...s, precipAdj: parseFloat(e.target.value)}))}
            />
          </Row>
          <Row label="Promo intensity (+)">
            <input type="range" min={0} max={1} step={0.05} className="w-full"
              value={scenario.promoAdj}
              onChange={(e)=> setScenario((s:any)=>({...s, promoAdj: parseFloat(e.target.value)}))}
            />
          </Row>
          <Row label="Campaign push (+)">
            <input type="range" min={0} max={1} step={0.05} className="w-full"
              value={scenario.campaignAdj}
              onChange={(e)=> setScenario((s:any)=>({...s, campaignAdj: parseFloat(e.target.value)}))}
            />
          </Row>
          <Row label="Ad spend support (− to +)">
            <input type="range" min={-1} max={1} step={0.1} className="w-full"
              value={scenario.adSpendAdj}
              onChange={(e)=> setScenario((s:any)=>({...s, adSpendAdj: parseFloat(e.target.value)}))}
            />
          </Row>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Interpretation</div>
              <ul className="list-disc ml-5">
                <li>{scenario.tempAdj>0 ? 'Warmer than usual' : scenario.tempAdj<0 ? 'Colder than usual' : 'Normal temps'} (tempAdj {scenario.tempAdj.toFixed(1)}).</li>
                <li>{scenario.precipAdj<0 ? 'Typical precipitation' : (scenario.precipAdj===0 ? 'Dry' : scenario.precipAdj>0.6 ? 'Stormy' : 'Light rain')} (precipAdj {scenario.precipAdj.toFixed(2)}).</li>
                <li>{scenario.promoAdj>0 ? 'Stronger promotions than baseline' : 'No extra promo boost'} (promoAdj {scenario.promoAdj.toFixed(2)}).</li>
                <li>{scenario.campaignAdj>0 ? 'Pushing paid channels' : 'Baseline campaign pressure'} (campaignAdj {scenario.campaignAdj.toFixed(2)}).</li>
                <li>{scenario.adSpendAdj>0 ? 'Extra ad spend support' : scenario.adSpendAdj<0 ? 'Reduced spend support' : 'Baseline spend'} (adSpendAdj {scenario.adSpendAdj.toFixed(1)}).</li>
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { runDemoPipeline(); onBack(); }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Apply & Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulatorView
