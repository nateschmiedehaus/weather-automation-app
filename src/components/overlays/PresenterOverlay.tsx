import React from 'react'

const PresenterOverlay: React.FC<{ open: boolean; onClose: () => void }>=({ open, onClose })=>{
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-10 right-10 w-[380px] glass-strong p-5 text-sm text-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-gray-900">Presenter Notes</div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Flow</div>
            <ul className="list-disc ml-5 space-y-1">
              <li>Pick brand → Dashboard</li>
              <li>Run pipeline → staged changes appear</li>
              <li>Open Simulator → adjust dryness/promo → recompute</li>
              <li>Explorer → show top factors</li>
              <li>Performance → show KPIs</li>
            </ul>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Hotkeys</div>
            <ul className="list-disc ml-5 space-y-1">
              <li>Cmd/Ctrl+K: Command Palette</li>
              <li>?: Toggle Presenter Notes</li>
            </ul>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Talking points</div>
            <ul className="list-disc ml-5 space-y-1">
              <li>Probabilistic/priors + online learning → safe, staged decisions</li>
              <li>Humidity features: dew point/VPD/HDD → dryer air → demand</li>
              <li>Guardrails: daily caps, learning‑phase avoidance</li>
              <li>Network effects (k‑anonymity) enhance priors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PresenterOverlay

