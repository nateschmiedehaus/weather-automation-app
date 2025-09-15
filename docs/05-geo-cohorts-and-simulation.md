# Geography Cohorts & Simulation

## Why cohorts (not counties)

We want granularity that aligns with ad delivery and human understanding without drowning the UI. Cohorts are defined hierarchically:

- State: every US state with region/climate/coastal tags
- Metro: 3–6 per state (coastal/urban/mountain/inland)
- Cells: 3–5 per metro (small offsets) for deep‑dives

Learning scopes are brand × category × cohort_id. Priors flow from category×climate.

## Simulation details

Climate‑aware forecast per cohort
- Temperature amplitude by climate (desert/mountain/marine/humid)
- RH baselines and precip biases by climate/coastal; wind biases by region
- Rich fields: dew point, VPD, HDD, cloud cover, UV, visibility, pressure, gusts, PoP, precip type, sunrise/sunset

Timed Demo (day/week cadence)
- Simulated date advances; forecast and outcomes evolve continuously.

## UI patterns

Progressive disclosure
- Geography: State → Metro → Cells selectors
- Cards show cohort scope (e.g., CA · LA Metro · C2)
- WeatherPanel surfaces “Outlook highlight”: composite insights (Storm Risk Rising, Dry Cold Momentum, Humid Warm Surge)

