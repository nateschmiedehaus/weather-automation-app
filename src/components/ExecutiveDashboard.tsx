import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Zap, Clock, Target, BarChart3 } from 'lucide-react';

interface ExecutiveDashboardProps {
  brand: any;
  predictions: any[];
  automationEnabled: boolean;
  weather: any;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ 
  brand, predictions, automationEnabled, weather 
}) => {
  const metrics = useMemo(() => {
    if (!predictions.length) return null;

    const totalPotentialLift = predictions.reduce((sum, pred) => {
      const multiplier = Math.max(0, pred.budgetMultiplier - 1);
      return sum + (brand.monthlyRevenue * 0.15 * multiplier);
    }, 0);

    const automationSavings = automationEnabled ? brand.monthlyRevenue * 0.18 : 0;
    const timeToValue = automationEnabled ? '< 5 minutes' : '2-3 hours';
    
    const currentROAS = 3.2 + (Math.random() * 0.8);
    const projectedROAS = currentROAS * (1 + (totalPotentialLift / brand.monthlyRevenue));
    
    return {
      totalPotentialLift,
      automationSavings,
      timeToValue,
      currentROAS,
      projectedROAS,
      competitiveAdvantage: 15 + Math.floor(Math.random() * 12),
      implementationEffort: automationEnabled ? 'Zero-touch' : 'Manual required'
    };
  }, [brand, predictions, automationEnabled]);

  if (!metrics) return null;

  const cards = [
    {
      title: 'Revenue Opportunity',
      value: `$${metrics.totalPotentialLift.toLocaleString()}`,
      subtitle: 'This month',
      change: '+23.4%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'ROAS Improvement',
      value: `${metrics.projectedROAS.toFixed(1)}x`,
      subtitle: `vs ${metrics.currentROAS.toFixed(1)}x current`,
      change: `+${((metrics.projectedROAS / metrics.currentROAS - 1) * 100).toFixed(1)}%`,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Automation Savings',
      value: `$${metrics.automationSavings.toLocaleString()}`,
      subtitle: 'Efficiency gains',
      change: automationEnabled ? 'Active' : 'Available',
      changeType: automationEnabled ? 'positive' : 'neutral',
      icon: Zap,
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Time to Value',
      value: metrics.timeToValue,
      subtitle: 'Implementation',
      change: metrics.implementationEffort,
      changeType: 'neutral',
      icon: Clock,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time Intelligence</span>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            CMO Dashboard
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color} text-white shadow-lg`}>
                  <card.icon size={24} />
                </div>
                <div className={`text-sm font-medium ${getChangeColor(card.changeType)}`}>
                  {card.change}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weather Impact Summary */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weather Impact Analysis</h3>
            <div className="flex items-center space-x-2 text-blue-600">
              <BarChart3 size={20} />
              <span className="text-sm font-medium">Live Analysis</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-900">
                {weather.current.temperature}°F
              </div>
              <div className="text-sm text-blue-700">
                {weather.current.temperature < 45 ? 'High Impact' : 
                 weather.current.temperature > 75 ? 'Moderate Impact' : 'Standard Impact'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-900">
                {metrics.competitiveAdvantage}%
              </div>
              <div className="text-sm text-blue-700">Competitive Edge</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-900">
                {Math.round(weather.scientific.comfortIndex)}
              </div>
              <div className="text-sm text-blue-700">Comfort Score</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Recommendations</h3>
        <div className="space-y-3">
          {predictions.slice(0, 3).map((pred, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="text-blue-600" size={20} />
                <div>
                  <div className="font-medium text-gray-900 capitalize">{pred.category}</div>
                  <div className="text-sm text-gray-600">{pred.action}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">{pred.expectedLift}</div>
                <div className="text-sm text-gray-500">{Math.round(pred.confidence * 100)}% confidence</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ExecutiveDashboard;