<script setup lang="ts">
import { computed, ref } from 'vue'
import { clearHistory, records, seedHistory } from '@/lib/history'
import { countByBucket, groupByHour, hoyISO, unusualRecords } from '@/lib/dashboardStats'
import { BADGE_BY_DECISION } from '@/lib/chartColors'
import type { Decision } from '@/types/transaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import StatCard from '@/components/dashboard/StatCard.vue'
import HourlyActivityChart from '@/components/dashboard/HourlyActivityChart.vue'
import VerificationDonut from '@/components/dashboard/VerificationDonut.vue'
import AlertsList from '@/components/dashboard/AlertsList.vue'
import ReviewCasesTable from '@/components/dashboard/ReviewCasesTable.vue'

const fecha = ref(hoyISO())

const registrosDelDia = computed(() =>
  records.value.filter((r) => r.fecha.slice(0, 10) === fecha.value),
)

const alertasDelDia = computed(() => unusualRecords(registrosDelDia.value))
const bucketsPorHora = computed(() => groupByHour(registrosDelDia.value))
const conteoDelDia = computed(() => countByBucket(registrosDelDia.value))

const operacionLabel: Record<string, string> = {
  enviar: 'Enviar puntos',
  comprar: 'Comprar puntos',
}

const statsDelDia = computed(() => {
  const conteo: Record<Decision, number> = { GREEN: 0, YELLOW: 0, RED: 0, BLUE: 0 }
  for (const r of registrosDelDia.value) conteo[r.decision]++
  return conteo
})

function formatHora(fechaISO: string) {
  return new Date(fechaISO).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="mx-auto mt-8 flex max-w-6xl flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div class="flex flex-col gap-1.5">
        <Label for="fecha-filtro">Fecha</Label>
        <Input id="fecha-filtro" v-model="fecha" type="date" class="w-auto" />
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="seedHistory">Cargar datos de ejemplo</Button>
        <Button variant="ghost" size="sm" @click="clearHistory">Limpiar historial</Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Historial de transacciones</CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
            Total: {{ registrosDelDia.length }}
          </span>
          <span
            v-for="(count, decision) in statsDelDia"
            :key="decision"
            class="rounded-full px-3 py-1 text-sm font-semibold"
            :class="BADGE_BY_DECISION[decision]"
          >
            {{ decision }}: {{ count }}
          </span>
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
                  :class="BADGE_BY_DECISION[r.decision]"
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

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <StatCard label="Transacciones totales" :value="registrosDelDia.length" />
          <StatCard label="Transacciones inusuales" :value="alertasDelDia.length" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones por hora</CardTitle>
        </CardHeader>
        <CardContent>
          <HourlyActivityChart :buckets="bucketsPorHora" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <VerificationDonut
            :valid="conteoDelDia.valid"
            :unassigned="conteoDelDia.unassigned"
            :fraud="conteoDelDia.fraud"
          />
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Alertas de transacciones inusuales</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertsList :records="alertasDelDia" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Casos con reglas activadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewCasesTable :records="alertasDelDia" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
