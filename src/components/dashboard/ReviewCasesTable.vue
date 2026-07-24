<script setup lang="ts">
import { computed } from 'vue'
import type { TransactionRecord } from '@/types/transaction'
import { BADGE_BY_DECISION } from '@/lib/chartColors'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  records: TransactionRecord[]
}>()

const operacionLabel: Record<string, string> = {
  enviar: 'Enviar puntos',
}

// "Casos con reglas activadas" reemplaza la tabla "Ongoing investigation" del
// mockup: no hay banco, cliente ni agente asignado en el modelo real, así que
// se muestran solo los registros con reglas disparadas y sus datos reales.
const casos = computed(() => props.records.filter((r) => r.reglas.length > 0).slice(0, 8))

function formatHora(fechaISO: string) {
  return new Date(fechaISO).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Hora</TableHead>
        <TableHead>Operación</TableHead>
        <TableHead>Contraparte</TableHead>
        <TableHead>Decisión</TableHead>
        <TableHead>Reglas</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableEmpty v-if="casos.length === 0" :colspan="5">
        No hay casos con reglas activadas.
      </TableEmpty>
      <TableRow v-for="r in casos" :key="r.id">
        <TableCell>{{ formatHora(r.fecha) }}</TableCell>
        <TableCell>{{ operacionLabel[r.operacion] ?? r.operacion }}</TableCell>
        <TableCell>{{ r.contraparte ?? '—' }}</TableCell>
        <TableCell>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="BADGE_BY_DECISION[r.decision]"
          >
            {{ r.decision }}
          </span>
        </TableCell>
        <TableCell>{{ r.reglas.join(', ') }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
