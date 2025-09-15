import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Zap, AlertTriangle, ArrowRight,
  Sun, Cloud, CloudRain, ThermometerSun, Wind, Eye,
  BarChart3, LineChart, Target, Clock, MapPin, Play,
  CheckCircle2, Settings, Users, Globe, Layers
} from 'lucide-react';
import { featureNames } from '../lib/predict';
import { 
  ResponsiveContainer, LineChart as RechartsLineChart, Line, 
  XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';

interface Props {
  brand: any;
  weather: any;
  predictions: any[];
  automationEnabled: boolean;
  onTakeTour?: () => void;
  onNavigate?: (view: string) => void;
  geoLabel?: string;
}

const ExecutiveDashboardClean: React.FC<Props> = ({ 
  brand, weather, predictions, automationEnabled, onTakeTour, onNavigate, geoLabel 
}) => {
  const [activeInsight, setActiveInsight] = useState<number | null>(null);

  // Calculate executive-focused metrics
  const executiveMetrics = useMemo(() => {
    if (!weather || !predictions.length) return null;

    const temp = weather.current.temperature;
    const season = temp < 50 ? 'winter' : temp > 75 ? 'summer' : 'moderate';
    const topPrediction = predictions[0];
    
    // Revenue calculations
    const monthlyRevenue = Math.max(1, brand.monthlyRevenue);
    const dailyRevenue = monthlyRevenue / 30;
    const coverageHint = (geoLabel || '').toLowerCase();
    const coverage = coverageHint.includes(' · ') && coverageHint.match(/c\d/i) ? 0.03
      : coverageHint.includes(' · ') ? 0.08
      : 0.12;
    const categoryShare = 0.2;
    const liftPct = (()=> {
      if (!topPrediction?.expectedLift) return 0.0;
      const m = String(topPrediction.expectedLift).match(/([\d\.]+)/);
      const v = m ? parseFloat(m[1]) : 0;
      return Math.max(0, Math.min(0.6, v/100));
    })();
    const revenueOpportunity = Math.round(monthlyRevenue * liftPct * categoryShare * coverage);
    const currentROAS = 3.4 + (Math.random() * 0.4);
    const projectedROAS = currentROAS * (1 + liftPct * 0.25);
    
    // Competitive metrics
    const marketAdvantage = Math.round(18 + Math.random() * 12);
    const automationSavings = automationEnabled ? monthlyRevenue * 0.22 : 0;
    
    // Confidence and urgency
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const urgency = temp < 40 || temp > 85 ? 'high' : temp < 50 || temp > 75 ? 'medium' : 'low';
    
    return {
      season,
      revenueOpportunity,
      dailyRevenue,
      currentROAS,
      projectedROAS,
      marketAdvantage,
      automationSavings,
      avgConfidence,
      urgency,
      temperature: temp,
      weatherScore: Math.round(weather.scientific.weatherScore),
      comfortIndex: Math.round(weather.scientific.comfortIndex),
      topCategory: topPrediction?.category,
      topMultiplier: topPrediction?.budgetMultiplier,
      liftPct
    };
  }, [brand, weather, predictions, automationEnabled, geoLabel]);

  // Generate trend data for charts
  const trendData = useMemo(() => {
    const daily = Math.max(1, brand.monthlyRevenue / 30);
    const coverageHint = (geoLabel || '').toLowerCase();
    const coverage = coverageHint.includes(' · ') && coverageHint.match(/c\d/i) ? 0.03
      : coverageHint.includes(' · ') ? 0.08
      : 0.12;
    const categoryShare = 0.2;
    const liftPct = (()=> {
      if (!(predictions && predictions.length)) return 0.0;
      const m = String(predictions[0].expectedLift || '').match(/([\d\.]+)/);
      const v = m ? parseFloat(m[1]) : 0;
      return Math.max(0, Math.min(0.6, v/100));
    })();
    const incremental = liftPct * categoryShare * coverage;
    return Array.from({ length: 14 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (13 - i));
      const dayName = day.toLocaleDateString(undefined, { weekday: 'short' });
      const seasonal = 0.95 + Math.sin((day.getMonth() + 1) * Math.PI / 6) * 0.08;
      const noise = 0.95 + Math.random() * 0.1;
      const base = daily * seasonal * noise;
      return {
        date: dayName,
        baseline: Math.round(base),
        withWeatherAI: Math.round(base * (1 + incremental)),
        conversion: 2.1 + Math.random() * 0.4,
        weatherScore: Math.max(0, Math.min(100, (weather?.scientific?.weatherScore ?? 70)))
      };
    });
  }, [brand, weather, predictions, geoLabel]);

  if (!executiveMetrics) {
    return (
      <div className="flex items-center justify-center h-96 glass rounded-3xl border">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Sun className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Weather Intelligence</h3>
          <p className="text-gray-600">Processing real-time data and generating insights...</p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (temp: number) => {
    if (temp < 40) return <ThermometerSun className="w-6 h-6 text-blue-500" />;
    if (temp > 85) return <Sun className="w-6 h-6 text-orange-500" />;
    return <Cloud className="w-6 h-6 text-gray-500" />;
  };

  const getWeatherGlassClass = (temp: number) => {
    if (temp < 50) return 'glass-winter';
    if (temp > 75) return 'glass-summer';
    return 'glass-rain';
  };

  const keyInsights = [
    {
      icon: DollarSign,
      title: 'Revenue Impact',
      value: `$${executiveMetrics.revenueOpportunity.toLocaleString()}`,
      subtitle: 'Monthly opportunity',
      trend: '',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      title: 'ROAS Boost',
      value: `${((executiveMetrics.projectedROAS / executiveMetrics.currentROAS - 1) * 100).toFixed(1)}%`,
      subtitle: `${executiveMetrics.currentROAS.toFixed(1)}x → ${executiveMetrics.projectedROAS.toFixed(1)}x`,
      trend: 'improvement',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Market Edge',
      value: `${Math.max(5, Math.min(30, Math.round(executiveMetrics.liftPct * 100 * 0.5)))}%`,
      subtitle: 'vs competitors',
      trend: 'advantage',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Automation ROI',
      value: automationEnabled ? '$' + Math.round((monthlyToK(executiveMetrics.revenueOpportunity)) ) + 'K' : 'Available',
      subtitle: automationEnabled ? 'Potential monthly savings' : 'Enable automation',
      trend: automationEnabled ? 'active' : 'inactive',
      color: automationEnabled ? 'from-cyan-500 to-blue-600' : 'from-gray-400 to-gray-600'
    }
  ];

  function monthlyToK(v:number){ return Math.max(0, Math.round(v / 1000)); }

  return (
    <div className="space-y-8">
      {/* Hero Section with Natural Glass Context */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative overflow-hidden glass-strong ${getWeatherGlassClass(executiveMetrics.temperature)}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-5xl"
              >
                {brand.logo}
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-900"
                >
                  {brand.name}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-700 flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {brand.location.city}
                </motion.p>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-right"
            >
              <div className="flex items-center space-x-3 mb-2">
                {getWeatherIcon(executiveMetrics.temperature)}
                <span className="text-3xl font-bold text-gray-900">{Math.round(executiveMetrics.temperature)}°F</span>
              </div>
              <div className="text-gray-700 text-sm flex items-center justify-end">
                {executiveMetrics.season === 'winter' ? '❄️ Winter conditions' :
                 executiveMetrics.season === 'summer' ? '☀️ Summer heat' : '🌤️ Moderate weather'}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {keyInsights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass glass-hover glass-transition p-5 relative group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${insight.color} shadow-lg`}>
                    <insight.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{insight.title}</span>
                </div>
                <div className="text-2xl font-bold mb-2 text-gray-900">{insight.value}</div>
                <div className="text-xs text-gray-600 leading-relaxed">{insight.subtitle}</div>
                {insight.trend !== 'advantage' && insight.trend !== 'inactive' && insight.trend !== 'active' && (
                  <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {insight.trend}
                  </div>
                )}
                
                {/* Subtle animated background accent */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${insight.color} opacity-5 rounded-tr-xl rounded-bl-full transition-opacity group-hover:opacity-10`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Action Items & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Immediate Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="lg:col-span-2 glass glass-transition p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Immediate Actions</h2>
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4, type: "spring" }}
              className={`px-3 py-1 rounded-full text-xs font-medium glass-subtle ${
                executiveMetrics.urgency === 'high' ? 'text-red-700 bg-red-50' :
                executiveMetrics.urgency === 'medium' ? 'text-amber-700 bg-amber-50' :
                'text-blue-700 bg-blue-50'
              }`}
            >
              {executiveMetrics.urgency.toUpperCase()} IMPACT
            </motion.span>
          </div>

          <div className="space-y-4">
            {predictions.slice(0, 2).map((pred, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + idx * 0.15 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="glass-subtle glass-hover glass-transition p-5 relative group"
              >
                {(() => {
                  const pct = Math.round((pred.budgetMultiplier - 1) * 100)
                  const confPct = Math.round((pred.confidence || 0) * 100)
                  const confLabel = confPct>=85? 'High' : confPct>=70? 'Medium' : 'Low'
                  const confChip = confPct>=85? 'bg-green-50 text-green-800 border-green-200' : confPct>=70? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">{pred.category} — Recommendation</h3>
                        <span className={`px-2 py-1 rounded-full border ${confChip}`}>{confPct}% ({confLabel})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                        <div className="bg-white/60 rounded-lg p-3 border">
                          <div className="text-xs text-gray-500">Recommendation</div>
                          <div className="text-sm font-semibold text-gray-900">Increase budget {pct>=0?'+':''}{pct}% ({pred.budgetMultiplier}×)</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border">
                          <div className="text-xs text-gray-500">Projected outcome</div>
                          <div className="text-sm font-semibold text-gray-900">Lift {pred.expectedLift}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 border">
                          <div className="text-xs text-gray-500">Status</div>
                          <div className="text-sm font-semibold text-gray-900">{automationEnabled ? 'Auto‑applied' : 'Review & Apply'}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">{pred.reasoning}</div>
                    </>
                  )
                })()}

                {/* Quick outcome summary */}
                <div className="mt-2 text-xs text-gray-700 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full border ${pred.confidence>0.85?'bg-green-50 text-green-800 border-green-200':pred.confidence>0.7?'bg-amber-50 text-amber-800 border-amber-200':'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {pred.confidence>0.85?'High':pred.confidence>0.7?'Medium':'Low'} confidence
                  </span>
                  <span>Lift {pred.expectedLift}</span>
                </div>

                {/* Staged plan visualization */}
                {'stagedSteps' in pred && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Staged plan</div>
                    <div className="flex items-end gap-1 h-8">
                      {(pred as any).stagedSteps?.slice(0,3).map((m:number,i:number)=> (
                        <div key={i} className="w-6 bg-blue-500/30 rounded" style={{ height: `${Math.min(100, Math.max(0,(m-0.8)*100))}%` }} title={`${Math.round((m-1)*100)}%`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Details (demo-only helper) */}
                <details className="mt-3">
                  <summary className="text-xs text-gray-600 cursor-pointer">More details</summary>
                  <div className="mt-2 text-xs text-gray-700 space-y-1">
                    <div>Top factors (model‑weighted):</div>
                    <ul className="list-disc ml-5">
                      {(() => {
                        const x = (pred.features || []) as number[]
                        const th = ((pred as any).theta || []).length ? (pred as any).theta as number[] : x.map(()=>0.1)
                        const pairs = x.map((v:number, i:number) => ({ key: i, name: featureNames[i] || `f${i}`, raw: th[i]*v }))
                        const total = pairs.reduce((s,a)=> s + Math.abs(a.raw), 0) || 1
                        const top = pairs
                          .map(p => ({ ...p, pct: (p.raw/total)*100 }))
                          .sort((a,b)=> Math.abs(b.pct) - Math.abs(a.pct))
                          .slice(0,3)
                        const explain: Record<string,string> = {
                          'HDD': 'Colder day increases indoor heating → drier air → demand up',
                          'VPD(kPa)': 'Higher vapor pressure deficit → drier air → demand up',
                          'DrynessTrend': 'Dryness rising over time → emerging need',
                          'VPDxHDD': 'Dryness and cold together amplify effect',
                          'WeekendxPromo': 'Weekend amplified by promotions',
                          'RH%': 'Relative humidity context',
                          'DP_AnomF': 'Dew point anomaly vs normal (dryness)',
                          'TempF': 'Temperature context (comfort/activity)',
                          'PrecipIn': 'Precipitation affecting usage/behavior',
                        }
                        return top.map(t => (
                          <li key={t.name}>
                            {t.name}: {t.pct>=0?'+':''}{t.pct.toFixed(1)}% — {explain[t.name] || 'Contextual influence'}
                          </li>
                        ))
                      })()}
                    </ul>
                    {(() => {
                      const mean = (pred as any).meanScore ?? 0
                      const ucb = (pred as any).ucbScore ?? mean
                      const band = Math.max(2, Math.min(25, Math.abs(ucb - mean)*12))
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div>Expected lift: {pred.expectedLift}</div>
                            <div className="text-gray-500">Confidence band: ±{band.toFixed(1)}%</div>
                            {'priorPool' in pred && (
                              <div className="text-gray-500">Network prior: {(pred as any).priorPool>=5? 'active':'inactive'}</div>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500">Blended priors × online learner; decisions staged with guardrails. High‑confidence items may auto‑apply.</div>
                        </div>
                      )
                    })()}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>

          {onTakeTour && (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-900">New to Weather Intelligence?</h3>
                  <p className="text-amber-700 text-sm">Take a 2-minute tour to see how it works</p>
                </div>
                <button
                  onClick={onTakeTour}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Tour</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Performance Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="glass glass-transition p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h2>
          
          <div className="space-y-6">
            {/* Weather Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Weather Optimization</span>
                <span className="text-sm font-bold text-gray-900">
                  {executiveMetrics.weatherScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${executiveMetrics.weatherScore}%` }}
                ></div>
              </div>
            </div>

            {/* Automation Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">AI Automation</span>
                <span className={`text-sm font-bold ${automationEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {automationEnabled ? 'Active' : 'Manual'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${automationEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-600">
                  {automationEnabled ? '+22% efficiency boost' : 'Enable for auto-optimization'}
                </span>
              </div>
            </div>

            {/* Prediction Confidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Prediction Quality</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(executiveMetrics.avgConfidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${executiveMetrics.avgConfidence * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button 
                onClick={() => onNavigate?.('explorer')}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Explore Insights</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => onNavigate?.('simulator')}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Run Scenarios</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Trend Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.6 }}
        className="glass glass-transition p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Impact Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="baseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="weatherai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, '']} />
            <Area
              type="monotone"
              dataKey="baseline"
              stackId="1"
              stroke="#9CA3AF"
              fill="url(#baseline)"
              name="Baseline Revenue"
            />
            <Area
              type="monotone"
              dataKey="withWeatherAI"
              stackId="2"
              stroke="#3B82F6"
              fill="url(#weatherai)"
              name="With Weather AI"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default ExecutiveDashboardClean;
