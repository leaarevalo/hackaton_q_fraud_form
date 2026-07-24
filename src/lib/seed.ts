import type { Decision, OperationType, TransactionRecord } from '@/types/transaction'

const OPERACIONES: OperationType[] = ['enviar', 'pedir', 'comprar']

const NOMBRES = [
  'Juan Pérez',
  'María Gómez',
  'Carlos Ruiz',
  'Ana Torres',
  'Lucía Fernández',
  'Diego Sosa',
  'Valentina Díaz',
  'Martín López',
]

const REGLAS_POR_DECISION: Record<Decision, string[]> = {
  GREEN: [],
  YELLOW: ['monto_elevado'],
  RED: ['monto_alto', 'compra_grande'],
  BLUE: ['multi_cuenta_dispositivo', 'cambio_ubicacion'],
}

const MOTIVO_POR_DECISION: Record<Decision, string> = {
  GREEN: 'Sin señales de riesgo detectadas.',
  YELLOW: 'La cantidad de puntos es inusualmente alta para este tipo de operación.',
  RED: 'La cantidad de puntos supera el umbral permitido en una sola operación.',
  BLUE: 'Múltiples cuentas asociadas al mismo dispositivo en poco tiempo.',
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

export function generarSeed(dias = 7, porDia = 5): TransactionRecord[] {
  const registros: TransactionRecord[] = []
  const ahora = new Date()

  for (let d = 0; d < dias; d++) {
    for (let i = 0; i < porDia; i++) {
      const decision = elegir(DECISIONES)
      const operacion = elegir(OPERACIONES)
      const fecha = new Date(ahora)
      fecha.setDate(fecha.getDate() - d)
      fecha.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))

      registros.push({
        id: crypto.randomUUID(),
        fecha: fecha.toISOString(),
        operacion,
        contraparte: operacion === 'comprar' ? null : elegir(NOMBRES),
        cantidad: cantidadPara(decision),
        decision,
        reglas: REGLAS_POR_DECISION[decision],
        motivo: MOTIVO_POR_DECISION[decision],
      })
    }
  }

  return registros
}
