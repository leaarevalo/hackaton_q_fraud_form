<script setup lang="ts">
import { computed, ref } from 'vue'
import { evaluarTransaccion } from '@/api/transactions'
import { addRecord, aprobarRecord, records } from '@/lib/history'
import { DEMO_USERS, getUser, saldos, transferPoints, usuarioActualId } from '@/lib/users'
import type { TransactionRecord, TransactionRequest, TransactionResponse } from '@/types/transaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckIcon, XIcon } from '@lucide/vue'

const usuarioActual = computed(() => getUser(usuarioActualId.value))
const destinatarios = computed(() => DEMO_USERS.filter((u) => u.id !== usuarioActual.value.id))

const contraparteId = ref(destinatarios.value[0]?.id ?? '')
const cantidad = ref<number | undefined>(undefined)
const mensaje = ref('')

const result = ref<TransactionResponse | null>(null)
const lastRecordId = ref<string | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const saldoActual = computed(() => {
  void saldos.value
  return saldos.value[usuarioActual.value.id] ?? 0
})

const historialUsuario = computed<TransactionRecord[]>(() =>
  records.value.filter((r) => r.cuentaOrigen === usuarioActual.value.id).slice(0, 8),
)

function limitarCantidad() {
  if (cantidad.value !== undefined && cantidad.value > saldoActual.value) {
    cantidad.value = saldoActual.value
  }
}

async function operar() {
  const destinatario = getUser(contraparteId.value)
  const monto = cantidad.value ?? 0
  loading.value = true
  result.value = null
  lastRecordId.value = null
  error.value = null

  if (monto <= 0 || monto > saldoActual.value) {
    error.value = `El monto debe ser mayor a 0 y no superar el saldo disponible (${saldoActual.value.toLocaleString('es-AR')} pts).`
    loading.value = false
    return
  }

  try {
    // Los campos de fixture (edad de cuenta, dispositivos asociados) vienen del
    // perfil harness del destinatario elegido, no de un dato real del emisor:
    // es lo que permite disparar de forma determinística cada caso de fraude
    // de la demo (ver src/lib/users.ts).
    const req: TransactionRequest = {
      operacion: 'enviar',
      contraparte: destinatario.id,
      cantidad: monto,
      cuentaOrigen: usuarioActual.value.id,
      ipOrigen: usuarioActual.value.ip,
      ipDestino: destinatario.ip,
      fingerprint: usuarioActual.value.fingerprint,
      senderAccountAgeMinutes: destinatario.fixture.senderAccountAgeMinutes,
      deviceAssociatedAccountsCount: destinatario.fixture.deviceAssociatedAccountsCount,
      deviceIsNewForUser: destinatario.fixture.deviceIsNewForUser,
    }
    result.value = await evaluarTransaccion(req)

    const estado = result.value.decision === 'RED' ? 'pendiente' : 'aprobado'
    const record = addRecord(req, result.value, estado)
    lastRecordId.value = record.id

    if (estado === 'aprobado') {
      transferPoints(req.cuentaOrigen, req.contraparte, monto)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error inesperado al evaluar la transacción.'
  } finally {
    loading.value = false
  }
}

const lastRecordEstado = computed(() => records.value.find((r) => r.id === lastRecordId.value)?.estado)

function aprobarManualmente() {
  if (!lastRecordId.value || !result.value) return
  const record = records.value.find((r) => r.id === lastRecordId.value)
  if (!record) return
  transferPoints(record.cuentaOrigen, record.contraparte, record.cantidad)
  aprobarRecord(record.id)
}
</script>

<template>
  <Card class="mx-auto mt-8 max-w-md">
    <CardHeader>
      <CardTitle>Transferir Puntos</CardTitle>
    </CardHeader>

    <CardContent class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <Label for="destinatario">Destinatario</Label>
        <Select v-model="contraparteId">
          <SelectTrigger id="destinatario" class="w-full">
            <SelectValue placeholder="Elegir destinatario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="u in destinatarios" :key="u.id" :value="u.id">
              {{ u.nombre }} — {{ u.email }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-baseline justify-between">
          <Label for="cantidad">Cantidad de Puntos</Label>
          <span class="text-xs text-muted-foreground">Max: {{ saldoActual.toLocaleString('es-AR') }}</span>
        </div>
        <Input
          id="cantidad"
          v-model.number="cantidad"
          type="number"
          min="1"
          :max="saldoActual"
          @input="limitarCantidad"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <Label for="mensaje">Mensaje Opcional</Label>
        <Textarea id="mensaje" v-model="mensaje" placeholder="Mensaje Opcional" />
      </div>

      <Button
        :disabled="loading"
        class="w-full bg-emerald-600 text-white hover:bg-emerald-700"
        @click="operar"
      >
        Enviar Puntos
      </Button>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div v-if="lastRecordEstado === 'pendiente'" class="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p class="text-sm text-amber-800">
          Transferencia marcada como riesgo alto: queda pendiente de revisión manual, el saldo no se movió.
        </p>
        <Button size="sm" class="mt-2" variant="outline" @click="aprobarManualmente">
          Aprobar manualmente
        </Button>
      </div>

      <div v-if="historialUsuario.length" class="flex flex-col gap-2 border-t border-border pt-4">
        <p class="text-sm font-medium">Historial reciente</p>
        <div
          v-for="r in historialUsuario"
          :key="r.id"
          class="flex items-center justify-between text-sm"
        >
          <span class="flex items-center gap-2">
            <CheckIcon v-if="r.estado !== 'pendiente'" class="size-4 text-emerald-600" />
            <TooltipProvider v-else :delay-duration="150">
              <Tooltip>
                <TooltipTrigger as-child>
                  <XIcon class="size-4 cursor-default text-red-600" />
                </TooltipTrigger>
                <TooltipContent>
                  Transferencia bloqueada: se detectó un intento de fraude.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            Enviar a {{ getUser(r.contraparte).nombre }}
          </span>
          <span class="font-medium text-foreground">
            -{{ r.cantidad.toLocaleString('es-AR') }} pts
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
