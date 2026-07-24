<script setup lang="ts">
defineProps<{
  label: string
  value: number
}>()
</script>

<template>
  <div class="rounded-lg bg-secondary px-4 py-3">
    <p class="text-sm text-secondary-foreground/70">{{ label }}</p>
    <p class="text-2xl font-bold">{{ value.toLocaleString('es-AR') }}</p>
  </div>
</template>
