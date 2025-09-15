export type BrandKey = 'norsari' | 'patagonia' | 'kingsford' | 'canopy'

export const brandTokens: Record<BrandKey, {
  name: string
  gradient: { start: string; end: string }
  accent: string
}> = {
  norsari: {
    name: 'NorSari',
    gradient: { start: '#0369a1', end: '#4338ca' },
    accent: '#38bdf8',
  },
  patagonia: {
    name: 'Patagonia',
    gradient: { start: '#0f172a', end: '#0891b2' },
    accent: '#06b6d4',
  },
  kingsford: {
    name: 'Kingsford',
    gradient: { start: '#ea580c', end: '#b91c1c' },
    accent: '#fb923c',
  },
  canopy: {
    name: 'Canopy',
    gradient: { start: '#065f46', end: '#059669' },
    accent: '#10b981',
  }
}

// Typography scale (semantic)
export const typeScale = {
  display: { size: 'text-display', weight: 'font-extrabold' },
  headline: { size: 'text-headline', weight: 'font-bold' },
  title: { size: 'text-title', weight: 'font-semibold' },
  body: { size: 'text-body', weight: 'font-normal' },
  caption: { size: 'text-caption', weight: 'font-medium' },
}

// Motion + elevation tokens
export const motion = {
  duration: { fast: 150, normal: 300, slow: 600 },
  easing: { standard: 'ease-in-out', emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
}

export const elevation = {
  surface: 'shadow',
  elevated: 'shadow-elevated',
  glow: 'shadow-glow',
}
