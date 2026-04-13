<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeIcon,
  FireIcon,
  BeakerIcon,
  BookOpenIcon,
  UserIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  FireIcon as FireIconSolid,
  BeakerIcon as BeakerIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'home', label: 'Início', icon: HomeIcon, iconActive: HomeIconSolid },
  { name: 'meals', label: 'Refeições', icon: BeakerIcon, iconActive: BeakerIconSolid },
  { name: 'exercises', label: 'Treinos', icon: FireIcon, iconActive: FireIconSolid },
  { name: 'recipes', label: 'Receitas', icon: BookOpenIcon, iconActive: BookOpenIconSolid },
  { name: 'profile', label: 'Perfil', icon: UserIcon, iconActive: UserIconSolid }
]

const currentRoute = computed(() => route.name)

function navigate(name) {
  router.push({ name })
}
</script>

<template>
  <nav class="bottom-nav" role="navigation" aria-label="Navegação principal">
    <button
      v-for="item in navItems"
      :key="item.name"
      @click="navigate(item.name)"
      :class="['bottom-nav-item', { active: currentRoute === item.name }]"
      :aria-label="item.label"
      :aria-current="currentRoute === item.name ? 'page' : undefined"
    >
      <div class="relative">
        <component
          :is="currentRoute === item.name ? item.iconActive : item.icon"
          class="w-6 h-6 transition-transform duration-150"
          :class="{ 'scale-110': currentRoute === item.name }"
          aria-hidden="true"
        />
        <span
          v-if="currentRoute === item.name"
          class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
          aria-hidden="true"
        />
      </div>
      <span class="text-xs mt-1.5 font-medium">{{ item.label }}</span>
    </button>
  </nav>
</template>
