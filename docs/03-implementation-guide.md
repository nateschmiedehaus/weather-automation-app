# Full-Stack Implementation Guide

## Development Setup

### Prerequisites
```bash
# Node.js 18+ required
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher

# Git for version control
git --version
```

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd weather-intel-demo

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Scripts
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "dev:sidecar": "concurrently -k \"npm:dev\" \"npm:open:sidecar\""
}
```

## Project Structure Deep Dive

```
weather-intel-demo/
├── src/
│   ├── components/                 # React components
│   │   ├── WeatherIntelligencePlatformClean.tsx  # Main platform
│   │   ├── ExecutiveDashboardClean.tsx           # Executive interface
│   │   ├── DemoTour.tsx                         # Onboarding experience
│   │   ├── ExecutiveInsights.tsx               # AI insights
│   │   └── OptimizationSuggestions.tsx         # One-click actions
│   ├── theme/
│   │   └── tokens.ts              # Brand tokens and types
│   ├── App.tsx                    # Root application
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── docs/                          # Documentation
├── public/                        # Static assets
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Build configuration
├── tailwind.config.ts             # Styling configuration
└── tsconfig.json                  # TypeScript configuration
```

## Component Implementation Patterns

### 1. Executive Dashboard Pattern

#### Structure
```typescript
// Executive-focused metric calculation
const executiveMetrics = useMemo(() => {
  if (!weather || !predictions.length) return null;
  
  // Business-focused calculations
  const revenueOpportunity = calculateRevenueImpact(predictions, brand);
  const roasImprovement = calculateROASLift(predictions, weather);
  const competitiveAdvantage = calculateMarketEdge(automationEnabled);
  
  return { revenueOpportunity, roasImprovement, competitiveAdvantage };
}, [weather, predictions, brand, automationEnabled]);
```

#### Visual Hierarchy
```jsx
// Top-level: Business impact
<div className="hero-metrics">
  <MetricCard title="Revenue Opportunity" value={`$${metrics.revenue.toLocaleString()}`} />
  <MetricCard title="ROAS Boost" value={`${metrics.roasLift}%`} />
</div>

// Second-level: Operational status
<div className="operational-metrics">
  <StatusIndicator automation={automationEnabled} />
  <PerformanceGauge score={weatherScore} />
</div>

// Third-level: Detailed insights (expandable)
<div className="detailed-insights">
  <CollapsibleSection title="Technical Details" />
</div>
```

### 2. Weather Intelligence Pattern

#### Multi-Source Data Integration
```typescript
interface WeatherDataSource {
  primary: OpenWeatherAPI;
  backup: NOAAWeatherAPI;
  hyperlocal: WeatherUndergroundAPI;
}

const fetchWeatherIntelligence = async (brand: Brand): Promise<Weather> => {
  try {
    // Primary source with fallback
    const weather = await weatherSources.primary.getCurrent(brand.location);
    return enhanceWithBusinessIntelligence(weather, brand);
  } catch (error) {
    // Fallback to backup source
    return await weatherSources.backup.getCurrent(brand.location);
  }
};
```

#### Business Context Enhancement
```typescript
const enhanceWithBusinessIntelligence = (
  weather: RawWeather, 
  brand: Brand
): Weather => {
  return {
    ...weather,
    businessContext: {
      demandMultiplier: calculateDemandImpact(weather, brand),
      seasonalAdjustment: getSeasonalFactor(weather, brand),
      competitiveWindow: assessCompetitiveOpportunity(weather),
      urgencyLevel: determineActionUrgency(weather, brand)
    }
  };
};
```

### 3. AI Prediction Engine Pattern

#### UCB (Upper Confidence Bound) Implementation
```typescript
interface BanditState {
  A: number[][];  // Feature covariance matrix
  b: number[];    // Reward vector
  rewards: number[]; // Historical rewards
}

const computeUCB = (
  banditKey: string, 
  features: number[]
): { expectedReward: number; uncertainty: number; ucb: number; confidence: number } => {
  const state = banditState[banditKey];
  if (!state) {
    initBandit(banditKey, features.length);
    return { expectedReward: 0, uncertainty: 1, ucb: 1, confidence: 0.5 };
  }
  
  // Linear UCB calculation
  const theta = solveLinearSystem(state.A, state.b);
  const expectedReward = dotProduct(theta, features);
  const uncertainty = Math.sqrt(quadraticForm(features, invertMatrix(state.A)));
  const ucb = expectedReward + uncertainty;
  const confidence = Math.max(0, Math.min(1, 1 - uncertainty));
  
  return { expectedReward, uncertainty, ucb, confidence };
};
```

#### Feature Engineering
```typescript
const extractWeatherFeatures = (
  weather: Weather,
  brand: Brand,
  timeContext: TimeContext
): number[] => {
  return [
    // Weather features (normalized)
    normalizeTemperature(weather.current.temperature),
    normalizePrecipitation(weather.current.precipitation),
    normalizeWindSpeed(weather.current.windSpeed),
    normalizeHumidity(weather.current.humidity),
    normalizeUVIndex(weather.current.uvIndex),
    
    // Derived features
    weather.scientific.comfortIndex / 100,
    weather.scientific.weatherScore / 100,
    
    // Temporal features
    timeContext.isWeekend ? 1 : 0,
    timeContext.hourOfDay / 24,
    timeContext.dayOfYear / 365,
    
    // Brand-specific features
    calculateSeasonalAlignment(weather, brand),
    calculateCategoryFit(weather, brand),
    calculateGeographicFactor(weather, brand)
  ];
};
```

### 4. Automation Engine Pattern

#### Decision Tree Implementation
```typescript
const shouldAutoApply = (
  prediction: Prediction,
  brand: Brand,
  riskTolerance: number
): boolean => {
  // High confidence + high impact = auto-apply
  if (prediction.confidence > 0.9 && prediction.budgetMultiplier > 1.5) {
    return true;
  }
  
  // Medium confidence + brand-specific rules
  if (prediction.confidence > 0.8) {
    return checkBrandSpecificRules(prediction, brand);
  }
  
  // Low risk scenarios
  if (prediction.budgetMultiplier < 1.2 && prediction.confidence > 0.7) {
    return riskTolerance > 0.5;
  }
  
  return false;
};
```

#### Rate Limiting and Safety
```typescript
const applyOptimizationWithSafety = async (
  optimization: Optimization,
  brand: Brand
): Promise<OptimizationResult> => {
  // Check rate limits
  const recentChanges = await getRecentOptimizations(brand, '1h');
  if (recentChanges.length > MAX_HOURLY_CHANGES) {
    throw new Error('Rate limit exceeded');
  }
  
  // Validate business impact
  const projectedImpact = calculateProjectedImpact(optimization, brand);
  if (projectedImpact.risk > RISK_THRESHOLD) {
    return { status: 'requires_approval', reason: 'High risk detected' };
  }
  
  // Apply with monitoring
  const result = await applyCampaignOptimization(optimization);
  await logOptimizationEvent(optimization, result, brand);
  
  return result;
};
```

## Visualization Implementation

### 1. Executive Chart Patterns

#### Revenue Trend Visualization
```typescript
const RevenueTrendChart: React.FC<{ data: TrendData[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenue-baseline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6B7280" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revenue-optimized" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString()}`,
            name === 'baseline' ? 'Baseline Revenue' : 'With Weather Intelligence'
          ]}
        />
        
        <Area
          type="monotone"
          dataKey="baseline"
          stackId="1"
          stroke="#6B7280"
          fill="url(#revenue-baseline)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="withWeatherAI"
          stackId="2"
          stroke="#3B82F6"
          fill="url(#revenue-optimized)"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
```

#### Performance Gauge Component
```typescript
const PerformanceGauge: React.FC<{ 
  score: number; 
  label: string; 
  color: string 
}> = ({ score, label, color }) => {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-lg font-bold text-gray-900">{score}%</span>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    </div>
  );
};
```

### 2. Interactive Animation Patterns

#### Staggered Card Animation
```typescript
const StaggeredCards: React.FC<{ items: any[] }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1,
            duration: 0.5,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          {/* Card content */}
        </motion.div>
      ))}
    </div>
  );
};
```

#### Loading States with Skeleton UI
```typescript
const WeatherLoadingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  </div>
);
```

## Integration Implementation

### 1. Weather API Integration

#### OpenWeather One Call API
```typescript
interface OpenWeatherResponse {
  current: {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg: number;
    uvi: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
  // Additional forecast data...
}

const fetchCurrentWeather = async (
  lat: number, 
  lon: number, 
  apiKey: string
): Promise<Weather> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  );
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  const data: OpenWeatherResponse = await response.json();
  return transformToWeatherModel(data);
};
```

### 2. Campaign Platform Integration

#### Meta Ads API Integration
```typescript
interface MetaAdsAPI {
  updateCampaignBudget: (
    campaignId: string, 
    newBudget: number, 
    accessToken: string
  ) => Promise<CampaignUpdateResult>;
  
  getCampaignPerformance: (
    campaignId: string, 
    dateRange: DateRange, 
    accessToken: string
  ) => Promise<PerformanceMetrics>;
}

const updateCampaignBudget = async (
  campaignId: string,
  budgetMultiplier: number,
  accessToken: string
): Promise<CampaignUpdateResult> => {
  const currentBudget = await getCurrentBudget(campaignId, accessToken);
  const newBudget = Math.round(currentBudget * budgetMultiplier);
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${campaignId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      daily_budget: newBudget * 100, // Meta expects cents
      status: 'ACTIVE'
    }),
  });
  
  return await response.json();
};
```

### 3. Analytics Integration

#### Google Analytics 4 Event Tracking
```typescript
const trackOptimizationEvent = (
  optimization: Optimization,
  result: OptimizationResult
) => {
  gtag('event', 'weather_optimization_applied', {
    event_category: 'automation',
    brand: optimization.brand,
    category: optimization.category,
    budget_multiplier: optimization.budgetMultiplier,
    confidence: optimization.confidence,
    result_status: result.status,
    revenue_impact: result.projectedRevenue
  });
};
```

## Testing Implementation

### 1. Component Testing with React Testing Library
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ExecutiveDashboardClean } from '../ExecutiveDashboardClean';
import { mockBrand, mockWeather, mockPredictions } from './mocks';

describe('ExecutiveDashboardClean', () => {
  it('displays revenue opportunity prominently', () => {
    render(
      <ExecutiveDashboardClean
        brand={mockBrand}
        weather={mockWeather}
        predictions={mockPredictions}
        automationEnabled={true}
      />
    );
    
    const revenueMetric = screen.getByText(/revenue opportunity/i);
    expect(revenueMetric).toBeInTheDocument();
    
    const revenueValue = screen.getByText(/\$[\d,]+/);
    expect(revenueValue).toBeVisible();
  });
  
  it('triggers demo tour when requested', () => {
    const mockOnTakeTour = jest.fn();
    
    render(
      <ExecutiveDashboardClean
        brand={mockBrand}
        weather={mockWeather}
        predictions={mockPredictions}
        automationEnabled={true}
        onTakeTour={mockOnTakeTour}
      />
    );
    
    const tourButton = screen.getByText(/start tour/i);
    fireEvent.click(tourButton);
    
    expect(mockOnTakeTour).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Weather Intelligence Testing
```typescript
import { generateSmartPredictions } from '../weatherIntelligence';

describe('Weather Intelligence Engine', () => {
  it('generates higher multipliers for optimal conditions', () => {
    const coldWeather = { current: { temperature: 35 } }; // Cold for Canopy
    const canopyBrand = { /* Canopy brand data */ };
    
    const predictions = generateSmartPredictions(
      canopyBrand,
      coldWeather,
      [],
      [],
      true
    );
    
    const winterPrediction = predictions.find(p => p.category === 'winter');
    expect(winterPrediction?.budgetMultiplier).toBeGreaterThan(1.5);
    expect(winterPrediction?.confidence).toBeGreaterThan(0.8);
  });
  
  it('prevents seasonal conflicts', () => {
    const hotWeather = { current: { temperature: 85 } };
    const outdoorBrand = { /* Brand with winter products */ };
    
    const predictions = generateSmartPredictions(
      outdoorBrand,
      hotWeather,
      [],
      [],
      true
    );
    
    // Should not suggest winter campaigns in hot weather
    const winterPredictions = predictions.filter(p => p.category === 'winter');
    expect(winterPredictions).toHaveLength(0);
  });
});
```

This implementation guide provides the foundation for building a production-ready weather intelligence platform while maintaining the executive focus and visual beauty established in the demo.