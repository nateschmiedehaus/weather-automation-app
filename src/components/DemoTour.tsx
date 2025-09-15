import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Play, CheckCircle2 } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  highlight: string;
  visual?: React.ReactNode;
  duration: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const DemoTour: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: TourStep[] = [
    {
      title: "Welcome to Weather Intelligence",
      description: "Transform your marketing with real-time weather data. See how temperature, precipitation, and seasonal patterns drive your revenue.",
      highlight: "Weather-driven marketing that actually works",
      visual: (
        <div className="flex items-center justify-center h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg text-white">
          <div className="text-center">
            <div className="text-3xl mb-2">🌤️</div>
            <div className="font-semibold">Real-time Weather Intelligence</div>
          </div>
        </div>
      ),
      duration: 3000
    },
    {
      title: "AI-Powered Predictions",
      description: "Our ML models analyze weather patterns, historical performance, and current campaigns to predict optimal budget allocation in real-time.",
      highlight: "95% accuracy in revenue predictions",
      visual: (
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Winter Products</span>
            <span className="bg-white/20 px-2 py-1 rounded text-xs">2.4x multiplier</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full mb-2">
            <div className="h-2 bg-white rounded-full w-3/4"></div>
          </div>
          <div className="text-sm">Cold weather detected → Increase budget 140%</div>
        </div>
      ),
      duration: 4000
    },
    {
      title: "Automated Optimization",
      description: "When enabled, our AI automatically adjusts campaign budgets, creative selection, and targeting based on weather conditions - no manual intervention needed.",
      highlight: "18% efficiency improvement vs manual campaigns",
      visual: (
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Budget increased 40% → Summer products</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Creative switched → "Beat the heat"</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Geo-targeting → Hot regions priority</span>
          </div>
        </div>
      ),
      duration: 4000
    },
    {
      title: "Executive Insights",
      description: "Get clear, actionable insights designed for leadership. Revenue impact, ROI projections, and competitive advantages at a glance.",
      highlight: "Built for CMOs and growth leaders",
      visual: (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">$847K</div>
              <div className="text-xs text-gray-600">Revenue Opportunity</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">+23%</div>
              <div className="text-xs text-gray-600">ROAS Improvement</div>
            </div>
          </div>
        </div>
      ),
      duration: 3500
    },
    {
      title: "Ready to Transform Your Revenue?",
      description: "You'll now see live demos for different brands. Each shows how weather intelligence works for different business models and seasonal patterns.",
      highlight: "Explore live brand scenarios",
      visual: (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-100 p-3 rounded text-center">
            <div className="text-lg">🧣</div>
            <div className="text-xs font-medium">NorSari</div>
            <div className="text-xs text-gray-600">Winter wear</div>
          </div>
          <div className="bg-green-100 p-3 rounded text-center">
            <div className="text-lg">💧</div>
            <div className="text-xs font-medium">Canopy</div>
            <div className="text-xs text-gray-600">Humidifiers</div>
          </div>
          <div className="bg-orange-100 p-3 rounded text-center">
            <div className="text-lg">🔥</div>
            <div className="text-xs font-medium">Kingsford</div>
            <div className="text-xs text-gray-600">Grilling</div>
          </div>
          <div className="bg-cyan-100 p-3 rounded text-center">
            <div className="text-lg">🧗</div>
            <div className="text-xs font-medium">Patagonia</div>
            <div className="text-xs text-gray-600">Outdoor</div>
          </div>
        </div>
      ),
      duration: 4000
    }
  ];

  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsPlaying(false);
        setTimeout(onComplete, 1000);
      }
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, isOpen, steps, onComplete]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌩️</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Demo Tour</h2>
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex space-x-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full ${
                  idx <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-gray-900">
                {steps[currentStep].title}
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="font-medium text-blue-900 text-sm">
                  {steps[currentStep].highlight}
                </div>
              </div>

              {steps[currentStep].visual && (
                <div className="my-4">
                  {steps[currentStep].visual}
                </div>
              )}

              <p className="text-gray-700 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Skip Tour
          </button>

          <div className="flex items-center space-x-3">
            {!isPlaying && currentStep === 0 && (
              <button
                onClick={handlePlay}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Auto Play</span>
              </button>
            )}

            {currentStep > 0 && !isPlaying && (
              <button
                onClick={handlePrev}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {!isPlaying && (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>{currentStep === steps.length - 1 ? 'Start Demo' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Auto-playing demo...</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DemoTour;