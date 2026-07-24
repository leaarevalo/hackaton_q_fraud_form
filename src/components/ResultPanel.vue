<script setup lang="ts">
import type { TransactionResponse } from '@/types/transaction'
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  result: TransactionResponse | null
  loading: boolean
}>()

const badgeByDecision: Record<TransactionResponse['decision'], string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  YELLOW: 'bg-amber-100 text-amber-800',
  RED: 'bg-red-100 text-red-800',
  BLUE: 'bg-blue-100 text-blue-800',
}
</script>

<template>
  <Card class="mt-6">
    <CardContent>
      <p v-if="loading" class="text-muted-foreground text-sm">Evaluando…</p>
      <template v-else-if="result">
        <span
          class="inline-block rounded-full px-3 py-1 text-sm font-semibold"
          :class="badgeByDecision[result.decision]"
        >
          {{ result.decision }}
        </span>
        <p class="mt-2 text-sm">{{ result.motivo }}</p>
        <ul v-if="result.reglas.length" class="text-muted-foreground mt-2 list-inside list-disc text-sm">
          <li v-for="regla in result.reglas" :key="regla">{{ regla }}</li>
        </ul>
      </template>
      <p v-else class="text-muted-foreground text-sm">
        Todavía no se operó ninguna transacción.
      </p>
    </CardContent>
  </Card>
</template>
