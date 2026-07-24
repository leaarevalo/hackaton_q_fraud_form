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

export function addRecord(req: TransactionRequest, res: TransactionResponse) {
  const record: TransactionRecord = {
    ...req,
    ...res,
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
  }
  records.value = [record, ...records.value]
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
