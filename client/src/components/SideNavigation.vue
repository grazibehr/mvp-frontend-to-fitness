<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  HomeIcon,
  FireIcon,
  BeakerIcon,
  BookOpenIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon
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
const authStore = useAuthStore()
const toast = useToastStore()

const navItems = [
  { name: 'home', label: 'Início', icon: HomeIcon, iconActive: HomeIconSolid },
  { name: 'meals', label: 'Refeições', icon: BeakerIcon, iconActive: BeakerIconSolid },
  { name: 'exercises', label: 'Treinos', icon: FireIcon, iconActive: FireIconSolid },
  { name: 'recipes', label: 'Receitas', icon: BookOpenIcon, iconActive: BookOpenIconSolid },
  { name: 'profile', label: 'Perfil', icon: UserIcon, iconActive: UserIconSolid }
]

const currentRoute = computed(() => route.name)
const user = computed(() => authStore.user)

function navigate(name) {
  router.push({ name })
}

function logout() {
  authStore.logout()
  toast.info('Você saiu da sua conta')
  router.push('/login')
}
</script>

<template>
  <aside class="side-nav" role="navigation" aria-label="Navegação principal">
    <div class="side-nav-header">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-white/20 dark:bg-primary-500 rounded-xl flex items-center justify-center">
          <FireIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <span class="text-lg font-bold text-white leading-none">ToFitness</span>
          <p class="text-xs text-white/50 dark:text-gray-500 mt-0.5">Painel de controle</p>
        </div>
      </div>
    </div>

    <nav class="side-nav-menu">
      <p class="text-xs font-semibold text-white/40 dark:text-gray-500 uppercase tracking-wider px-4 pb-2 pt-1">Menu</p>
      <button
        v-for="item in navItems"
        :key="item.name"
        @click="navigate(item.name)"
        :class="['side-nav-item relative', { active: currentRoute === item.name }]"
        :aria-label="item.label"
        :aria-current="currentRoute === item.name ? 'page' : undefined"
      >
        <span
          v-if="currentRoute === item.name"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white dark:bg-primary-500 rounded-r-full"
          aria-hidden="true"
        />
        <component
          :is="currentRoute === item.name ? item.iconActive : item.icon"
          class="w-5 h-5 flex-shrink-0"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Conta do usuário + logout -->
    <div class="p-4 border-t border-white/10 dark:border-gray-700 space-y-2">
      <!-- Info da conta -->
      <button
        @click="navigate('profile')"
        class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/60 transition-colors text-left"
      >
        <div class="w-8 h-8 bg-white/20 dark:bg-primary-900/40 rounded-full flex items-center justify-center flex-shrink-0">
          <UserIcon class="w-4 h-4 text-white dark:text-primary-400" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white dark:text-white truncate">{{ user?.name || 'Usuário' }}</p>
          <p class="text-xs text-white/50 dark:text-gray-500 truncate">{{ user?.email }}</p>
        </div>
      </button>

      <!-- Botão sair -->
      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white dark:text-red-400 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
      >
        <ArrowLeftOnRectangleIcon class="w-4 h-4 flex-shrink-0" />
        <span>Sair da conta</span>
      </button>
    </div>
  </aside>
</template>
