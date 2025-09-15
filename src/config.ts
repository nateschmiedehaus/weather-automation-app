export type Mode = 'demo' | 'prod'

const isDemo = (() => {
  try { return !!(import.meta as any).env?.VITE_DEMO } catch { return true }
})()

export const config: { mode: Mode } = {
  mode: isDemo ? 'demo' : 'prod',
}
