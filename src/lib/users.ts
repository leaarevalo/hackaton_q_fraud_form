import { ref } from "vue";

const SALDOS_KEY = "fraud-harness:saldos";
const USUARIO_ACTUAL_KEY = "fraud-harness:usuarioActual";

export interface DemoUser {
  id: string;
  nombre: string;
  email: string;
  iniciales: string;
  ip: string;
  fingerprint: string;
  // Fixture de riesgo: harness cheat para disparar de forma determinística
  // la regla de fraude asociada a este destinatario en la demo (ver CLAUDE.md,
  // "falsear identidad" ya es parte del harness). No modela un dato real.
  fixture: {
    senderAccountAgeMinutes: number;
    deviceAssociatedAccountsCount: number;
    deviceIsNewForUser: boolean;
  };
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "usr_logueado1",
    nombre: "Cucchi Santiago",
    email: "scucchi@qurable.com",
    iniciales: "CS",
    ip: "190.10.20.30",
    fingerprint: "fp_cucchi_Santiago",
    fixture: {
      senderAccountAgeMinutes: 129600,
      deviceAssociatedAccountsCount: 1,
      deviceIsNewForUser: false,
    },
  },
  {
    id: "usr_ana1",
    nombre: "Leandro Arevalo",
    email: "larevalo@qurable.com",
    iniciales: "LA",
    ip: "181.44.12.90",
    fingerprint: "fp_Leandro_Arevalo",
    fixture: {
      senderAccountAgeMinutes: 129600,
      deviceAssociatedAccountsCount: 1,
      deviceIsNewForUser: false,
    },
  },
  {
    id: "usr_beto1",
    nombre: "Salvador Woinilowicz",
    email: "swoinilowicz@qurable.com",
    iniciales: "SW",
    ip: "200.45.12.5",
    fingerprint: "fp_salvador_woinilowicz",
    fixture: {
      senderAccountAgeMinutes: 30,
      deviceAssociatedAccountsCount: 1,
      deviceIsNewForUser: true,
    },
  },
  {
    id: "usr_carla1",
    nombre: "Federico Karra",
    email: "fkarra@qurable.com",
    iniciales: "FK",
    ip: "152.168.4.21",
    fingerprint: "fp_federico_karra",
    fixture: {
      senderAccountAgeMinutes: 129600,
      deviceAssociatedAccountsCount: 5,
      deviceIsNewForUser: false,
    },
  },
];

function cargarSaldos(): Record<string, number> {
  const raw = localStorage.getItem(SALDOS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, number>;
    } catch {
      // fall through to seed
    }
  }
  const seed: Record<string, number> = {};
  for (const u of DEMO_USERS) seed[u.id] = 1000000;
  localStorage.setItem(SALDOS_KEY, JSON.stringify(seed));
  return seed;
}

const saldos = ref<Record<string, number>>(cargarSaldos());

function persistirSaldos() {
  localStorage.setItem(SALDOS_KEY, JSON.stringify(saldos.value));
}

export function getSaldo(userId: string): number {
  return saldos.value[userId] ?? 0;
}

export function transferPoints(fromId: string, toId: string, amount: number) {
  saldos.value = {
    ...saldos.value,
    [fromId]: (saldos.value[fromId] ?? 0) - amount,
    [toId]: (saldos.value[toId] ?? 0) + amount,
  };
  persistirSaldos();
}

const usuarioActualId = ref<string>(
  localStorage.getItem(USUARIO_ACTUAL_KEY) ?? "usr_logueado1",
);

export function setUsuarioActual(id: string) {
  usuarioActualId.value = id;
  localStorage.setItem(USUARIO_ACTUAL_KEY, id);
}

export function getUser(id: string): DemoUser {
  return DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
}

// Los registros de seed (historial de ejemplo) usan ids tipo "usr_maria_gomez"
// que no están en DEMO_USERS: se formatean como nombre legible en vez de mostrar el id crudo.
export function nombreLegible(id: string): string {
  const demoUser = DEMO_USERS.find((u) => u.id === id);
  if (demoUser) return demoUser.nombre;
  return id
    .replace(/^usr_/, "")
    .split("_")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

export { saldos, usuarioActualId };
