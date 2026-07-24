<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { CHART_COLOR_FRAUD, CHART_COLOR_UNASSIGNED, CHART_COLOR_VALID } from '@/lib/chartColors'

ChartJS.register(ArcElement, Legend, Tooltip)

const props = defineProps<{
  valid: number
  unassigned: number
  fraud: number
}>()

const data = computed(() => ({
  labels: ['Verificadas', 'Sin asignar', 'Confirmado fraude'],
  datasets: [
    {
      data: [props.valid, props.unassigned, props.fraud],
      backgroundColor: [CHART_COLOR_VALID, CHART_COLOR_UNASSIGNED, CHART_COLOR_FRAUD],
      borderWidth: 0,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="h-40 w-40">
      <Doughnut :data="data" :options="options" />
    </div>
    <div class="flex w-full flex-wrap justify-center gap-2 text-xs">
      <span class="rounded-full bg-teal-50 px-2 py-1 font-semibold text-teal-800">
        {{ valid }} verificadas
      </span>
      <span class="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
        {{ unassigned }} sin asignar
      </span>
      <span class="rounded-full bg-rose-50 px-2 py-1 font-semibold text-rose-800">
        {{ fraud }} fraude
      </span>
    </div>
  </div>
</template>
