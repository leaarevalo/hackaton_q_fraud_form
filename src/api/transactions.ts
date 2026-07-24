import type { MatchedRule, TransactionRequest, TransactionResponse } from '../types/transaction'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000'
const TENANT_ID = 'qurable_loyalty'

export async function evaluarTransaccion(req: TransactionRequest): Promise<TransactionResponse> {
  const payload = {
    tenantId: TENANT_ID,
    scope: 'POINTS_TRANSFER',
    transaction: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      points: req.cantidad,
      currency: 'LOYALTY_PTS',
    },
    sender: {
      userId: req.cuentaOrigen,
      ip: req.ipOrigen,
      accountAgeMinutes: req.senderAccountAgeMinutes ?? 129600,
    },
    receiver: {
      userId: req.contraparte,
      ip: req.ipDestino,
    },
    device: {
      fingerprint: req.fingerprint,
      associatedAccountsCount: req.deviceAssociatedAccountsCount ?? 1,
      isNewForUser: req.deviceIsNewForUser ?? false,
      platform: 'Web',
    },
  }

  const res = await fetch(`${API_URL}/api/v1/fraud/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Error del motor de fraude (${res.status})`)
  }

  const data = await res.json()
  const matchedRules: MatchedRule[] = data.executionSummary.matchedRules ?? []
  const aiAnalysis = data.executionSummary.aiAnalysis ?? null

  return {
    transactionId: data.transactionId,
    decision: data.decision.riskLevel,
    riskScore: data.decision.riskScore,
    recommendedAction: data.decision.recommendedAction,
    aiInvoked: data.decision.aiInvoked,
    matchedRules,
    reglas: matchedRules.map((r) => r.id),
    motivo:
      aiAnalysis?.reasoning ??
      (matchedRules.length
        ? `Reglas activadas: ${matchedRules.map((r) => r.id).join(', ')}`
        : 'Sin señales de riesgo detectadas.'),
    aiAnalysis,
    auditId: data.auditId,
  }
}
