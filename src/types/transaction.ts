export type OperationType = 'enviar'

export type Decision = 'GREEN' | 'YELLOW' | 'RED' | 'BLUE'

export type RecommendedAction = 'APPROVE' | 'APPROVE_WITH_WARNING' | 'REJECT' | 'MANUAL_REVIEW'

export interface RuleAction {
  type: string
  value?: string | number | boolean
  reason?: string
}

export interface MatchedRule {
  id: string
  scoreAdded: number
  actions: RuleAction[]
}

export interface AiAnalysis {
  riskLevel?: Decision
  recommendedAction?: RecommendedAction
  reasoning?: string
}

export interface TransactionRequest {
  operacion: OperationType
  contraparte: string
  cantidad: number
  cuentaOrigen: string
  ipOrigen: string
  ipDestino: string
  fingerprint: string
  senderAccountAgeMinutes?: number
  deviceAssociatedAccountsCount?: number
  deviceIsNewForUser?: boolean
}

export interface TransactionResponse {
  transactionId: string
  decision: Decision
  riskScore: number
  recommendedAction: RecommendedAction
  aiInvoked: boolean
  reglas: string[]
  matchedRules: MatchedRule[]
  motivo: string
  aiAnalysis: AiAnalysis | null
  auditId: string
}

export interface TransactionRecord extends TransactionRequest, TransactionResponse {
  id: string
  fecha: string // ISO
  estado?: 'aprobado' | 'pendiente'
}
