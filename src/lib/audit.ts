export type AuditEntry = {
  time: string
  category: string
  action: string
  multiplier: number
  staged?: number[]
  confidence: number
}

const auditStore: AuditEntry[] = []

export function addAudit(entry: AuditEntry) {
  auditStore.unshift(entry)
  if (auditStore.length > 100) auditStore.pop()
}

export function recentAudit(limit = 10): AuditEntry[] {
  return auditStore.slice(0, limit)
}

