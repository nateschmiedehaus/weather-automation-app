import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Zap, AlertTriangle, 
  Sun, Cloud, CloudRain, ThermometerSun, Wind,
  BarChart3, LineChart, Target, Clock, MapPin
} from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Props {
  brand: any;
  weather: any;
  predictions: any[];
  automationEnabled: boolean;
  onTakeTour?: () => void;
}

const ExecutiveDashboardRedesign: React.FC<Props> = ({ 
  brand, weather, predictions, automationEnabled, onTakeTour 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'automation'>('overview');

  const insights = useMemo(() => {
    if (!weather || !predictions.length) return null;

    const temp = weather.current.temperature;
    const season = temp < 50 ? 'winter' : temp > 75 ? 'summer' : 'transition';
    const bestPrediction = predictions[0];
    
    // Calculate key metrics
    const revenueOpportunity = Math.round(bestPrediction?.budgetMultiplier * brand.monthlyRevenue * 0.12);
    const currentROAS = 3.2;
    const projectedROAS = currentROAS * (1 + 0.15);
    const weatherImpact = season === 'winter' ? 'High' : season === 'summer' ? 'Moderate' : 'Low';
    
    return {
      season,
      revenueOpportunity,
      currentROAS,
      projectedROAS,
      weatherImpact,
      temperature: temp,
      conditions: weather.current.conditions,
      topOpportunity: bestPrediction
    };
  }, [brand, weather, predictions]);

  // Sample data for charts
  const revenueData = useMemo(() => {
    const baseRevenue = brand.monthlyRevenue / 30;
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      actual: Math.round(baseRevenue * (0.8 + Math.random() * 0.4)),
      projected: Math.round(baseRevenue * (1.1 + Math.random() * 0.3))
    }));
  }, [brand]);

  const weatherTrends = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      temp: Math.round(weather?.current.temperature + (Math.sin(i / 4) * 8)),
      conversion: 2.1 + Math.sin((i - 14) / 6) * 0.8 + Math.random() * 0.3
    }));
  }, [weather]);

  const opportunityDistribution = useMemo(() => {
    if (!predictions.length) return [];
    return predictions.map(p => ({
      name: p.category,
      value: Math.round(p.budgetMultiplier * 100),
      color: {
        winter: '#3B82F6',
        summer: '#F59E0B', 
        indoor: '#10B981',
        wellness: '#8B5CF6',
        outdoor: '#06B6D4',
        rain: '#64748B'
      }[p.category] || '#64748B'
    }));
  }, [predictions]);

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weather intelligence...</p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (conditions: string) => {
    if (conditions.includes('Rain')) return <CloudRain className="w-5 h-5" />;
    if (conditions.includes('Cloud')) return <Cloud className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Revenue Opportunities', icon: Target },
    { id: 'automation', label: 'AI Automation', icon: Zap }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{brand.logo}</div>
            <div>
              <h1 className="text-3xl font-bold">{brand.name}</h1>
              <p className="text-blue-100 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {brand.location.city}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-3 mb-2">
              {getWeatherIcon(insights.conditions)}
              <span className="text-2xl font-bold">{insights.temperature}°F</span>
            </div>
            <div className="text-blue-100">
              {insights.conditions} • {insights.weatherImpact} Impact
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-300" />
              <span className="text-sm text-blue-100">Revenue Opportunity</span>
            </div>
            <div className="text-2xl font-bold">
              ${insights.revenueOpportunity.toLocaleString()}
            </div>
            <div className="text-xs text-blue-200">This month</div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span className="text-sm text-blue-100">ROAS Improvement</span>
            </div>
            <div className="text-2xl font-bold">
              +{((insights.projectedROAS / insights.currentROAS - 1) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-blue-200">
              {insights.currentROAS.toFixed(1)}x → {insights.projectedROAS.toFixed(1)}x
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <ThermometerSun className="w-5 h-5 text-orange-300" />
              <span className="text-sm text-blue-100">Weather Score</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(weather.scientific.weatherScore)}
            </div>
            <div className="text-xs text-blue-200">
              Optimal for {insights.topOpportunity?.category}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm text-blue-100">Automation</span>
            </div>
            <div className="text-2xl font-bold">
              {automationEnabled ? 'Active' : 'Manual'}
            </div>
            <div className="text-xs text-blue-200">
              {automationEnabled ? '+18% efficiency' : 'Enable for boost'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {activeTab === 'overview' && (
            <>
              {/* Revenue Trends */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  7-Day Revenue Trend
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={revenueData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, '']} />
                    <Line type="monotone" dataKey="actual" stroke="#6B7280" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="projected" stroke="#3B82F6" strokeWidth={3} name="With Weather AI" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              {/* Weather Impact */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  24hr Weather-Conversion Correlation
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={weatherTrends}>
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="temp" orientation="left" />
                    <YAxis yAxisId="conv" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={2} name="Temperature" />
                    <Line yAxisId="conv" type="monotone" dataKey="conversion" stroke="#10B981" strokeWidth={2} name="Conversion %" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'opportunities' && (
            <>
              {/* Opportunity Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Category Optimization Potential
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={opportunityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {opportunityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Opportunities */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Immediate Actions
                </h3>
                <div className="space-y-4">
                  {predictions.slice(0, 3).map((pred, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">{pred.category}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {Math.round(pred.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{pred.reasoning}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-700">
                          {pred.expectedLift} revenue lift
                        </span>
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'automation' && (
            <>
              {/* Automation Status */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Automation Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-900">Weather Intelligence</div>
                      <div className="text-sm text-green-700">Real-time optimization active</div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-900">Campaign Optimization</div>
                      <div className="text-sm text-blue-700">Budget adjustments automated</div>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium text-purple-900">Predictive Analytics</div>
                      <div className="text-sm text-purple-700">ML models learning continuously</div>
                    </div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Automation Performance
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">4.2min</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">94.7%</div>
                    <div className="text-sm text-gray-600">Prediction Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">$2.4M</div>
                    <div className="text-sm text-gray-600">Revenue Protected</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">18%</div>
                    <div className="text-sm text-gray-600">Efficiency Gain</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Demo Tour CTA */}
      {onTakeTour && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">New to Weather Intelligence?</h3>
              <p className="text-amber-100">Take a quick tour to see how it can transform your revenue</p>
            </div>
            <button
              onClick={onTakeTour}
              className="px-6 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50"
            >
              Start Tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboardRedesign;