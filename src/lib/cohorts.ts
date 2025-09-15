import { hashString, mulberry32 } from './rng'
import type { USState } from './geo'

export type Metro = { id: string; name: string; lat: number; lng: number; tags: string[] }
export type Cell = { id: string; lat: number; lng: number; tags: string[] }

export function getMetrosForState(state: USState): Metro[] {
  // Generate 3–6 metros per state deterministically
  const count = Math.max(3, Math.min(6, Math.floor((state.name.length % 6) + 3)))
  const out: Metro[] = []
  const baseSeed = hashString(`metro:${state.code}:${state.lat}:${state.lng}`)
  for (let i=0;i<count;i++) {
    const rnd = mulberry32(baseSeed + i)
    const dLat = (rnd()-0.5) * 1.8
    const dLng = (rnd()-0.5) * 2.4
    const lat = state.lat + dLat
    const lng = state.lng + dLng
    const id = `${state.code}-M${i+1}`
    const adjectives = ['Central','North','South','East','West','Heights','Valley','Coastal','Inland']
    const noun = ['Metro','Hub','Corridor','Basin','Plain','Ridge']
    const name = `${state.name.split(' ')[0]} ${adjectives[Math.floor(rnd()*adjectives.length)]} ${noun[Math.floor(rnd()*noun.length)]}`
    const tags:string[] = []
    if (state.coastal && rnd()>0.4) tags.push('coastal')
    if (state.climate==='mountain' && rnd()>0.4) tags.push('mountain')
    if (rnd()>0.6) tags.push('urban')
    if (rnd()>0.7) tags.push('inland')
    out.push({ id, name, lat, lng, tags })
  }
  return out
}

export function getCellsForMetro(metro: Metro): Cell[] {
  // Generate 3–5 small cells around metro centroid
  const count = 3 + (hashString(metro.id) % 3)
  const out: Cell[] = []
  const baseSeed = hashString(`cell:${metro.id}`)
  for (let i=0;i<count;i++) {
    const rnd = mulberry32(baseSeed + i)
    const dLat = (rnd()-0.5) * 0.6
    const dLng = (rnd()-0.5) * 0.6
    const id = `${metro.id}-C${i+1}`
    const tags:string[] = []
    if (rnd() > 0.5) {
      tags.push('urban')
    } else {
      tags.push('suburban')
    }
    out.push({ id, lat: metro.lat + dLat, lng: metro.lng + dLng, tags })
  }
  return out
}
