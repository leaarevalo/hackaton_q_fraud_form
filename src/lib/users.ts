import { ref } from 'vue'

const SALDOS_KEY = 'fraud-harness:saldos'
const USUARIO_ACTUAL_KEY = 'fraud-harness:usuarioActual'

export interface DemoUser {
  id: string
  nombre: string
  email: string
  iniciales: string
  ip: string
  fingerprint: string
  // Fixture de riesgo: harness cheat para disparar de forma determinística
  // la regla de fraude asociada a este destinatario en la demo (ver CLAUDE.md,
  // "falsear identidad" ya es parte del harness). No modela un dato real.
  fixture: {
    senderAccountAgeMinutes: number
    deviceAssociatedAccountsCount: number
    deviceIsNewForUser: boolean
  }
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'usr_logueado1',
    nombre: 'Juan Soto',
    email: 'juan.soto@qurable.com',
    iniciales: 'JS',
    ip: '190.10.20.30',
    fingerprint: 'fp_juan_soto',
    fixture: { senderAccountAgeMinutes: 129600, deviceAssociatedAccountsCount: 1, deviceIsNewForUser: false },
  },
  {
    id: 'usr_ana1',
    nombre: 'Ana Torres',
    email: 'ana.torres@qurable.com',
    iniciales: 'AT',
    ip: '181.44.12.90',
    fingerprint: 'fp_ana_torres',
    fixture: { senderAccountAgeMinutes: 129600, deviceAssociatedAccountsCount: 1, deviceIsNewForUser: false },
  },
  {
    id: 'usr_beto1',
    nombre: 'Beto Fernández',
    email: 'beto.fernandez@qurable.com',
    iniciales: 'BF',
    ip: '200.45.12.5',
    fingerprint: 'fp_beto_fernandez',
    fixture: { senderAccountAgeMinutes: 30, deviceAssociatedAccountsCount: 1, deviceIsNewForUser: true },
  },
  {
    id: 'usr_carla1',
    nombre: 'Carla Ruiz',
    email: 'carla.ruiz@qurable.com',
    iniciales: 'CR',
    ip: '152.168.4.21',
    fingerprint: 'fp_carla_ruiz',
    fixture: { senderAccountAgeMinutes: 129600, deviceAssociatedAccountsCount: 5, deviceIsNewForUser: false },
  },
]

function cargarSaldos(): Record<string, number> {
  const raw = localStorage.getItem(SALDOS_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, number>
    } catch {
      // fall through to seed
    }
  }
  const seed: Record<string, number> = {}
  for (const u of DEMO_USERS) seed[u.id] = 10000
  localStorage.setItem(SALDOS_KEY, JSON.stringify(seed))
  return seed
}

const saldos = ref<Record<string, number>>(cargarSaldos())

function persistirSaldos() {
  localStorage.setItem(SALDOS_KEY, JSON.stringify(saldos.value))
}

export function getSaldo(userId: string): number {
  return saldos.value[userId] ?? 0
}

export function transferPoints(fromId: string, toId: string, amount: number) {
  saldos.value = {
    ...saldos.value,
    [fromId]: (saldos.value[fromId] ?? 0) - amount,
    [toId]: (saldos.value[toId] ?? 0) + amount,
  }
  persistirSaldos()
}

const usuarioActualId = ref<string>(localStorage.getItem(USUARIO_ACTUAL_KEY) ?? 'usr_logueado1')

export function setUsuarioActual(id: string) {
  usuarioActualId.value = id
  localStorage.setItem(USUARIO_ACTUAL_KEY, id)
}

export function getUser(id: string): DemoUser {
  return DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0]
}

// Los registros de seed (historial de ejemplo) usan ids tipo "usr_maria_gomez"
// que no están en DEMO_USERS: se formatean como nombre legible en vez de mostrar el id crudo.
export function nombreLegible(id: string): string {
  const demoUser = DEMO_USERS.find((u) => u.id === id)
  if (demoUser) return demoUser.nombre
  return id
    .replace(/^usr_/, '')
    .split('_')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}

export { saldos, usuarioActualId }
