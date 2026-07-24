<script setup lang="ts">
import { computed, ref } from 'vue'
import { evaluarTransaccion } from '@/api/transactions'
import { addRecord } from '@/lib/history'
import ResultPanel from './ResultPanel.vue'
import type { OperationType, TransactionRequest, TransactionResponse } from '@/types/transaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const PRESET_KEY = 'fraud-harness:preset'

const operacion = ref<OperationType>('enviar')
const contraparte = ref('')
const cantidad = ref<number | undefined>(undefined)

const result = ref<TransactionResponse | null>(null)
const loading = ref(false)

const requiereContraparte = computed(() => operacion.value !== 'comprar')

async function operar() {
  loading.value = true
  result.value = null
  try {
    const req: TransactionRequest = {
      operacion: operacion.value,
      contraparte: requiereContraparte.value ? contraparte.value || null : null,
      cantidad: cantidad.value ?? 0,
    }
    result.value = await evaluarTransaccion(req)
    addRecord(req, result.value)
  } finally {
    loading.value = false
  }
}

function cargarPreset() {
  const raw = localStorage.getItem(PRESET_KEY)
  if (!raw) return
  const preset = JSON.parse(raw)
  operacion.value = preset.operacion ?? 'enviar'
  contraparte.value = preset.contraparte ?? ''
  cantidad.value = preset.cantidad ?? undefined
}

cargarPreset()
</script>

<template>
  <Card class="mx-auto mt-8 max-w-md">
    <CardHeader>
      <CardTitle>Formulario de prueba</CardTitle>
    </CardHeader>

    <CardContent class="flex flex-col gap-4">
      <RadioGroup v-model="operacion" class="gap-3">
        <div class="flex items-center gap-2">
          <RadioGroupItem id="op-enviar" value="enviar" />
          <Label for="op-enviar">Enviar puntos</Label>
        </div>
        <div class="flex items-center gap-2">
          <RadioGroupItem id="op-pedir" value="pedir" />
          <Label for="op-pedir">Pedir puntos</Label>
        </div>

        <div v-if="requiereContraparte" class="ml-6 flex flex-col gap-1.5">
          <Label for="contraparte">Nombre del receptor/donador</Label>
          <Input id="contraparte" v-model="contraparte" type="text" />
        </div>

        <div class="flex items-center gap-2">
          <RadioGroupItem id="op-comprar" value="comprar" />
          <Label for="op-comprar">Comprar puntos</Label>
        </div>
      </RadioGroup>

      <div class="flex flex-col gap-1.5">
        <Label for="cantidad">Cantidad de puntos</Label>
        <Input id="cantidad" v-model.number="cantidad" type="number" min="0" />
      </div>

      <div class="flex justify-end">
        <Button :disabled="loading" @click="operar">Operar</Button>
      </div>

      <ResultPanel :result="result" :loading="loading" />
    </CardContent>
  </Card>
</template>
