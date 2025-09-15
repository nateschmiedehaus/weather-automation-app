import React from 'react'

const PlaybooksView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const playbooks = [
    { id:'pb-rain', name:'Rain Surge', desc:'Increase rain gear when precipitation is high & comfort is decent.', on: true },
    { id:'pb-cold', name:'Cold Snap Conversion', desc:'Boost winter wraps below 45°F when conversion baseline >2%.', on: true },
    { id:'pb-bbq',  name:'BBQ Weekend Lift', desc:'Push charcoal Fri–Sun when 65–90°F and dry.', on: true },
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="px-3 py-1 rounded-full bg-white border text-gray-700 hover:bg-gray-50">← Back</button>
            <h2 className="text-xl font-semibold">Automation Playbooks</h2>
            <div/>
          </div>
          <div className="space-y-4">
            {playbooks.map(pb => (
              <div key={pb.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{pb.name}</div>
                  <div className="text-sm text-gray-600">{pb.desc}</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={pb.on} className="sr-only peer"/>
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-emerald-500 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-5 transition"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-4">Playbooks are friendly presets on top of the bandit — you can keep them on while the model still learns.</div>
        </div>
      </div>
    </div>
  )
}

export default PlaybooksView

