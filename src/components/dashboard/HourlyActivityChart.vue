<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import type { HourBucket } from '@/lib/dashboardStats'
import {
  CHART_COLOR_FRAUD,
  CHART_COLOR_UNASSIGNED,
  CHART_COLOR_VALID,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from '@/lib/chartColors'

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip)

const props = defineProps<{
  buckets: HourBucket[]
}>()

const data = computed(() => ({
  labels: props.buckets.map((b) => `${String(b.hour).padStart(2, '0')}:00`),
  datasets: [
    {
      label: 'Válidas',
      data: props.buckets.map((b) => b.valid),
      backgroundColor: CHART_COLOR_VALID,
    },
    {
      label: 'Fraude',
      data: props.buckets.map((b) => b.fraud),
      backgroundColor: CHART_COLOR_FRAUD,
    },
    {
      label: 'Sin asignar',
      data: props.buckets.map((b) => b.unassigned),
      backgroundColor: CHART_COLOR_UNASSIGNED,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: CHART_TEXT_COLOR } },
  },
  scales: {
    x: { stacked: false, ticks: { color: CHART_TEXT_COLOR }, grid: { color: CHART_GRID_COLOR } },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, color: CHART_TEXT_COLOR },
      grid: { color: CHART_GRID_COLOR },
    },
  },
}
</script>

<template>
  <div class="h-64">
    <Bar v-if="buckets.length" :data="data" :options="options" />
    <p v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">
      No hay datos para mostrar.
    </p>
  </div>
</template>
