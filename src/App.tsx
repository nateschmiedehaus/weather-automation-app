import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import WeatherIntelligencePlatformClean from './components/WeatherIntelligencePlatformClean'

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          <Route path="/*" element={<WeatherIntelligencePlatformClean />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App
