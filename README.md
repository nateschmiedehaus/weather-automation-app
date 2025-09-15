Weather Intelligence Demo — Executive Overview + Quickstart

Why this matters (executive)
- Absolute cutting edge: Probabilistic weather intelligence blended with hierarchical network priors, online learning, and MPC‑paced actions — engineered for safety and explainability.
- Network effects: Anonymous category×climate learning accelerates accuracy and crushes cold‑start while preserving competitive isolation.
- Trust by design: Confidence‑tiered decisions, guardrails to avoid learning‑phase resets, full audit trails, and clear narratives.

What the demo proves
- The platform senses weather context (dew point, VPD, HDD, anomalies) and richer composites (DrynessTrend, VPD×HDD, Weekend×Promo), learns demand signals per brand/category/geo cohort, and recommends staged budget changes with confidence and safety.
- It is fast, deterministic, and runs locally; the production‑grade scaffolding (privacy pools, controller/safety, causal framing) is reflected in the UX without requiring backends.

Complex systems lens (how we think)
- Weather→behavior is complex and context‑dependent. We preserve uncertainty, embrace emergence (new signals), and design for feedbacks and safe control.
- Cohorts (state→metro→cells) reflect geography at the right level of abstraction; hierarchical priors share learnings without overfitting.
- Decisions are staged with guardrails; automation respects health state (OK/DEGRADED/HALT concept) even in demo semantics.

Overview
- Tech: Vite + React + Tailwind + Recharts; Sidecar scripts for app-window demo.
- Entry: src/components/WeatherIntelligencePlatformClean.tsx (brand selection → dashboard → views).
- Error handling: src/components/ErrorBoundary.tsx wraps the router.

Run
- Standard: npm install && npm run dev
- Sidecar app window: npm run demo (alias for dev:sidecar)
- Build/preview: npm run build && npm run preview
- Clean start (purge cache + demo mode): npm run clean-start

Presenter script (5 minutes)
1) Landing → choose Canopy (Humidifiers). Note “Interactive Demo” and “Simulated Data.”
2) Geography → set State/Metro/Cells; turn on Timed Demo (Day/Week). WeatherPanel shows today + 7‑day outlook + trends and an “Outlook highlight.”
3) Dashboard → run pipeline; cards show recommendation (+X%), projected outcome, status (Auto‑applied), confidence chip, staging mini‑bars, and “why.”
4) Simulator → adjust presets (Cold snap/Stormy/BBQ) or sliders; Apply & Return back to dashboard.
5) Explorer → model‑weighted drivers (θ×x) with short explanations; normalized bars (signed %).
6) Performance → calibration + holdout visuals; speak to measurement and safety.
7) Cmd/Ctrl+K → command palette; “?” → presenter notes.

Navigation
- Start at brand selection → choose Canopy or another brand.
- Dashboard quick-links open Explorer, Simulator, Campaigns, and Performance.
- Back buttons return to the dashboard.

State persistence
- Last selected brand is stored in localStorage (key: brandKey) and restored on load.

Troubleshooting (macOS shells printing brew/pyenv errors)
If dev scripts fail silently or tools can’t start, your shell profile may be printing Homebrew/pyenv errors in non-interactive shells. This can break Vite or automation.

Options to fix:
1) Run dev without sourcing profiles (clean shell):
   env -i PATH="/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin" bash --noprofile --norc -lc 'cd /Volumes/BigSSD4/nathanielschmiedehaus/weather-intel-demo && npm install && npm run dev'

2) Guard your ~/.bash_profile so it only runs for interactive shells:
   Add near the top:
     case $- in *i*) ;; *) return ;; esac
   Or wrap brew/pyenv init in:
     if [[ $- == *i* ]]; then eval "$(brew shellenv)"; fi
     if [[ $- == *i* ]]; then eval "$(pyenv init -)"; fi

If imports appear “undefined” at runtime:
- Stop the dev server, run: npm run clean-start, then hard reload the browser with cache disabled.

Known gotchas
- If you see a blank page, refresh with cache disabled to avoid stale dist assets.
- Error boundary shows a friendly message for runtime errors (check console for details).
- Tailwind utilities are compiled from src/index.css; “glass-” helpers are already defined.

Why this is best‑in‑class (technical cut)
- Probabilistic mindset: Ensemble‑aware thinking, calibrated outputs, confidence‑tiered actions.
- Feature depth: Dew point, VPD, HDD/CDD, anomalies, dryness index, regimes, weekend/promos/spend; composites (DrynessTrend, VPD×HDD, Weekend×Promo), and cohort‑aware context — not just “temp vs sales.”
- Learning: Hierarchical category×climate priors + per‑cohort online learners for adaptive, safe decisions.
- Control: MPC‑paced staging with caps, guardrails, and clear deferrals (demo‑grade in‑app).
- UX: Narrative explanations, minimal chrome charts, presenter overlay, command palette — speed + clarity.

What’s in this repo (orientation)
- src/lib/geo.ts — state‑level regions/climate/coastal tags (procedural)
- src/lib/cohorts.ts — metros (3–6/state) and small cells (3–5/metro) for deep‑dives
- src/lib/weatherSim.ts — climate‑aware forecast generator (today + 7‑day)
- src/lib/features.ts — feature engineering and composites (DrynessTrend, VPD×HDD, Weekend×Promo, 7‑day momentum/shock)
- src/lib/networkPriors.ts — category×climate priors
- src/lib/online.ts, src/lib/predict.ts — blended priors + online learner, UCB scoring
- src/components/WeatherPanel.tsx — Today + 7‑day outlook and trends
- src/components/* — views (Dashboard/Explorer/Simulator/Campaigns/Performance) wired to cohorts and weather
- docs/* — philosophy/vision, architecture, implementation, design, modeling/control, cohorts/simulation, safety/measurement

Project scripts
- dev: Vite dev server (http://localhost:5173)
- demo: Launch dev + Sidecar app window
- build: TypeScript build and Vite bundling
- preview: Static preview of the production build
