# Modeling & Control (Demo → Production)

This document explains the feature space, learning stack, interpretability, and controller logic. It embraces complexity science where it adds practical clarity.

## Feature Space

Base meteorology
- TempF, RH%, PrecipIn, DewPointF, VPD(kPa), HDD/CDD
- Anomalies (dew point, RH) and regimes (dry_cold, heat, storm)

Business context
- Weekend, PromoActive/Strength, CampaignActive/Strength
- SpendToday/7d (normed)

Composites & trends (emergent‑friendly)
- DrynessTrend: change in dryness index vs seasonal baseline
- VPD×HDD: dryness and cold amplify demand
- Weekend×Promo: human routines modulated by promos
- DrynessMomentum7d: 7‑day VPD momentum
- ComfortShock7d: 7‑day comfort shift (warmth/cold shock)

## Cohorts

Learning units are brand × category × cohort_id, where cohort_id ∈ {state, metro, cell}. Priors flow from category×climate; online learners adapt locally.

## Learning Stack

Blended priors + online
- Priors: category×climate μ with k‑pool gating
- Online: ridge‑stabilized linear learner (A,b updates) per cohort
- UCB scoring: μ + α√(xᵀA⁻¹x)

Interpretability
- Contributions use θ×x per feature; Explorer and “More details” show normalized signed % with concise explanations.
- Confidence: present as a band ±X% (derived from UCB − mean) instead of raw σ².

## Controller (Demo Proxy)

Staged plans (3‑day)
- Safe pacing: daily caps; narrative “Today +a%, Day 2 +b%, Day 3 +c%”.
- Hysteresis: avoid oscillation by requiring higher confidence to reverse direction (production).

Safety Gate (production concept)
- OK: full control; DEGRADED: damp actions (e.g., 0.8×); HALT: no writes (shadow decisions).
- Hard freezes: learning phase, data staleness, high forecast entropy.
- Soft dampers: overheated CPM/CPC, moderate forecast entropy.

## Measurement (Demo → Production)

Demo visuals
- Calibration (reliability) and holdout charts communicate measurement mindset.

Production
- Permanent holdouts with matched grouping; CUPED for variance reduction.
- Weekly incrementality reporting with significance tests.

