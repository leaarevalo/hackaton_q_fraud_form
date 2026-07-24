<script setup lang="ts">
import { computed } from 'vue'
import { User } from '@lucide/vue'
import type { TransactionRecord } from '@/types/transaction'
import { BADGE_BY_DECISION } from '@/lib/chartColors'

const props = defineProps<{
  records: TransactionRecord[]
}>()

const operacionLabel: Record<string, string> = {
  enviar: 'Enviar puntos',
}

const alertas = computed(() => props.records.slice(0, 8))

function textoAlerta(r: TransactionRecord) {
  return `${operacionLabel[r.operacion] ?? r.operacion} de ${r.cantidad.toLocaleString('es-AR')} — ${r.motivo}`
}
</script>

<template>
  <ul class="flex flex-col gap-2">
    <li v-if="alertas.length === 0" class="text-sm text-muted-foreground">
      No hay alertas por el momento.
    </li>
    <li
      v-for="r in alertas"
      :key="r.id"
      class="flex items-start gap-3 rounded-lg bg-secondary px-3 py-2"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-full"
        :class="BADGE_BY_DECISION[r.decision]"
      >
        <User class="size-4" />
      </span>
      <span class="text-sm">{{ textoAlerta(r) }}</span>
    </li>
  </ul>
</template>
