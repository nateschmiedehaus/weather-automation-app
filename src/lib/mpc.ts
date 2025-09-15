// Demo-grade MPC staging: compute staged daily steps from 1.0 -> target with caps

export type MPCPlan = {
  steps: number[] // multipliers per day (length = horizon)
  narrative: string
}

export function stagePlan(target: number, opts?: { start?: number; horizon?: number; maxDaily?: number }): MPCPlan {
  const start = opts?.start ?? 1.0
  const horizon = Math.max(1, opts?.horizon ?? 3)
  const maxDaily = Math.max(0.01, opts?.maxDaily ?? 0.15)

  const steps: number[] = []
  let current = start
  for (let d = 0; d < horizon; d++) {
    const remaining = target - current
    const allowed = Math.sign(remaining) * Math.min(Math.abs(remaining), current * maxDaily)
    current = Math.max(0.5, Math.min(3.0, current + allowed))
    steps.push(Number(current.toFixed(2)))
  }
  const perc = (v: number) => `${Math.round((v - 1) * 100)}%`
  let nar = `Staged: ${perc(steps[0])} today`
  if (horizon > 1) nar += `, ${perc(steps[1])} day 2`
  if (horizon > 2) nar += `, ${perc(steps[2])} day 3`
  return { steps, narrative: nar }
}

