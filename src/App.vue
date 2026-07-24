<script setup lang="ts">
import TransactionForm from './components/TransactionForm.vue'
import Dashboard from './components/Dashboard.vue'
import AppHeader from './components/AppHeader.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />

    <main class="px-4 py-8">
      <Tabs default-value="formulario" class="mx-auto mt-6 w-full">
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
  </div>
</template>
