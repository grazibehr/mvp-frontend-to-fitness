<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { recipes as recipesApi } from '@/services/api'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  FireIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const toast = useToastStore()

const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('')
const recipesList = ref([])
const selectedRecipe = ref(null)
let searchTimer = null

const user = computed(() => authStore.user)

const filters = [
  { value: '', label: 'Todas' },
  { value: 'Chicken', label: 'Frango', recommended: false },
  { value: 'Seafood', label: 'Frutos do Mar', recommended: false },
  { value: 'Vegetarian', label: 'Vegetariano', recommended: false },
  { value: 'Vegan', label: 'Vegano', recommended: false },
  { value: 'Beef', label: 'Carne', recommended: false },
  { value: 'Breakfast', label: 'Café da Manhã', recommended: false },
]

const filteredRecipes = computed(() => recipesList.value)

const recommendedRecipes = computed(() => {
  if (!user.value?.goal) return []
  return recipesList.value.filter(r => {
    if (user.value.goal === 'lose_weight' || user.value.goal === 'lose_fat') return r.good_for_weight_loss
    if (user.value.goal === 'gain_muscle') return r.good_for_muscle_gain
    return r.is_high_protein
  }).slice(0, 3)
})

async function loadRecipes(query = '', category = '') {
  loading.value = true
  try {
    const res = await recipesApi.search(query, category)
    recipesList.value = res.recipes || []
  } catch (err) {
    toast.error('Erro ao carregar receitas')
    recipesList.value = []
  } finally {
    loading.value = false
  }
}

watch(activeFilter, (val) => {
  loadRecipes('', val)
})

watch(searchQuery, (val) => {
  clearTimeout(searchTimer)
  if (val.length >= 3) {
    searchTimer = setTimeout(() => loadRecipes(val, ''), 600)
  } else if (val.length === 0) {
    loadRecipes('', activeFilter.value)
  }
})

function openRecipe(recipe) {
  selectedRecipe.value = recipe
}

function closeRecipe() {
  selectedRecipe.value = null
}

onMounted(() => {
  loadRecipes()
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Receitas</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden lg:block">
          {{ filteredRecipes.length }} receitas disponíveis
        </p>
      </div>
    </header>

    <!-- Layout desktop: sidebar + conteúdo -->
    <div class="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6 lg:items-start">

      <!-- Sidebar de filtros (desktop) -->
      <div class="lg:sticky lg:top-6 space-y-4 mb-6 lg:mb-0">

        <!-- Busca por nome -->
        <div class="card">
          <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Buscar receita
          </h3>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              class="input pl-9 text-sm py-2.5"
              placeholder="Ex: chicken, pasta..."
            />
          </div>
        </div>

        <!-- Filtros por objetivo -->
        <div class="card">
          <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Filtrar por</h3>
          <div class="space-y-1">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="activeFilter = filter.value"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between',
                activeFilter === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
            >
              {{ filter.label }}
              <span v-if="filter.recommended" class="text-xs opacity-80">★</span>
            </button>
          </div>
        </div>

        <!-- Stats card -->
        <div class="card bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800">
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ filteredRecipes.length }}</p>
            <p class="text-sm text-primary-700 dark:text-primary-300">receitas encontradas</p>
          </div>
          <div class="mt-3 pt-3 border-t border-primary-100 dark:border-primary-800 grid grid-cols-2 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-gray-800 dark:text-white">{{ recipesList.filter(r => r.is_high_protein).length }}</p>
              <p class="text-xs text-gray-500">alta proteína</p>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-800 dark:text-white">{{ recipesList.filter(r => r.good_for_weight_loss).length }}</p>
              <p class="text-xs text-gray-500">para emagrecer</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div>
        <!-- Filtros mobile -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 mb-4 lg:hidden">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              activeFilter === filter.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            ]"
          >
            {{ filter.label }}
            <span v-if="filter.recommended">★</span>
          </button>
        </div>

        <!-- Busca mobile -->
        <div class="relative mb-4 lg:hidden">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input v-model="searchQuery" type="text" class="input pl-12" placeholder="Buscar receita..." />
        </div>

        <!-- Recomendadas -->
        <div v-if="recommendedRecipes.length > 0 && !activeFilter && !searchQuery" class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <SparklesIcon class="w-5 h-5 text-primary-500" />
            <h2 class="font-semibold text-gray-800 dark:text-white">Recomendadas para você</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="recipe in recommendedRecipes"
              :key="recipe.id"
              @click="openRecipe(recipe)"
              class="card-interactive p-4 flex gap-3 items-center lg:flex-col lg:items-start"
            >
              <img v-if="recipe.image" :src="recipe.image" :alt="recipe.name" class="w-16 h-16 lg:w-full lg:h-32 object-cover rounded-xl flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2 mb-1">{{ recipe.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ recipe.category }} · {{ recipe.area }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="i in 8" :key="i" class="skeleton h-48 rounded-2xl"></div>
        </div>

        <!-- Grid de receitas -->
        <div v-else>
          <div v-if="filteredRecipes.length > 0" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="recipe in filteredRecipes"
              :key="recipe.id"
              @click="openRecipe(recipe)"
              class="card-interactive overflow-hidden p-0"
            >
              <img v-if="recipe.image" :src="recipe.image" :alt="recipe.name" class="w-full h-32 object-cover" />
              <div class="p-3">
                <h3 class="font-semibold text-gray-800 dark:text-white text-sm mb-1 line-clamp-2">{{ recipe.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ recipe.category }} · {{ recipe.area }}</p>
                <div class="flex flex-wrap gap-1">
                  <span v-if="recipe.is_high_protein" class="badge-primary text-xs">Proteica</span>
                  <span v-if="recipe.is_low_carb" class="badge bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">Low Carb</span>
                  <span v-if="recipe.good_for_weight_loss" class="badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">Emagrecer</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-16">
            <div class="empty-state-icon mx-auto mb-4">
              <SparklesIcon class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-500 font-medium">Nenhuma receita encontrada</p>
            <p class="text-sm text-gray-400 mt-1">Tente outros ingredientes ou filtros</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes da Receita -->
    <div
      v-if="selectedRecipe"
      class="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50"
      @click.self="closeRecipe"
    >
      <div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl lg:rounded-2xl max-h-[85vh] overflow-y-auto animate-slide-up lg:animate-fade-in">
        <div>
          <div class="relative">
            <img v-if="selectedRecipe.image" :src="selectedRecipe.image" :alt="selectedRecipe.name" class="w-full h-48 object-cover" />
            <button @click="closeRecipe" class="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white rounded-full shadow">
              <XMarkIcon class="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          <div class="p-6">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-1">{{ selectedRecipe.name }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ selectedRecipe.category }} · {{ selectedRecipe.area }}</p>

            <div class="flex flex-wrap gap-1 mb-4">
              <span v-if="selectedRecipe.is_high_protein" class="badge-primary text-xs">Proteica</span>
              <span v-if="selectedRecipe.is_low_carb" class="badge bg-green-100 text-green-700 text-xs">Low Carb</span>
              <span v-if="selectedRecipe.good_for_weight_loss" class="badge bg-blue-100 text-blue-700 text-xs">Emagrecer</span>
              <span v-if="selectedRecipe.good_for_muscle_gain" class="badge bg-orange-100 text-orange-700 text-xs">Ganho Muscular</span>
            </div>

            <div class="mb-6">
              <h3 class="font-semibold text-gray-800 dark:text-white mb-2">Ingredientes</h3>
              <ul class="space-y-1">
                <li v-for="ing in selectedRecipe.ingredients" :key="ing.name" class="flex justify-between text-sm">
                  <span class="text-gray-700 dark:text-gray-300">{{ ing.name }}</span>
                  <span class="text-gray-500 dark:text-gray-400">{{ ing.measure }}</span>
                </li>
              </ul>
            </div>

            <div class="mb-6">
              <h3 class="font-semibold text-gray-800 dark:text-white mb-2">Modo de Preparo</h3>
              <p class="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm">{{ selectedRecipe.instructions }}</p>
            </div>

            <a v-if="selectedRecipe.youtube" :href="selectedRecipe.youtube" target="_blank" class="btn-secondary w-full block text-center mb-3">
              Ver no YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
