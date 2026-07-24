<script setup lang="ts">
import TransactionForm from './components/TransactionForm.vue'
import Dashboard from './components/Dashboard.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <main class="min-h-screen bg-background px-4 py-8">
    <h1 class="text-center text-xl font-semibold">Fraud Harness — Loyalty</h1>

    <Tabs default-value="formulario" class="mx-auto mt-6 w-full max-w-3xl">
      <TabsList class="mx-auto">
        <TabsTrigger value="formulario">Formulario</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      </TabsList>
      <TabsContent value="formulario">
        <TransactionForm />
      </TabsContent>
      <TabsContent value="dashboard">
        <Dashboard />
      </TabsContent>
    </Tabs>
  </main>
</template>
