import { hashString, mulberry32 } from './rng'

export type USState = { code: string; name: string; lat: number; lng: number; region: keyof typeof REGIONS; climate: 'marine_west'|'mediterranean'|'desert'|'humid_subtropical'|'humid_continental'|'mountain'; coastal: boolean }

// Group states by broad region; derive approximate centroids procedurally to avoid hardcoding per-state coords
const REGIONS: Record<string, { center: [number, number]; spread: [number, number]; states: string[] }> = {
  WEST: { center: [39, -119], spread: [6, 8], states: ['WA','OR','CA','NV','ID','UT','AZ','NM','CO','MT','WY','AK','HI'] },
  MIDWEST: { center: [41, -93], spread: [5, 6], states: ['ND','SD','NE','KS','MN','IA','MO','WI','IL','MI','IN','OH'] },
  SOUTH: { center: [33, -86], spread: [5, 7], states: ['OK','TX','AR','LA','MS','AL','GA','FL','SC','NC','TN','KY','VA','WV'] },
  NORTHEAST: { center: [42, -73], spread: [3, 4], states: ['PA','NY','NJ','CT','RI','MA','VT','NH','ME','DC','MD','DE'] },
}

const STATE_NAMES: Record<string,string> = {
  AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas', CA:'California', CO:'Colorado', CT:'Connecticut', DC:'District of Columbia',
  DE:'Delaware', FL:'Florida', GA:'Georgia', HI:'Hawaii', IA:'Iowa', ID:'Idaho', IL:'Illinois', IN:'Indiana', KS:'Kansas', KY:'Kentucky',
  LA:'Louisiana', MA:'Massachusetts', MD:'Maryland', ME:'Maine', MI:'Michigan', MN:'Minnesota', MO:'Missouri', MS:'Mississippi', MT:'Montana',
  NC:'North Carolina', ND:'North Dakota', NE:'Nebraska', NH:'New Hampshire', NJ:'New Jersey', NM:'New Mexico', NV:'Nevada', NY:'New York',
  OH:'Ohio', OK:'Oklahoma', OR:'Oregon', PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina', SD:'South Dakota', TN:'Tennessee',
  TX:'Texas', UT:'Utah', VA:'Virginia', VT:'Vermont', WA:'Washington', WI:'Wisconsin', WV:'West Virginia', WY:'Wyoming'
}

function deriveClimate(code: string, region: keyof typeof REGIONS): USState['climate'] {
  const desert = ['AZ','NV','NM']
  const mediterranean = ['CA','OR'] // coastal W coast simplified
  const mountain = ['CO','WY','MT','UT','ID']
  if (desert.includes(code)) return 'desert'
  if (mountain.includes(code)) return 'mountain'
  if (mediterranean.includes(code)) return 'mediterranean'
  if (region==='WEST') return 'marine_west'
  if (region==='SOUTH') return 'humid_subtropical'
  if (region==='NORTHEAST' || region==='MIDWEST') return 'humid_continental'
  return 'humid_continental'
}

function isCoastal(code: string): boolean {
  const coastalStates = ['WA','OR','CA','AK','HI','TX','LA','MS','AL','FL','GA','SC','NC','VA','MD','DE','NJ','NY','CT','RI','MA','NH','ME']
  return coastalStates.includes(code)
}

export function getUSStates(): USState[] {
  const all: USState[] = []
  for (const [region, cfg] of Object.entries(REGIONS)) {
    for (const code of cfg.states) {
      const name = STATE_NAMES[code] || code
      const seed = mulberry32(hashString(`${region}-${code}`))
      const lat = cfg.center[0] + (seed() - 0.5) * cfg.spread[0]
      const lng = cfg.center[1] + (seed() - 0.5) * cfg.spread[1]
      const climate = deriveClimate(code, region as keyof typeof REGIONS)
      const coastal = isCoastal(code)
      all.push({ code, name, lat, lng, region: region as keyof typeof REGIONS, climate, coastal })
    }
  }
  return all
}
