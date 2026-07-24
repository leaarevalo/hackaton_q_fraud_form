import { ref } from 'vue'
import type { TransactionRecord, TransactionRequest, TransactionResponse } from '@/types/transaction'
import { generarSeed } from '@/lib/seed'

const STORAGE_KEY = 'fraud-harness:historial'

function cargarInicial(): TransactionRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as TransactionRecord[]
  } catch {
    return []
  }
}

const records = ref<TransactionRecord[]>(cargarInicial())

function persistir() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value))
}

export function addRecord(
  req: TransactionRequest,
  res: TransactionResponse,
  estado: 'aprobado' | 'pendiente' = 'aprobado',
) {
  const record: TransactionRecord = {
    ...req,
    ...res,
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    estado,
  }
  records.value = [record, ...records.value]
  persistir()
  return record
}

export function aprobarRecord(id: string) {
  records.value = records.value.map((r) => (r.id === id ? { ...r, estado: 'aprobado' } : r))
  persistir()
}

export function seedHistory() {
  records.value = [...generarSeed(), ...records.value]
  persistir()
}

export function clearHistory() {
  records.value = []
  persistir()
}

export { records }
