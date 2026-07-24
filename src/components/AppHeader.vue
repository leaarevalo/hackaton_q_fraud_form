<script setup lang="ts">
import { computed } from 'vue'
import { BellIcon, ChevronDownIcon } from '@lucide/vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DEMO_USERS, getSaldo, saldos, setUsuarioActual, usuarioActualId } from '@/lib/users'

const usuarioActual = computed(() => DEMO_USERS.find((u) => u.id === usuarioActualId.value) ?? DEMO_USERS[0])
const saldoActual = computed(() => {
  void saldos.value
  return getSaldo(usuarioActual.value.id)
})
</script>

<template>
  <header class="flex items-center justify-between border-b border-border px-4 py-3">
    <span class="text-sm font-semibold">Q - Sentinel</span>

    <div class="flex items-center gap-4">
      <BellIcon class="size-5 text-muted-foreground" />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="flex h-auto items-center gap-2 px-2 py-1">
            <Avatar size="sm">
              <AvatarFallback>{{ usuarioActual.iniciales }}</AvatarFallback>
            </Avatar>
            <span class="flex flex-col items-start leading-tight">
              <span class="text-sm font-medium">{{ usuarioActual.nombre }}</span>
              <span class="text-xs text-muted-foreground">{{ saldoActual.toLocaleString('es-AR') }} pts</span>
            </span>
            <ChevronDownIcon class="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel>Loguearte como</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-for="u in DEMO_USERS"
            :key="u.id"
            :class="{ 'font-semibold': u.id === usuarioActual.id }"
            @click="setUsuarioActual(u.id)"
          >
            <Avatar size="sm" class="mr-2">
              <AvatarFallback>{{ u.iniciales }}</AvatarFallback>
            </Avatar>
            <span class="flex flex-col">
              <span>{{ u.nombre }}</span>
              <span class="text-xs text-muted-foreground">{{ getSaldo(u.id).toLocaleString('es-AR') }} pts</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
