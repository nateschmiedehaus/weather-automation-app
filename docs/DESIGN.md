Weather Intelligence Demo — Design System and Aesthetic Guide

Vision & Philosophy
- Intelligence with restraint: express competence through clarity and calm, not spectacle.
- Narrative over noise: pair every number with a one‑line business story and action.
- Safety you can see: staging, caps, and deferrals are visible and human‑readable.
- Trust by design: progressive disclosure, reversible actions, consistent motion, and WCAG‑aware colors.

Complex systems design notes
- Visualize change: show trends (7‑day outlooks), staged plans, and confidence bands.
- Surface emergence: highlight composite “Outlook” insights (e.g., Dry Cold Momentum) with iconography.
- Avoid clutter: use semantic typography, gentle elevation, and focused animations.

Purpose
- Create a distinctive, elegant interface that communicates intelligence, safety, and calm control — a product leaders want to use and show.
- Maintain demo speed and clarity while laying a foundation that scales to production.

Design Principles
- Clarity first: one idea per view, progressive disclosure for depth.
- Confident calm: restrained color, soft elevation, sparse borders; avoid visual noise.
- Explainable intelligence: narratives paired with metrics; simple motion to guide attention.
- Safety and trust: visible guardrails, reversible actions, readable audit trails.
- Accessibility by default: keyboard‑first, WCAG AA contrasts, 44px targets, reduced motion support.

Foundations
- Typography: system sans (ui-sans-serif) with semantic sizes
  - display (3rem/1.1), headline (2.25rem/1.15), title (1.5rem/1.2), body (1rem/1.6), caption (0.8125rem/1.4)
  - Use semantic classes via Tailwind: text-display, text-headline, etc. (see tailwind.config.ts)
- Color: brand.primary (#3b82f6), accent (#22d3ee), neutral (#111827)
  - Emphasize neutrals; use gradients sparingly (brand) for emphasis.
  - Status: green (success), amber (warning), red (error) using Tailwind defaults.
- Elevation & Glass
  - glass: translucent surface with blur and subtle border (class: glass, glass-subtle, glass-strong)
  - elevation: use shadow-elevated for cards; shadow-glow for focus states.
- Motion
  - Durations: fast 150ms; normal 300ms; slow 600ms
  - Use ease-in-out; emphasized motion only for primary affordances
  - Avoid constant animated backgrounds; keep motion purposeful

Layout & Spacing
- Grid: max-w-7xl for main content; 24px padding on edges; 16–24px grid gutters
- Spacing: 4/8/12/16 baseline; cards: 16–24 internal padding
- Cards: radius 16–20px, light border, subtle elevation

Iconography & Visuals
- Use lucide-react for consistent icons; size 16–20 inside body text; 24–32 for headers.
- Data visuals: avoid heavy chrome; use soft grids, light gradients; annotate with short narratives.

Micro-interactions
- Hover: 2–4px lift with shadow-elevated; color shift ≤10% toward brand color
- Press: scale 0.98; return with spring easing
- Focus: glow ring + subtle border emphasis

Accessibility
- Contrast: WCAG AA or better (4.5:1 text, 3:1 large text)
- Keyboard: tab order logical; roving tabindex for complex grids; skip links for main regions
- Reduced motion: respect prefers-reduced-motion; disable non-essential animation

Content Style
- Tone: precise, confident, helpful; short sentences; verb‑first for actions
- Narratives: name factor → business implication → action/safety
  - Example: “Indoor air is unusually dry → humidifier demand ↑ → staged +8% today.”

Tailwind & Tokens
- Tailwind config extends fonts, sizes, colors, elevation, blur, zIndex, durations.
- Tokens in src/theme/tokens.ts: brandTokens, typeScale, motion, elevation.

Component Guidelines
- Buttons: prominent actions (filled brand); secondary (outline/ghost); avoid more than two primaries per view
- Cards: glass-subtle + border; consistent padding; headline + supporting text; actions aligned right
- Charts: no 3D; minimal grid; legible tooltips; units in labels; avoid mixed axes unless essential; show confidence bands where possible

Chart Style
- Lines/areas: 2–3px stroke; soft gradient fill to 0 opacity; minimal legend; label directly when possible
- Bars: radius 6; spacing consistent; limit simultaneous series to ≤3

Responsive Rules
- Mobile: single column; controls stack; hide non-essential chrome; use summary cards
- Tablet: two columns; show sparkline trend blocks
- Desktop: full layout; add Explorer and Simulator as separate views

Motion Library (usage)
- Use framer-motion with motion.div initial/animate/exit; duration=300ms default
- Page transitions: fade/slide 8–12px; list items stagger 0.05s

Do/Don’t
- Do: show confidence and staging with short sentences near actions
- Don’t: overload the dashboard with raw data; keep it narrative + top metrics
