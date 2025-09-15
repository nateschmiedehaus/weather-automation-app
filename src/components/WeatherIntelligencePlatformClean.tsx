import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { brandTokens, BrandKey } from '../theme/tokens';
import ExecutiveDashboardClean from './ExecutiveDashboardClean';
import DemoTour from './DemoTour';
import { Brain, MapPin, Clock } from 'lucide-react';
import { mulberry32, hashString } from '../lib/rng';
import { stagePlan } from '../lib/mpc';
import { scoreCategory, updateCategory } from '../lib/predict';
import { buildFeatureVector } from '../lib/features';
import ExplorerView from './views/ExplorerView';
import SimulatorView from './views/SimulatorView';
import CampaignsView from './views/CampaignsView';
import PerformanceView from './views/PerformanceView';
import PresenterOverlay from './overlays/PresenterOverlay';
import CommandPalette from './CommandPalette';
import { addAudit, recentAudit } from '../lib/audit';
import { getUSStates } from '../lib/geo';
import { generateForecast } from '../lib/weatherSim';
import { getMetrosForState, getCellsForMetro, type Metro, type Cell } from '../lib/cohorts';
import WeatherPanel from './WeatherPanel';
import AIInsights from './AIInsights';
import { computeSafety, type SafetyState } from '../lib/safety';

// ==================== TYPES & INTERFACES ====================

interface Weather {
  current: {
    timestamp: Date;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    uvIndex: number;
    precipitation: number;
    conditions: string;
    description: string;
    location: { city: string; lat: number; lng: number };
  };
  scientific: {
    temperatureC: number;
    heatIndex: number;
    windChill: number;
    comfortIndex: number;
    weatherScore: number;
  };
  meta: {
    source: string;
    durationMs: number;
    requestId: string;
  };
}

interface Prediction {
  category: string;
  products: string[];
  action: string;
  budgetMultiplier: number;
  expectedLift: string;
  confidence: number;
  reasoning: string;
  timestamp: Date;
  aiModel: string;
  features: number[];
  ucbScore: number;
  theta?: number[];
  var?: number;
  priorPool?: number;
  stagedSteps?: number[];
  meanScore?: number;
}

interface Brand {
  name: string;
  description: string;
  logo: string;
  location: { city: string; lat: number; lng: number };
  colors: { primary: string; accent: string };
  products: {
    total: number;
    categories: Record<string, string[]>;
  };
  monthlyRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
}

// ==================== MAIN COMPONENT ====================

const WeatherIntelligencePlatformClean: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [currentView, setCurrentView] = useState<string>('brandSelection');
  const [selectedBrand, setSelectedBrand] = useState<BrandKey>('canopy');
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(true);
  const [showDemoTour, setShowDemoTour] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [scenario, setScenario] = useState<any>({
    tempAdj: 0,
    precipAdj: 0,
    promoAdj: 0,
    campaignAdj: 0,
    adSpendAdj: 0,
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [presenterOpen, setPresenterOpen] = useState(false);
  const [audit, setAudit] = useState<any[]>([]);
  const [timedDemo, setTimedDemo] = useState<boolean>(false);
  const [simDate, setSimDate] = useState<Date>(new Date());
  const [simCadence, setSimCadence] = useState<'day'|'week'>('day');
  const [simSpeed, setSimSpeed] = useState<'slow'|'normal'|'fast'>('normal');
  const states = useMemo(()=> getUSStates(), [])
  const [selectedState, setSelectedState] = useState<string>('CA')
  const [granularity, setGranularity] = useState<'state'|'metro'|'cells'>('state')
  const metros = useMemo(()=> getMetrosForState(states.find(s=>s.code===selectedState) || states[0]), [states, selectedState])
  const [selectedMetro, setSelectedMetro] = useState<string | null>(null)
  const cells = useMemo(()=> selectedMetro ? getCellsForMetro(metros.find(m=>m.id===selectedMetro)!) : [], [selectedMetro, metros])
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  
  // Route synchronization - CRITICAL FIX
  const allowedViews = new Set(['brandSelection', 'dashboard', 'explorer', 'simulator', 'campaigns', 'performance']);
  
  useEffect(() => {
    const segment = location.pathname.split('/')[1] || 'brandSelection';
    const view = allowedViews.has(segment) ? segment : 'brandSelection';
    setCurrentView(view);
  }, [location.pathname]);

  // Global hotkeys: Cmd/Ctrl+K for command palette, '?' for presenter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const key = e.key.toLowerCase()
      if ((isMac && e.metaKey && key === 'k') || (!isMac && e.ctrlKey && key === 'k')) {
        e.preventDefault(); setPaletteOpen(v => !v)
      }
      if (key === '?' || (key === '/' && e.shiftKey)) {
        e.preventDefault(); setPresenterOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Restore last brand from localStorage (if present)
  useEffect(() => {
    try {
      const stored = (typeof window !== 'undefined') ? window.localStorage.getItem('brandKey') : null;
      const valid: BrandKey[] = ['norsari','patagonia','kingsford','canopy'];
      if (stored && (valid as string[]).includes(stored)) {
        setSelectedBrand(stored as BrandKey);
      }
    } catch {}
  }, []);

  // Seed campaigns whenever brand changes
  useEffect(() => {
    const seed = () => {
      const brand = demoBrands[selectedBrand];
      const cats = Object.keys(brand.products.categories);
      const seedList = cats.slice(0, 3).map((cat, i) => ({
        id: `${selectedBrand}-${cat}-${i}`,
        name: `${cat} — ${brand.name}`,
        channels: (cat === 'summer' ? ['meta','google','tt'] : ['meta','google','email']) as ('meta'|'google'|'tt'|'email')[],
        categoryTags: [cat],
        budgetWeight: 0.5 + (Math.random()*0.2 - 0.1),
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now()+7*24*3600*1000).toISOString(),
      }));
      setCampaigns(seedList);
    };
    seed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand]);

  // Simple pipeline trigger: nudge predictions by toggling a key (re-evaluates useMemo trees)
  const [reseedTick, setReseedTick] = useState(0);
  const runDemoPipeline = () => setReseedTick(t => t + 1);

  function formatMoneyShort(n:number){
    if (n >= 1_000_000_000) return `$${(n/1_000_000_000).toFixed(1)}B`
    if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${Math.round(n/1000)}K`
    return `$${n}`
  }

  // Timed demo: advance simulated date and recompute (tracks weather over days/weeks)
  useEffect(() => {
    if (!timedDemo) return
    const stepMs = simSpeed==='slow' ? 6000 : simSpeed==='fast' ? 2000 : 3500
    const id = setInterval(() => {
      setSimDate(prev => {
        const next = new Date(prev)
        next.setDate(next.getDate() + (simCadence==='day' ? 1 : 7))
        return next
      })
      runDemoPipeline()
    }, stepMs)
    return () => clearInterval(id)
  }, [timedDemo, simCadence, simSpeed])
  
  // Mock data
  const demoBrands: Record<BrandKey, Brand> = useMemo(() => ({
    norsari: {
      name: 'NorSari',
      description: 'Wearable blankets & wool-blend wraps',
      logo: '🧣',
      location: { city: 'Northfield, MN', lat: 44.4583, lng: -93.1616 },
      colors: { primary: 'from-sky-700 to-indigo-700', accent: 'sky' },
      products: {
        total: 120,
        categories: {
          winter: ['Wool Wraps', 'Weatherproof Wraps', 'Heavyweight Wraps'],
          outdoor: ['Travel Wraps', 'Lightweight Wraps'],
          rain: ['Weatherproof Wraps']
        }
      },
      monthlyRevenue: 180000,
      avgOrderValue: 160,
      conversionRate: 2.8
    },
    patagonia: {
      name: 'Patagonia',
      description: 'Outdoor clothing & gear',
      logo: '🧗',
      location: { city: 'Ventura, CA', lat: 34.275, lng: -119.231 },
      colors: { primary: 'from-slate-800 to-cyan-700', accent: 'cyan' },
      products: {
        total: 1500,
        categories: {
          winter: ['Insulated Jackets', 'Down Sweaters', 'Thermal Layers'],
          summer: ['Trail Shirts', 'Shorts', 'Capilene®'],
          outdoor: ['Fleece Jackets', 'Vests', 'Hiking Packs'],
          rain: ['Rain Jackets', 'Storm Shells']
        }
      },
      monthlyRevenue: 80000000,
      avgOrderValue: 140,
      conversionRate: 2.3
    },
    kingsford: {
      name: 'Kingsford',
      description: 'Charcoal & grilling supplies',
      logo: '🔥',
      location: { city: 'Louisville, KY', lat: 38.2527, lng: -85.7585 },
      colors: { primary: 'from-orange-600 to-red-700', accent: 'orange' },
      products: {
        total: 80,
        categories: {
          summer: ['Charcoal Briquets', 'Hardwood Pellets', 'Flavor Boosters'],
          outdoor: ['Lighter Fluid', 'Chimney Starters', 'Grill Accessories']
        }
      },
      monthlyRevenue: 25000000,
      avgOrderValue: 25,
      conversionRate: 3.8
    },
    canopy: {
      name: 'Canopy',
      description: 'Smart humidifiers & air quality products',
      logo: '💧',
      location: { city: 'New York, NY', lat: 40.7128, lng: -74.0060 },
      colors: { primary: 'from-emerald-600 to-green-700', accent: 'emerald' },
      products: {
        total: 45,
        categories: {
          winter: ['Large Room Humidifier', 'Bedroom Humidifier', 'Essential Oil Diffusers'],
          summer: ['Cooling Mist Humidifier', 'Portable Humidifier'],
          indoor: ['Smart Air Purifier', 'Aroma Diffuser', 'Replacement Filters'],
          wellness: ['Sleep Enhancement Bundle', 'Aromatherapy Collection', 'Hydration Monitoring']
        }
      },
      monthlyRevenue: 1500000,
      avgOrderValue: 180,
      conversionRate: 4.2
    }
  }), []);

  // Mock weather data
  const forecast = useMemo(() => {
    const st = states.find(s => s.code === selectedState) || states[0]
    if (granularity==='state') return generateForecast({ lat: st.lat, lng: st.lng, region: st.region, climate: st.climate, coastal: st.coastal }, simDate, 7)
    if (granularity==='metro' && selectedMetro) {
      const m = metros.find(x=>x.id===selectedMetro)!
      return generateForecast({ lat: m.lat, lng: m.lng, region: st.region, climate: st.climate, coastal: st.coastal }, simDate, 7)
    }
    if (granularity==='cells' && selectedCell) {
      const m = metros.find(x=>x.id===selectedMetro)!
      const c = cells.find(x=>x.id===selectedCell)!
      return generateForecast({ lat: c.lat, lng: c.lng, region: st.region, climate: st.climate, coastal: st.coastal }, simDate, 7)
    }
    return generateForecast({ lat: st.lat, lng: st.lng, region: st.region, climate: st.climate, coastal: st.coastal }, simDate, 7)
  }, [states, selectedState, simDate, granularity, selectedMetro, selectedCell, metros, cells])

  const safety: SafetyState = useMemo(()=> computeSafety(forecast as any), [forecast])

  const mockWeather: Weather = useMemo(() => {
    const brand = demoBrands[selectedBrand]
    const today = forecast[0]
    return {
      current: {
        timestamp: new Date(today?.date || Date.now()),
        temperature: today?.tempF ?? 65,
        feelsLike: (today?.tempF ?? 65) - 2,
        humidity: today?.rhPct ?? 50,
        pressure: 1013,
        windSpeed: today?.windMph ?? 8,
        windDirection: 180,
        uvIndex: 5,
        precipitation: today?.precipIn ?? 0,
        conditions: today?.condition ?? 'Clear',
        description: 'Simulated forecast',
        location: { city: (states.find(s=>s.code===selectedState)?.name || 'USA'), lat: states.find(s=>s.code===selectedState)?.lat || brand.location.lat, lng: states.find(s=>s.code===selectedState)?.lng || brand.location.lng }
      },
      scientific: {
        temperatureC: ((today?.tempF ?? 65) - 32) * 5/9,
        heatIndex: (today?.tempF ?? 65) + 3,
        windChill: (today?.tempF ?? 65) - 3,
        comfortIndex: 60,
        weatherScore: 70
      },
      meta: { source: 'Simulated', durationMs: 50, requestId: Math.random().toString(36).slice(2, 10) }
    }
  }, [forecast, selectedBrand, states, selectedState])

  // Predictions using features + priors + online learner (Phase 1)
  const mockPredictions: Prediction[] = useMemo(() => {
    const brand = demoBrands[selectedBrand];
    const categories = Object.keys(brand.products.categories);
    const tempAdj = (scenario?.tempAdj ?? 0)
    const t = mockWeather.current.temperature * (1 + tempAdj * 0.15)

    const isRelevant = (cat: string) => {
      const c = cat.toLowerCase()
      if (c.includes('winter')) return t < 55
      if (c.includes('summer')) return t > 65
      if (c.includes('rain')) return (mockWeather.current.precipitation ?? 0) > 0.05
      return true
    }

    const seasonalGroup = (cat: string) => (cat.includes('winter') ? 'winter' : cat.includes('summer') ? 'summer' : 'neutral')

    const scored = categories.map((category) => {
      const cohortKey = `${selectedState}|${selectedMetro ?? 'all'}|${selectedCell ?? 'all'}`
      const out = scoreCategory({ brandKey: selectedBrand, brand, category, weather: mockWeather, scenario, geoKey: cohortKey })
      const base = 1 + Math.max(0, out.mean) * 0.2
      const ucbAdj = 1 + Math.max(0, out.ucb) * 0.15
      let multiplier = Math.min(2.0, Math.max(1.0, 0.6 * base + 0.4 * ucbAdj))
      if (!isRelevant(category)) multiplier = Math.max(1.0, multiplier - 0.2)
      const confidence = Math.min(0.99, Math.max(0.55, out.confidence - 0.05 + Math.random()*0.1))
      const fx = buildFeatureVector({ weather: mockWeather, scenario })
      const plan = stagePlan(multiplier, { start: 1.0, horizon: 3, maxDaily: 0.15 })
      const parts: string[] = []
      if (fx.dryness01 > 0.6) parts.push('Indoor air is unusually dry')
      if (fx.hdd > 5) parts.push('Heating demand is up (HDD high)')
      if (fx.promoStrength > 0.2) parts.push('Promotions active')
      if (fx.campaignStrength > 0.2) parts.push('Paid channels pushed')
      if (parts.length === 0) parts.push('Weather favorable vs baseline')
      return {
        category,
        products: brand.products.categories[category] || [],
        action: `Increase ${category} by ${Math.round((multiplier - 1) * 100)}% · ${plan.narrative}`,
        budgetMultiplier: Math.round(multiplier * 100) / 100,
        expectedLift: `+${Math.round((multiplier - 1) * 40)}%`,
        confidence,
        reasoning: parts.join(' · '),
        timestamp: new Date(),
        aiModel: 'WX-Online-UCBlite',
        features: out.x.map(v => Math.round(v * 100) / 100),
        ucbScore: Math.round(out.ucb * 100) / 100,
        meanScore: Math.round(out.mean * 100) / 100,
        theta: out.theta,
        var: out.var,
        priorPool: out.priorPool,
        stagedSteps: plan.steps,
        _seasonGroup: seasonalGroup(category)
      }
    })
    const sorted:any[] = scored.sort((a:any, b:any) => b.budgetMultiplier - a.budgetMultiplier)
    const pick:any[] = []
    for (const p of sorted) {
      if (pick.length === 0) { pick.push(p); continue }
      const g = (pick[0] as any)._seasonGroup
      if (g === 'neutral' || p._seasonGroup === 'neutral' || p._seasonGroup === g) { pick.push(p); break }
    }
    if (pick.length === 1 && sorted.length > 1) pick.push(sorted.find(x => x._seasonGroup === 'neutral') || sorted[1])
    return pick.slice(0,2).map(({_seasonGroup, ...rest})=>rest)
  }, [selectedBrand, demoBrands, mockWeather, scenario, reseedTick]);

  // Automation gating: auto-apply high-confidence suggestions and log
  useEffect(() => {
    if (!automationEnabled) return;
    const threshold = 0.82
    const auto = mockPredictions.filter(p => p.confidence >= threshold)
    if (auto.length) {
      auto.forEach(p => {
        const m = Number(p.budgetMultiplier)
        addAudit({ time: new Date().toISOString(), category: p.category, action: 'Auto‑apply staged change', multiplier: m, staged: [], confidence: p.confidence })
      })
      setAudit(recentAudit(10))
    }
  }, [automationEnabled, mockPredictions])

  // Generate smart reasoning based on brand and conditions
  const generateSmartReasoning = (brand: BrandKey, category: string, temp: number, precip: number): string => {
    if (brand === 'canopy' && category === 'winter') {
      return temp < 40 ? 
        `Freezing temperatures (${Math.round(temp)}°F) drive heating usage, creating extremely dry indoor air. Peak humidifier demand.` :
        `Cool weather increases indoor heating, reducing humidity levels. Strong humidifier opportunity.`;
    }
    
    if (brand === 'kingsford' && category === 'summer') {
      return temp > 75 && precip < 0.1 ? 
        `Perfect grilling weather: ${Math.round(temp)}°F with no rain. Peak outdoor cooking conditions.` :
        `Warm weather encourages outdoor activities. Good grilling opportunity despite conditions.`;
    }
    
    if (brand === 'patagonia' && category === 'outdoor') {
      return temp > 55 && temp < 85 ? 
        `Ideal outdoor temperature (${Math.round(temp)}°F) drives hiking and adventure activity.` :
        `Weather conditions favor outdoor gear usage. Moderate activity expected.`;
    }
    
    return `Current conditions (${Math.round(temp)}°F) are favorable for ${category} product demand.`;
  };

  // Navigation - FIXED
  const go = (view: string) => {
    if (allowedViews.has(view)) {
      navigate(`/${view}`);
      // setCurrentView will be updated by the useEffect above
    } else {
      console.warn(`Unknown view: ${view}, redirecting to brandSelection`);
      navigate('/brandSelection');
    }
  };

  // Get weather-based animation class
  const getWeatherAnimationClass = (temp: number, conditions: string, wind=0, precip=0, hour=new Date().getHours()) => {
    const c = conditions.toLowerCase()
    const classes: string[] = []
    if (c.includes('thunder') || c.includes('storm')) classes.push('weather-thunder')
    if (c.includes('snow') && temp < 25 && precip > 0.2) classes.push('weather-blizzard')
    else if (c.includes('snow')) classes.push('weather-snow')
    if (c.includes('hail')) classes.push('weather-hail')
    if (c.includes('rain') && !classes.includes('weather-thunder')) classes.push('weather-rain')
    if (wind > 18) classes.push('weather-wind')
    if (c.includes('fog') || c.includes('mist')) classes.push('weather-fog')
    // Seasonal aesthetics
    const m = new Date().getMonth()
    if ((m===9 || m===10) && precip>0.05) classes.push('weather-fall')
    if ((m===3 || m===4) && precip<0.05 && temp>50) classes.push('weather-spring')
    if (hour < 6 || hour > 19) classes.push('weather-night')
    if (temp > 75 && c.includes('clear')) classes.push('weather-sunshine')
    return classes.join(' ')
  };

  // Get glass style based on weather
  const getWeatherGlassClass = (temp: number) => {
    if (temp < 50) return 'glass-winter';
    if (temp > 75) return 'glass-summer';
    return 'glass-rain';
  };

  // Brand Selection Component
  const BrandSelection = () => (
    <div className={`min-h-screen flex items-center justify-center p-6 ${getWeatherAnimationClass(45, 'clear')}`}>
      <div className="max-w-4xl w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Weather Intelligence Platform
          </h1>
          <p className="text-xl text-gray-700">Choose a brand to see weather-driven marketing in action</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(demoBrands).map(([key, brand], index) => (
            <motion.button
              key={key}
              onClick={() => {
                setSelectedBrand(key as BrandKey);
                try { window.localStorage.setItem('brandKey', key); } catch {}
                setIsInitializing(true);
                setTimeout(() => {
                  setIsInitializing(false);
                  go('dashboard');
                }, 2000);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group glass glass-hover glass-transition p-6 relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  {brand.logo}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{brand.name}</h3>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{brand.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {brand.location.city}
                  </span>
                  <span className="font-semibold">{formatMoneyShort(brand.monthlyRevenue)}/mo</span>
                </div>
              </div>
              
              {/* Subtle brand-colored accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${brand.colors.primary} opacity-5 rounded-bl-full`}></div>
            </motion.button>
          ))}
        </div>
        
        {/* Floating weather indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8 glass-subtle p-4 rounded-2xl"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Weather Intelligence Active</span>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Dashboard Component  
  const Dashboard = () => {
    const weatherClass = getWeatherAnimationClass(
      mockWeather.current.temperature,
      mockWeather.current.conditions,
      mockWeather.current.windSpeed,
      mockWeather.current.precipitation,
      new Date().getHours()
    );
    const glassClass = getWeatherGlassClass(mockWeather.current.temperature);
    
    return (
      <div className={`min-h-screen ${weatherClass}`}>
        {/* Glass Header */}
        <div className="glass-strong border-0 border-b border-white/20 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => go('brandSelection')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-subtle glass-hover glass-transition px-4 py-2 text-gray-700 font-medium"
                >
                  ← Back to Brands
                </motion.button>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-4xl"
                >
                  {demoBrands[selectedBrand].logo}
                </motion.div>
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900"
                  >
                    {demoBrands[selectedBrand].name}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-700 flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {demoBrands[selectedBrand].location.city}
                  </motion.p>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className={`glass-subtle ${glassClass} glass-transition p-4`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700 font-medium">AI Automation</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={automationEnabled} 
                        onChange={(e) => setAutomationEnabled(e.target.checked)} 
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-white/50 peer-checked:bg-emerald-500/80 rounded-full relative transition-all backdrop-blur-sm after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg peer-checked:after:translate-x-4 after:transition-all"></div>
                    </label>
                  </div>
                </div>
                <div className={`glass-subtle ${glassClass} glass-transition p-4`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700 font-medium">Geography</span>
                    <select className="text-sm bg-transparent border rounded px-2 py-1" value={granularity} onChange={(e)=>{ const g = e.target.value as any; setGranularity(g); if (g==='state'){ setSelectedMetro(null); setSelectedCell(null);} }}>
                      <option value="state">State</option>
                      <option value="metro">Metro</option>
                      <option value="cells">Cells</option>
                    </select>
                    <select className="text-sm bg-transparent border rounded px-2 py-1" value={selectedState} onChange={(e)=> setSelectedState(e.target.value)}>
                      {states.map(s=> (<option key={s.code} value={s.code}>{s.code} — {s.name}</option>))}
                    </select>
                    {granularity!=='state' && (
                      <select className="text-sm bg-transparent border rounded px-2 py-1" value={selectedMetro ?? ''} onChange={(e)=> setSelectedMetro(e.target.value || null)}>
                        <option value="">Select metro</option>
                        {metros.map(m=> (<option key={m.id} value={m.id}>{m.name}</option>))}
                      </select>
                    )}
                    {granularity==='cells' && selectedMetro && (
                      <select className="text-sm bg-transparent border rounded px-2 py-1" value={selectedCell ?? ''} onChange={(e)=> setSelectedCell(e.target.value || null)}>
                        <option value="">Select cell</option>
                        {cells.map(c=> (<option key={c.id} value={c.id}>{c.id}</option>))}
                      </select>
                    )}
                  </div>
                </div>
                <div className={`glass-subtle ${glassClass} glass-transition p-4`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700 font-medium">Timed Demo</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={timedDemo} 
                        onChange={(e) => setTimedDemo(e.target.checked)} 
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-white/50 peer-checked:bg-indigo-500/80 rounded-full relative transition-all backdrop-blur-sm after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg peer-checked:after:translate-x-4 after:transition-all"></div>
                    </label>
                    <select className="text-sm bg-transparent border rounded px-2 py-1"
                      value={simCadence}
                      onChange={(e)=> setSimCadence(e.target.value as any)}
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                    </select>
                    <select className="text-sm bg-transparent border rounded px-2 py-1"
                      value={simSpeed}
                      onChange={(e)=> setSimSpeed(e.target.value as any)}
                    >
                      <option value="slow">Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>
                </div>
                <div className="glass-subtle p-3 text-xs text-gray-700 flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">Interactive Demo</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Simulated Data</span>
                  <span className="px-2 py-1 bg-white/60 border rounded-full">{simDate.toLocaleDateString()}</span>
                </div>
                
                {/* Live weather indicator */}
                <div className="glass-subtle p-3 flex items-center space-x-2">
                  <div className="text-2xl">
                    {mockWeather.current.temperature < 40 ? '❄️' : 
                     mockWeather.current.temperature > 75 ? '☀️' : '🌤️'}
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-gray-900">{Math.round(mockWeather.current.temperature)}°F</div>
                    <div className="text-gray-600 text-xs">{mockWeather.current.conditions}</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content with relative positioning for weather effects */}
        <div className="max-w-7xl mx-auto p-6 relative z-10">
          {isInitializing ? (
            <div className="flex items-center justify-center h-96">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="glass-strong p-8 mx-auto mb-6 w-fit">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Initializing Weather Intelligence</h2>
                  <p className="text-gray-700 text-lg">Analyzing real-time weather data and generating insights...</p>
                  <div className="w-80 h-2 bg-white/30 rounded-full mx-auto mt-6 overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <WeatherPanel forecast={forecast as any} />
              </div>
              <div className="mb-6">
                <AIInsights forecast={forecast as any} predictions={mockPredictions as any} />
              </div>
              <ExecutiveDashboardClean 
                brand={demoBrands[selectedBrand]}
                predictions={mockPredictions}
                automationEnabled={automationEnabled}
                weather={mockWeather}
                geoLabel={`${selectedState}${selectedMetro? ' · '+metros.find(m=>m.id===selectedMetro)?.name: ''}${selectedCell? ' · '+selectedCell: ''}`}
                onTakeTour={() => setShowDemoTour(true)}
                onNavigate={(view) => go(view)}
              />
            </motion.div>
          )}
          
          <DemoTour
            isOpen={showDemoTour}
            onClose={() => setShowDemoTour(false)}
            onComplete={() => setShowDemoTour(false)}
          />

          {audit.length > 0 && (
            <div className="mt-6 glass-subtle p-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">Recent Automation Activity</div>
              <ul className="text-sm text-gray-700 space-y-1">
                {audit.map((e,i)=>(
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-gray-500 w-36">{new Date(e.time).toLocaleTimeString()}</span>
                    <span className="capitalize">{e.category}</span>
                    <span className="">{e.action}</span>
                    <span className="text-emerald-700">{(Math.round((e.multiplier-1)*100))}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render - ALL VIEWS HANDLED
  let content: React.ReactNode;
  switch (currentView) {
    case 'dashboard':
      content = <Dashboard />;
      break;
    case 'explorer':
      content = (
        <ExplorerView 
          brand={demoBrands[selectedBrand]}
          predictions={mockPredictions}
          forecast={forecast}
          onBack={() => go('dashboard')}
        />
      );
      break;
    case 'simulator':
      content = (
        <SimulatorView 
          scenario={scenario}
          setScenario={setScenario}
          runDemoPipeline={() => {
            const brand = demoBrands[selectedBrand]
            mockPredictions.forEach(p => {
              updateCategory({ brandKey: selectedBrand, brand, category: p.category, weather: mockWeather, scenario })
            })
            runDemoPipeline()
          }}
          forecast={forecast}
          onBack={() => go('dashboard')}
        />
      );
      break;
    case 'campaigns':
      content = (
        <CampaignsView 
          brand={demoBrands[selectedBrand]}
          brandKey={selectedBrand}
          campaigns={campaigns}
          setCampaigns={setCampaigns}
          weather={mockWeather}
          forecast={forecast}
          onBack={() => go('dashboard')}
          onApply={() => { runDemoPipeline(); go('dashboard') }}
        />
      );
      break;
    case 'performance':
      content = (
        <PerformanceView 
          actions30d={120 + Math.floor(Math.random()*40)}
          roasLiftPct={Math.round((0.15 + Math.random()*0.06)*100)}
          accuracyPct={Math.round((0.9 + Math.random()*0.05)*100)}
          forecast={forecast}
          onBack={() => go('dashboard')}
        />
      );
      break;
    case 'brandSelection':
    default:
      content = <BrandSelection />;
      break;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentView}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
        <PresenterOverlay open={presenterOpen} onClose={()=> setPresenterOpen(false)} />
        <CommandPalette 
          open={paletteOpen}
          onClose={()=> setPaletteOpen(false)}
          commands={[
            { id:'nav-dashboard', label:'Go to Dashboard', action: ()=> go('dashboard') },
            { id:'nav-explorer', label:'Open Explorer', action: ()=> go('explorer') },
            { id:'nav-simulator', label:'Open Simulator', action: ()=> go('simulator') },
            { id:'nav-campaigns', label:'Open Campaigns', action: ()=> go('campaigns') },
            { id:'nav-performance', label:'Open Performance', action: ()=> go('performance') },
            { id:'action-run', label:'Run Recommendation Pipeline', action: ()=> runDemoPipeline() },
            { id:'action-toggle-automation', label: `${automationEnabled? 'Disable':'Enable'} Automation`, action: ()=> setAutomationEnabled(v=>!v) },
          ]}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default WeatherIntelligencePlatformClean;
