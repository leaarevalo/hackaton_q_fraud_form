import type { TransactionRequest, TransactionResponse } from '../types/transaction'

// Punto de reemplazo: cuando exista el motor real, cambiar el cuerpo de esta
// función por un fetch a POST /v1/transactions con este mismo contrato.
export async function evaluarTransaccion(
  req: TransactionRequest,
): Promise<TransactionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const reglas: string[] = []
  let decision: TransactionResponse['decision'] = 'GREEN'
  let motivo = 'Sin señales de riesgo detectadas.'

  if (req.cantidad >= 10000) {
    reglas.push('monto_alto')
    decision = 'RED'
    motivo = 'La cantidad de puntos supera el umbral permitido en una sola operación.'
  } else if (req.cantidad >= 1000) {
    reglas.push('monto_elevado')
    decision = 'YELLOW'
    motivo = 'La cantidad de puntos es inusualmente alta para este tipo de operación.'
  }

  if (req.operacion === 'comprar' && req.cantidad >= 5000) {
    reglas.push('compra_grande')
    decision = decision === 'RED' ? 'RED' : 'YELLOW'
    motivo = 'Compra de puntos por un monto grande.'
  }

  return { decision, reglas, motivo }
}
