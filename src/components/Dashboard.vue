<script setup lang="ts">
import { computed, ref } from 'vue'
import { clearHistory, records, seedHistory } from '@/lib/history'
import type { Decision } from '@/types/transaction'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function hoyISO() {
  const ahora = new Date()
  const offset = ahora.getTimezoneOffset()
  return new Date(ahora.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

const fecha = ref(hoyISO())

const registrosDelDia = computed(() =>
  records.value.filter((r) => r.fecha.slice(0, 10) === fecha.value),
)

const badgeByDecision: Record<Decision, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  YELLOW: 'bg-amber-100 text-amber-800',
  RED: 'bg-red-100 text-red-800',
  BLUE: 'bg-blue-100 text-blue-800',
}

const operacionLabel: Record<string, string> = {
  enviar: 'Enviar puntos',
  pedir: 'Pedir puntos',
  comprar: 'Comprar puntos',
}

const stats = computed(() => {
  const conteo: Record<Decision, number> = { GREEN: 0, YELLOW: 0, RED: 0, BLUE: 0 }
  for (const r of registrosDelDia.value) conteo[r.decision]++
  return conteo
})

function formatHora(fechaISO: string) {
  return new Date(fechaISO).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <Card class="mx-auto mt-8 max-w-3xl">
    <CardHeader>
      <CardTitle>Historial de transacciones</CardTitle>
      <CardAction class="flex gap-2">
        <Button variant="outline" size="sm" @click="seedHistory">Cargar datos de ejemplo</Button>
        <Button variant="ghost" size="sm" @click="clearHistory">Limpiar historial</Button>
      </CardAction>
    </CardHeader>

    <CardContent class="flex flex-col gap-4">
      <div class="flex items-end gap-4">
        <div class="flex flex-col gap-1.5">
          <Label for="fecha-filtro">Fecha</Label>
          <Input id="fecha-filtro" v-model="fecha" type="date" class="w-auto" />
        </div>

        <div class="flex flex-wrap gap-2 pb-1">
          <span class="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
            Total: {{ registrosDelDia.length }}
          </span>
          <span
            v-for="(count, decision) in stats"
            :key="decision"
            class="rounded-full px-3 py-1 text-sm font-semibold"
            :class="badgeByDecision[decision]"
          >
            {{ decision }}: {{ count }}
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Operación</TableHead>
            <TableHead>Contraparte</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Decisión</TableHead>
            <TableHead>Reglas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty v-if="registrosDelDia.length === 0" :colspan="6">
            No hay transacciones para esta fecha.
          </TableEmpty>
          <TableRow v-for="r in registrosDelDia" :key="r.id">
            <TableCell>{{ formatHora(r.fecha) }}</TableCell>
            <TableCell>{{ operacionLabel[r.operacion] }}</TableCell>
            <TableCell>{{ r.contraparte ?? '—' }}</TableCell>
            <TableCell>{{ r.cantidad }}</TableCell>
            <TableCell>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="badgeByDecision[r.decision]"
              >
                {{ r.decision }}
              </span>
            </TableCell>
            <TableCell>{{ r.reglas.join(', ') || '—' }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
