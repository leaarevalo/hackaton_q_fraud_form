export type OperationType = 'enviar' | 'pedir' | 'comprar'

export type Decision = 'GREEN' | 'YELLOW' | 'RED' | 'BLUE'

export interface TransactionRequest {
  operacion: OperationType
  contraparte: string | null
  cantidad: number
}

export interface TransactionResponse {
  decision: Decision
  reglas: string[]
  motivo: string
}

export interface TransactionRecord extends TransactionRequest, TransactionResponse {
  id: string
  fecha: string // ISO
}
