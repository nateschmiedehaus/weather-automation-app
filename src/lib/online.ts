// Simple online linear model for demo: ridge-stabilized LinUCB/Thompson-like scoring

export type OnlineState = {
  A: number[][] // d x d
  b: number[]   // d
  lambda: number
}

export function initOnline(dim: number, lambda = 5): OnlineState {
  const I = Array.from({ length: dim }, (_, i) => Array.from({ length: dim }, (_, j) => (i === j ? lambda : 0)))
  return { A: I, b: Array(dim).fill(0), lambda }
}

function clone2D(M: number[][]): number[][] { return M.map(r => r.slice()) }

// Solve A x = y via Gaussian elimination (returns x)
export function solveLinear(A: number[][], y: number[]): number[] {
  const n = y.length
  const M = A.map((r, i) => [...r, y[i]])
  for (let i = 0; i < n; i++) {
    // pivot
    let max = i
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[max][i])) max = r
    const tmp = M[i]; M[i] = M[max]; M[max] = tmp
    const div = M[i][i] || 1e-8
    for (let j = i; j <= n; j++) M[i][j] /= div
    for (let r = 0; r < n; r++) {
      if (r === i) continue
      const f = M[r][i]
      for (let j = i; j <= n; j++) M[r][j] -= f * M[i][j]
    }
  }
  return M.map(r => r[n])
}

// Compute x^T A^{-1} x without explicitly inverting A by solving A z = x
export function quadFormInv(A: number[][], x: number[]): number {
  const z = solveLinear(A, x)
  let s = 0
  for (let i = 0; i < x.length; i++) s += x[i] * z[i]
  return s
}

export function theta(state: OnlineState): number[] {
  return solveLinear(state.A, state.b)
}

export function updateOnline(state: OnlineState, x: number[], reward: number): OnlineState {
  const d = x.length
  const A = clone2D(state.A)
  const b = state.b.slice()
  for (let i = 0; i < d; i++) {
    b[i] += x[i] * reward
    for (let j = 0; j < d; j++) {
      A[i][j] += x[i] * x[j]
    }
  }
  return { ...state, A, b }
}

export function ucbScore(state: OnlineState, x: number[], alpha = 1.2): { mean: number; ucb: number; var: number } {
  const th = theta(state)
  let mean = 0
  for (let i = 0; i < x.length; i++) mean += th[i] * x[i]
  const v = Math.max(1e-8, quadFormInv(state.A, x))
  const u = mean + alpha * Math.sqrt(v)
  return { mean, ucb: u, var: v }
}

