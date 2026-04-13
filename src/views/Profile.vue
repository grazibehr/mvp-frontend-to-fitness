<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useToastStore } from '@/stores/toast'
import {
  UserIcon,
  ScaleIcon,
  FireIcon,
  HeartIcon,
  ArrowLeftOnRectangleIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  PencilIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const toast = useToastStore()

const user = computed(() => authStore.user)

const goalLabels = {
  lose_weight: 'Perder Peso',
  lose_fat: 'Perder Gordura',
  gain_muscle: 'Ganhar Músculo',
  maintain: 'Manter Peso',
  improve_health: 'Melhorar Saúde'
}

const activityLabels = {
  sedentary: 'Sedentário',
  light: 'Levemente Ativo',
  moderate: 'Moderadamente Ativo',
  active: 'Muito Ativo',
  very_active: 'Extremamente Ativo'
}

const bmiCategories = {
  underweight: 'Abaixo do peso',
  normal: 'Peso normal',
  overweight: 'Sobrepeso',
  obese_1: 'Obesidade I',
  obese_2: 'Obesidade II',
  obese_3: 'Obesidade III'
}

const bodyTypeLabels = {
  ectomorph: 'Ectomorfo',
  mesomorph: 'Mesomorfo',
  endomorph: 'Endomorfo',
  mixed: 'Misto'
}

function logout() {
  authStore.logout()
  toast.info('Você saiu da sua conta')
  router.push('/login')
}

onMounted(() => {
  authStore.fetchProfile()
})
</script>

<template>
  <div class="page-container">

    <!-- Hero do perfil -->
    <div class="card mb-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white overflow-hidden relative">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
      <div class="relative flex flex-col lg:flex-row lg:items-center lg:gap-6">
        <div class="flex items-center gap-4 mb-4 lg:mb-0">
          <div class="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
            <UserIcon class="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <div>
            <h1 class="text-xl lg:text-2xl font-bold text-white">{{ user?.name || 'Usuário' }}</h1>
            <p class="text-sm text-primary-100">{{ user?.email }}</p>
            <span v-if="user?.goal" class="inline-block mt-1 px-3 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white">
              {{ goalLabels[user.goal] }}
            </span>
          </div>
        </div>

        <!-- Stats rápidos no desktop -->
        <div class="lg:ml-auto grid grid-cols-3 gap-4 lg:gap-6">
          <div class="text-center">
            <p class="text-2xl font-bold text-white">{{ user?.weight || '-' }}</p>
            <p class="text-xs text-primary-200">kg</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-white">{{ user?.daily_calorie_target || '-' }}</p>
            <p class="text-xs text-primary-200">kcal/dia</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-white">{{ user?.bmi || '-' }}</p>
            <p class="text-xs text-primary-200">IMC</p>
          </div>
        </div>

        <button
          @click="router.push('/onboarding')"
          class="lg:flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors text-sm font-medium mt-4 lg:mt-0"
        >
          <PencilIcon class="w-4 h-4" />
          Editar Perfil
        </button>
      </div>
    </div>

    <!-- Grid de 3 colunas no desktop -->
    <div class="lg:grid lg:grid-cols-3 lg:gap-6 space-y-4 lg:space-y-0">

      <!-- Coluna 1: Dados Físicos -->
      <div class="space-y-4">
        <div class="card">
          <h2 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            <ScaleIcon class="w-5 h-5 text-primary-500" />
            Dados Físicos
          </h2>
          <div class="grid grid-cols-3 gap-2 mb-3">
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p class="text-xl font-bold text-gray-800 dark:text-white">{{ user?.weight || '-' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">kg</p>
            </div>
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p class="text-xl font-bold text-gray-800 dark:text-white">{{ user?.height || '-' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">cm</p>
            </div>
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p class="text-xl font-bold text-gray-800 dark:text-white">{{ user?.age || '-' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">anos</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="stat-row">
              <span class="text-sm text-gray-500 dark:text-gray-400">IMC</span>
              <div class="text-right">
                <span class="font-bold text-gray-800 dark:text-white">{{ user?.bmi || '-' }}</span>
                <p v-if="user?.bmi_category" class="text-xs text-gray-400">{{ bmiCategories[user.bmi_category] }}</p>
              </div>
            </div>
            <div class="stat-row">
              <span class="text-sm text-gray-500 dark:text-gray-400">Gordura corporal</span>
              <span class="font-bold text-gray-800 dark:text-white">{{ user?.body_fat_percentage ? user.body_fat_percentage + '%' : '-' }}</span>
            </div>
            <div class="stat-row">
              <span class="text-sm text-gray-500 dark:text-gray-400">Tipo corporal</span>
              <span class="font-semibold text-gray-800 dark:text-white text-sm">{{ bodyTypeLabels[user?.body_type] || 'Não definido' }}</span>
            </div>
          </div>
        </div>

        <!-- Condições de Saúde -->
        <div v-if="user?.health_conditions?.length" class="card">
          <h2 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
            <HeartIcon class="w-5 h-5 text-red-500" />
            Condições de Saúde
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="condition in user.health_conditions"
              :key="condition"
              class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm"
            >
              {{ condition }}
            </span>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Objetivos e Metas -->
      <div class="space-y-4">
        <div class="card">
          <h2 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            <FireIcon class="w-5 h-5 text-yellow-500" />
            Objetivos e Metas
          </h2>

          <div class="space-y-2">
            <div class="stat-row">
              <span class="text-sm text-gray-500 dark:text-gray-400">Meta</span>
              <span class="font-semibold text-gray-800 dark:text-white text-sm">{{ goalLabels[user?.goal] || 'Não definido' }}</span>
            </div>
            <div class="stat-row">
              <span class="text-sm text-gray-500 dark:text-gray-400">Atividade</span>
              <span class="font-semibold text-gray-800 dark:text-white text-sm">{{ activityLabels[user?.activity_level] || '-' }}</span>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
              <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ user?.daily_calorie_target || '-' }}</p>
              <p class="text-xs text-gray-500 mt-0.5">kcal/dia</p>
            </div>
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ user?.daily_protein_target || '-' }}g</p>
              <p class="text-xs text-gray-500 mt-0.5">proteína/dia</p>
            </div>
            <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
              <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ user?.daily_carb_target || '-' }}g</p>
              <p class="text-xs text-gray-500 mt-0.5">carbos/dia</p>
            </div>
            <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
              <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ user?.daily_fat_target || '-' }}g</p>
              <p class="text-xs text-gray-500 mt-0.5">gordura/dia</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna 3: Configurações e Ações -->
      <div class="space-y-4">
        <div class="card">
          <h2 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            <Cog6ToothIcon class="w-5 h-5 text-primary-500" />
            Configurações
          </h2>
          <div class="space-y-2">
            <button
              @click="themeStore.toggleTheme()"
              class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <SunIcon v-if="!themeStore.isDark" class="w-4 h-4 text-yellow-500" />
                  <MoonIcon v-else class="w-4 h-4 text-blue-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-200 text-sm">Tema</span>
              </div>
              <span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">{{ themeStore.isDark ? 'Escuro' : 'Claro' }}</span>
            </button>

            <button
              @click="router.push('/onboarding')"
              class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <PencilIcon class="w-4 h-4 text-gray-500" />
                </div>
                <span class="text-gray-700 dark:text-gray-200 text-sm">Editar Perfil</span>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <!-- Logout -->
        <button
          @click="logout"
          class="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
        >
          <ArrowLeftOnRectangleIcon class="w-5 h-5" />
          <span class="font-medium">Sair da conta</span>
        </button>

        <p class="text-center text-xs text-gray-400">TO-FITNESS v1.0.0</p>
      </div>
    </div>
  </div>
</template>
