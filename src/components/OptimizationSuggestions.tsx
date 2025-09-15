import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Play, CheckCircle2, Clock, TrendingUp, Zap } from 'lucide-react';

interface OptimizationSuggestionsProps {
  brand: any;
  weather: any;
  predictions: any[];
  onApplyOptimization: (optimization: any) => void;
}

const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({ 
  brand, weather, predictions, onApplyOptimization 
}) => {
  const [appliedOptimizations, setAppliedOptimizations] = useState<Set<string>>(new Set());

  const optimizations = useMemo(() => {
    if (!weather || !predictions.length) return [];

    const temp = weather.current.temperature;
    const precip = weather.current.precipitation;
    const comfort = weather.scientific.comfortIndex;
    
    const optimizations = [];

    // Budget Reallocation Suggestions
    predictions.forEach((pred, idx) => {
      if (pred.budgetMultiplier > 1.3) {
        optimizations.push({
          id: `budget-increase-${pred.category}`,
          type: 'budget',
          priority: 'high',
          category: pred.category,
          action: 'Increase Budget',
          description: `Increase ${pred.category} ad spend by ${Math.round((pred.budgetMultiplier - 1) * 100)}%`,
          reasoning: pred.reasoning,
          expectedLift: pred.expectedLift,
          confidence: pred.confidence,
          timeToImplement: '< 5 minutes',
          potentialRevenue: brand.monthlyRevenue * 0.1 * (pred.budgetMultiplier - 1),
          icon: ArrowUp,
          iconColor: 'text-green-600'
        });
      }

      if (pred.budgetMultiplier < 0.7) {
        optimizations.push({
          id: `budget-decrease-${pred.category}`,
          type: 'budget',
          priority: 'medium',
          category: pred.category,
          action: 'Reduce Budget',
          description: `Reduce ${pred.category} ad spend by ${Math.round((1 - pred.budgetMultiplier) * 100)}%`,
          reasoning: `Weather conditions unfavorable for ${pred.category}`,
          expectedLift: 'Cost savings',
          confidence: pred.confidence,
          timeToImplement: '< 5 minutes',
          potentialRevenue: -brand.monthlyRevenue * 0.05 * (1 - pred.budgetMultiplier),
          icon: ArrowDown,
          iconColor: 'text-red-600'
        });
      }
    });

    // Creative Optimizations
    if (brand.name === 'Canopy' && temp < 45) {
      optimizations.push({
        id: 'creative-winter-humidity',
        type: 'creative',
        priority: 'high',
        action: 'Update Ad Creative',
        description: 'Switch to "Combat Dry Winter Air" creative variant',
        reasoning: 'Cold weather messaging resonates 40% better in winter conditions',
        expectedLift: '+25% CTR',
        confidence: 0.88,
        timeToImplement: '< 2 minutes',
        potentialRevenue: brand.monthlyRevenue * 0.08,
        icon: Zap,
        iconColor: 'text-blue-600'
      });
    }

    // Timing Optimizations
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour <= 8) {
      optimizations.push({
        id: 'timing-evening-boost',
        type: 'timing',
        priority: 'medium',
        action: 'Evening Ad Boost',
        description: 'Increase evening ad frequency by 30%',
        reasoning: 'Indoor activity peaks in evening hours, especially during weather changes',
        expectedLift: '+15% conversions',
        confidence: 0.82,
        timeToImplement: '< 3 minutes',
        potentialRevenue: brand.monthlyRevenue * 0.05,
        icon: Clock,
        iconColor: 'text-purple-600'
      });
    }

    // Geo-targeting optimizations
    if (precip > 0.3) {
      optimizations.push({
        id: 'geo-rain-expansion',
        type: 'geo',
        priority: 'high',
        action: 'Expand Rainy Markets',
        description: 'Increase bid multiplier by 50% in areas with active precipitation',
        reasoning: 'Rain drives indoor product demand across categories',
        expectedLift: '+20% revenue',
        confidence: 0.91,
        timeToImplement: '< 10 minutes',
        potentialRevenue: brand.monthlyRevenue * 0.12,
        icon: TrendingUp,
        iconColor: 'text-cyan-600'
      });
    }

    return optimizations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [brand, weather, predictions]);

  const handleApplyOptimization = (optimization: any) => {
    setAppliedOptimizations(prev => new Set(prev).add(optimization.id));
    onApplyOptimization(optimization);
    
    // Simulate automatic revert after demo
    setTimeout(() => {
      setAppliedOptimizations(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimization.id);
        return newSet;
      });
    }, 8000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h3>
        <div className="text-sm text-gray-600">
          {optimizations.length} opportunities identified
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {optimizations.map((opt, idx) => {
            const isApplied = appliedOptimizations.has(opt.id);
            
            return (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(opt.priority)} ${isApplied ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-1.5 rounded ${opt.iconColor} bg-white`}>
                      <opt.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{opt.action}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${{
                          high: 'bg-red-100 text-red-800',
                          medium: 'bg-yellow-100 text-yellow-800',
                          low: 'bg-blue-100 text-blue-800'
                        }[opt.priority]}`}>
                          {opt.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{opt.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>⏱ {opt.timeToImplement}</span>
                        <span>📈 {opt.expectedLift}</span>
                        <span>🎯 {Math.round(opt.confidence * 100)}% confidence</span>
                        {opt.potentialRevenue > 0 && (
                          <span className="text-green-600 font-medium">
                            +${opt.potentialRevenue.toLocaleString()} potential
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-3">
                    {isApplied ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle2 size={16} />
                        <span className="text-xs">Applied</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyOptimization(opt)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Play size={12} />
                        <span>Apply Now</span>
                      </button>
                    )}
                  </div>
                </div>
                {opt.reasoning && (
                  <div className="mt-3 p-2 bg-white/50 rounded text-xs text-gray-600 border-l-2 border-gray-200">
                    <strong>Why:</strong> {opt.reasoning}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OptimizationSuggestions;