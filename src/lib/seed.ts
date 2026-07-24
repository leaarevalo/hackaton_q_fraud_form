import type { Decision, MatchedRule, RecommendedAction, TransactionRecord } from '@/types/transaction'

const NOMBRES = [
  'usr_juan_perez',
  'usr_maria_gomez',
  'usr_carlos_ruiz',
  'usr_ana_torres',
  'usr_lucia_fernandez',
  'usr_diego_sosa',
  'usr_valentina_diaz',
  'usr_martin_lopez',
]

const IPS = ['181.44.12.90', '200.45.12.5', '190.10.20.30', '152.168.4.21']

const REGLAS_POR_DECISION: Record<Decision, MatchedRule[]> = {
  GREEN: [],
  YELLOW: [
    {
      id: 'NEW_ACCOUNT_FAST_TRANSFER',
      scoreAdded: 35,
      actions: [{ type: 'SET_SCORE', value: 35 }, { type: 'FLAG', reason: 'Transferencia de alto monto desde cuenta recién creada' }],
    },
  ],
  RED: [
    {
      id: 'MULTIPLE_ACCOUNTS_SAME_DEVICE_TRANSFER',
      scoreAdded: 60,
      actions: [{ type: 'SET_RISK', value: 'RED' }, { type: 'LOG' }, { type: 'NOTIFY_SECURITY' }],
    },
  ],
  BLUE: [
    {
      id: 'CIRCULAR_OR_FARMING_NETWORK_DETECTED',
      scoreAdded: 50,
      actions: [{ type: 'SET_RISK', value: 'BLUE' }, { type: 'CALL_AI' }],
    },
  ],
}

const MOTIVO_POR_DECISION: Record<Decision, string> = {
  GREEN: 'Sin señales de riesgo detectadas.',
  YELLOW: 'Transferencia de alto monto desde cuenta recién creada.',
  RED: 'Múltiples cuentas asociadas al mismo dispositivo.',
  BLUE: 'Posible red de acaparamiento o transferencia circular detectada.',
}

const ACCION_POR_DECISION: Record<Decision, RecommendedAction> = {
  GREEN: 'APPROVE',
  YELLOW: 'APPROVE_WITH_WARNING',
  RED: 'REJECT',
  BLUE: 'MANUAL_REVIEW',
}

const DECISIONES: Decision[] = ['GREEN', 'GREEN', 'GREEN', 'YELLOW', 'YELLOW', 'RED', 'BLUE']

function elegir<T>(opciones: T[]): T {
  return opciones[Math.floor(Math.random() * opciones.length)]
}

function cantidadPara(decision: Decision): number {
  switch (decision) {
    case 'RED':
      return 10000 + Math.floor(Math.random() * 15000)
    case 'YELLOW':
      return 1000 + Math.floor(Math.random() * 8000)
    case 'BLUE':
      return 100 + Math.floor(Math.random() * 900)
    default:
      return 10 + Math.floor(Math.random() * 900)
  }
}

function riskScorePara(decision: Decision): number {
  switch (decision) {
    case 'RED':
      return 60 + Math.floor(Math.random() * 40)
    case 'YELLOW':
      return 30 + Math.floor(Math.random() * 30)
    case 'BLUE':
      return 50 + Math.floor(Math.random() * 20)
    default:
      return Math.floor(Math.random() * 30)
  }
}

export function generarSeed(dias = 7, porDia = 5): TransactionRecord[] {
  const registros: TransactionRecord[] = []
  const ahora = new Date()

  for (let d = 0; d < dias; d++) {
    for (let i = 0; i < porDia; i++) {
      const decision = elegir(DECISIONES)
      const fecha = new Date(ahora)
      fecha.setDate(fecha.getDate() - d)
      fecha.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))

      const matchedRules = REGLAS_POR_DECISION[decision]
      const aiInvoked = decision === 'YELLOW' || decision === 'BLUE'

      registros.push({
        id: crypto.randomUUID(),
        fecha: fecha.toISOString(),
        transactionId: crypto.randomUUID(),
        operacion: 'enviar',
        contraparte: elegir(NOMBRES),
        cuentaOrigen: elegir(NOMBRES),
        ipOrigen: elegir(IPS),
        ipDestino: elegir(IPS),
        fingerprint: `fp_seed_${Math.floor(Math.random() * 1000)}`,
        cantidad: cantidadPara(decision),
        decision,
        riskScore: riskScorePara(decision),
        recommendedAction: ACCION_POR_DECISION[decision],
        aiInvoked,
        reglas: matchedRules.map((r) => r.id),
        matchedRules,
        motivo: MOTIVO_POR_DECISION[decision],
        aiAnalysis: aiInvoked ? { riskLevel: decision, recommendedAction: ACCION_POR_DECISION[decision], reasoning: MOTIVO_POR_DECISION[decision] } : null,
        auditId: crypto.randomUUID(),
      })
    }
  }

  return registros
}
