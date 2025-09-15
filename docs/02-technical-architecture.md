# Technical Architecture (Demo → Production)

## System Overview

The Weather Intelligence Platform is a React‑based SPA that simulates a production‑grade weather optimization system. It balances executive‑grade visualization with real ML logic (priors + online) and controller thinking (staging + safety) while remaining fast and local.

## Frontend Architecture

### Core Framework Stack
- **React 18.3.1**: Modern functional components with hooks
- **TypeScript 5.6.2**: Type safety and developer experience
- **Framer Motion 11.11.1**: Smooth animations and transitions
- **React Router DOM 6.26.2**: Client-side routing
- **Recharts 2.12.7**: Executive-quality data visualization
- **Tailwind CSS 3.4.10**: Utility-first styling system

### Component Architecture (selected)

#### Executive Dashboard Layer
```
ExecutiveDashboardClean.tsx
├── Executive Metrics (Revenue, ROAS, Market Edge)
├── Weather Context Display
├── Immediate Actions Panel
├── Performance Summary
└── Revenue Trend Visualization
```

#### Platform Layer
```
WeatherIntelligencePlatformClean.tsx
├── Geography & Cohorts (State → Metro → Cells)
├── WeatherPanel (today + 7‑day outlook/trends)
├── Timed Demo (day/week cadence)
├── State (Weather, Predictions, Automation)
└── Scoring (priors + online per category×cohort)
```

#### Supporting Components
```
DemoTour.tsx          # Interactive onboarding
ExecutiveInsights.tsx # AI-powered explanations
OptimizationSuggestions.tsx # One-click optimizations
```

### State Management Philosophy

#### Local State with Hooks
- **useState**: Component-level state for UI interactions
- **useEffect**: Side effects and lifecycle management
- **useMemo**: Expensive calculations (weather processing, predictions)
- **useCallback**: Function memoization for performance

#### No Redux/Context (Intentional)
- **Rationale**: Demo simplicity, executive focus over complex state
- **Trade-off**: Less scalable but more maintainable for demo purposes
- **Future**: Context API for production-scale state management

## Data & Modeling Architecture

### Brand Model Structure
```typescript
interface Brand {
  name: string;                    // Display name
  description: string;             // Executive summary
  logo: string;                   // Emoji for demo clarity
  location: {                     // Geographic context
    city: string;
    lat: number;
    lng: number;
  };
  colors: {                       // Brand theming
    primary: string;              // Gradient definition
    accent: string;               // Accent color
  };
  products: {
    total: number;               // Portfolio size
    categories: Record<string, string[]>; // Seasonal categorization
  };
  monthlyRevenue: number;        // Business context
  avgOrderValue: number;         // Unit economics
  conversionRate: number;        // Baseline performance
}
```

### Weather Intelligence Model (rich fields)
```typescript
interface Weather {
  current: {
    timestamp: Date;
    temperature: number;         // Primary driver
    feelsLike: number;          // Perceived temperature
    humidity: number;           // Air quality factor
    windSpeed: number;          // Comfort modifier
    precipitation: number;      // Activity inhibitor
    gustMph: number;            // Gusts
    uvIndex: number;            // 0..11
    pressureHpa: number;        // Sea‑level pressure
    visibilityMi: number;       // MI
    cloudCover: number;         // 0..1
    conditions: string;         // Human-readable
    description: string;        // Marketing context
    location: GeoLocation;      // Brand-specific weather
  };
  scientific: {
    temperatureC: number;       // International units
    heatIndex: number;          // Comfort calculation
    windChill: number;          // Winter adjustment
    comfortIndex: number;       // Behavioral predictor
    weatherScore: number;       // Overall favorability
  };
  meta: {
    source: string;             // Data provenance
    durationMs: number;         // API performance
    requestId: string;          // Debugging
  };
}
```

### Prediction Engine Structure
```typescript
interface Prediction {
  category: string;              // Product category
  products: string[];           // Affected SKUs
  action: string;               // Recommended action
  budgetMultiplier: number;     // Scaling factor
  expectedLift: string;         // Revenue impact
  confidence: number;           // Model certainty
  reasoning: string;            // Executive explanation
  timestamp: Date;              // Prediction time
  aiModel: string;             // Model attribution
  features: number[];          // Feature importance
  ucbScore: number;            // Exploration/exploitation balance
}
```

## Intelligence Engine (evolving)

### Weather-to-Revenue Logic

#### (Legacy) Brand-Specific Multipliers
```typescript
const getSeasonalMultiplier = (
  brand: BrandKey, 
  category: string, 
  temp: number, 
  precip: number, 
  comfort: number
): number => {
  // Canopy (Humidifiers): Cold = Dry Air = High Demand
  if (brand === 'canopy' && category === 'winter') {
    if (temp < 40) return 2.5;  // Extreme cold
    if (temp < 50) return 2.0;  // Cold season
    if (temp < 65) return 1.5;  // Cool season
    return 0.8;                 // Warm = less heating
  }
  
  // Kingsford (Grilling): Perfect Weather = Peak Demand
  if (brand === 'kingsford' && category === 'summer') {
    if (temp > 75 && precip < 0.1) return 2.8; // Perfect grilling
    if (temp > 65 && precip < 0.2) return 2.0; // Good conditions
    if (precip > 0.2) return 0.3;              // Rain kills grilling
    return 0.8;
  }
  
  // Additional brand logic...
}
```

#### Seasonal Conflict Prevention
```typescript
// Prevent winter/summer campaigns simultaneously
const relevantCategories = categories.filter(category => {
  if (category === 'winter' && temp > 70) return false;
  if (category === 'summer' && temp < 40) return false;
  return true;
});
```

#### Smart Reasoning Generation
```typescript
const generateSmartReasoning = (
  brand: BrandKey, 
  category: string, 
  temp: number, 
  precip: number
): string => {
  // Context-aware explanations for executives
  if (brand === 'canopy' && category === 'winter') {
    return temp < 40 ? 
      `Freezing temperatures (${Math.round(temp)}°F) drive heating usage, creating extremely dry indoor air. Peak humidifier demand.` :
      `Cool weather increases indoor heating, reducing humidity levels. Strong humidifier opportunity.`;
  }
  // Additional reasoning logic...
}
```

## Visualization Architecture

### Chart Strategy
- **Executive Level**: High-level trends, revenue impact, ROAS improvements
- **Operational Level**: Campaign performance, weather correlations
- **Technical Level**: Model performance, feature importance

### Recharts Implementation
```typescript
// Revenue Trend Visualization
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
    <Area type="monotone" dataKey="baseline" fill="url(#baseline)" name="Baseline Revenue" />
    <Area type="monotone" dataKey="withWeatherAI" fill="url(#weatherai)" name="With Weather AI" strokeWidth={3} />
  </AreaChart>
</ResponsiveContainer>
```

## Demo Tour Architecture

### Progressive Disclosure Strategy
1. **Welcome**: High-level value proposition
2. **AI Predictions**: Technical sophistication
3. **Automation**: Efficiency and ROI
4. **Executive Insights**: Leadership value
5. **Brand Scenarios**: Practical application

### Animation and Transitions
```typescript
// Step-by-step revelation with timing
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
```

## Performance Optimizations

### Component Optimization
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Cache expensive calculations (weather analysis, predictions)
- **useCallback**: Stable function references
- **Lazy Loading**: Code splitting for views

### Data Processing
- **Smart Filtering**: Seasonal logic prevents irrelevant predictions
- **Prioritization**: Show top 2-3 most impactful categories
- **Caching**: Mock data generation with consistent results

### Animation Performance
- **Framer Motion**: GPU-accelerated animations
- **Staggered Animations**: Progressive disclosure without jank
- **Transform Properties**: Hardware acceleration

## Integration Architecture

### Weather Data Sources (Production)
```typescript
// Future integrations
interface WeatherAPI {
  openWeather: OpenWeatherOneCall;     // Primary source
  noaa: NationalWeatherService;        // US government data
  weatherUnderground: WundergroundAPI;  // Hyperlocal conditions
  darkSky: DarkSkyAPI;                // Minute-by-minute precipitation
}
```

### Campaign Platform APIs
```typescript
// Marketing platform integrations
interface CampaignAPIs {
  meta: FacebookAdsAPI;      // Facebook/Instagram campaigns
  google: GoogleAdsAPI;      // Search and display
  tiktok: TikTokAdsAPI;     // Social video
  klaviyo: KlaviyoAPI;      // Email automation
}
```

### Analytics and Tracking
```typescript
// Performance measurement
interface Analytics {
  ga4: GoogleAnalytics4;     // Web analytics
  segment: SegmentAPI;       // Customer data platform
  mixpanel: MixpanelAPI;     // Product analytics
  amplitude: AmplitudeAPI;    // Behavioral analytics
}
```

## Security Architecture

### Data Protection
- **Client-Side Only**: No sensitive data transmission
- **Mock Data**: Realistic but fictional brand metrics
- **No Authentication**: Demo-focused, no user data

### Production Security Considerations
- **API Key Management**: Environment variables, rotation
- **Rate Limiting**: Weather API call optimization
- **Data Encryption**: Transit and rest encryption
- **Access Control**: Role-based permissions

## Deployment Architecture

### Current (Demo)
- **Vite Development**: Hot reload, fast builds
- **Static Hosting**: Netlify, Vercel, or similar
- **Client-Side Routing**: No backend required

### Production Considerations
- **API Gateway**: Weather data aggregation
- **Database**: Historical weather, campaign performance
- **Caching Layer**: Redis for weather data
- **CDN**: Global performance optimization

This technical architecture ensures executive clarity while maintaining sophisticated backend intelligence, positioning the platform for both impressive demos and production scalability.
## Cohorts & Geography
Hierarchy: State → Metro → Cells. Learning scopes are brand × category × cohort_id.

- State: generated for all US states with region/climate/coastal tags (procedural)
- Metro: 3–6 per state (coastal/urban/mountain tags), deterministically seeded
- Cells: 3–5 per metro (small offsets) for deep‑dives without overwhelming the UI

## Weather Simulation (realistic and fast)
- Seasonal temp amplitude (by climate)
- RH baselines and precip biases (by climate/coastal)
- Wind biases (mountain/Midwest)
- Derived dew point, VPD, HDD
- Rich fields: cloud cover, UV, pressure, visibility, gusts, PoP, precip type, sunrise/sunset
- Timed Demo: advances simulated date (day/week cadence), forecast evolves; UI re‑scores

## Features & Composites (emergent‑friendly)
- Meteorology: TempF, RH%, PrecipIn, DewPointF, VPD(kPa), HDD, anomalies
- Business: weekend, promo/campaign flags, spend today/7d
- Composites: DrynessTrend, VPD×HDD, Weekend×Promo, DrynessMomentum7d, ComfortShock7d

## Learning & Scoring (priors + online)
- Priors: category×climate priors emphasize expected drivers
- Online learner: ridge‑stabilized per cohort; A,b updates and UCB scoring
- Model‑weighted contributions: θ×x used for top factors and Explorer bars
- Confidence band = f(UCB−mean) → ±X% (readable)

## Controller & Safety (Demo)
- Staged plans (3‑day proxy): caps and pacing visualize safe control
- Automation: high‑confidence auto‑apply; manual otherwise
- Safety Gate concept (production): OK/DEGRADED/HALT with hard freezes vs soft dampers (simulated in UI copy)

## Production Mapping
- Event‑driven microservices (weather, model, policy, QC Firewall, writer)
- Mandatory health gating before writes; hard freezes vs soft dampers
- Canary writes; holdouts + CUPED; infra‑as‑code, monitoring, alerts
