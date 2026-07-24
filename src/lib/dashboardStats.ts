import type { Decision, TransactionRecord } from '@/types/transaction'

export interface HourBucket {
  hour: number
  valid: number
  fraud: number
  unassigned: number
}

export interface DecisionBucketCounts {
  valid: number
  fraud: number
  unassigned: number
}

// Simplificación de UI: BLUE (hoy un tipo de acción) se trata como "todavía sin
// asignar/resolver" y YELLOW se suma a ese mismo balde para no fragmentar el
// gráfico en más de 3 series. No implica un cambio al modelo de Decision real.
function bucketFor(decision: Decision): keyof DecisionBucketCounts {
  if (decision === 'GREEN') return 'valid'
  if (decision === 'RED') return 'fraud'
  return 'unassigned'
}

export function hoyISO() {
  const ahora = new Date()
  const offset = ahora.getTimezoneOffset()
  return new Date(ahora.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function unusualRecords(records: TransactionRecord[]): TransactionRecord[] {
  return records
    .filter((r) => r.decision !== 'GREEN')
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export function countByBucket(records: TransactionRecord[]): DecisionBucketCounts {
  const counts: DecisionBucketCounts = { valid: 0, fraud: 0, unassigned: 0 }
  for (const r of records) counts[bucketFor(r.decision)]++
  return counts
}

export function groupByHour(records: TransactionRecord[]): HourBucket[] {
  const porHora = new Map<number, HourBucket>()

  for (const r of records) {
    const hour = new Date(r.fecha).getHours()
    if (!porHora.has(hour)) porHora.set(hour, { hour, valid: 0, fraud: 0, unassigned: 0 })
    const bucket = porHora.get(hour)!
    bucket[bucketFor(r.decision)]++
  }

  return [...porHora.values()].sort((a, b) => a.hour - b.hour)
}
