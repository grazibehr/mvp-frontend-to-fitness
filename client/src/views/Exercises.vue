<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { externalExercises } from '@/services/api'
import {
  MagnifyingGlassIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const loading = ref(true)
const searchQuery = ref('')
const activeCategory = ref(0)
const exercises = ref([])

const PAGE_SIZE = 20
const currentPage = ref(1)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

let searchTimer = null

const categories = [
  { value: 0,  label: 'Todos' },
  { value: 11, label: 'Peito' },
  { value: 12, label: 'Costas' },
  { value: 13, label: 'Ombros' },
  { value: 8,  label: 'Braços' },
  { value: 9,  label: 'Pernas' },
  { value: 14, label: 'Panturrilha' },
  { value: 10, label: 'Abdômen' },
  { value: 15, label: 'Cardio' },
]

async function loadExercises() {
  loading.value = true
  try {
    const offset = (currentPage.value - 1) * PAGE_SIZE
    const res = await externalExercises.search(searchQuery.value || '', 2, PAGE_SIZE, offset, activeCategory.value)
    exercises.value = res.exercises || []
    total.value = res.total || 0
  } catch (err) {
    exercises.value = []
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  clearTimeout(searchTimer)
  currentPage.value = 1
  searchTimer = setTimeout(loadExercises, 500)
})

watch(activeCategory, () => {
  currentPage.value = 1
  loadExercises()
})

watch(currentPage, loadExercises)

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

onMounted(loadExercises)
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Exercícios</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden lg:block">Biblioteca completa de exercícios</p>
      </div>
    </header>

    <div class="lg:grid lg:grid-cols-[240px_1fr] lg:gap-6 lg:items-start">

      <!-- Sidebar (desktop) -->
      <div class="lg:sticky lg:top-6 space-y-4 mb-6 lg:mb-0">

        <!-- Busca -->
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input v-model="searchQuery" type="text" class="input pl-12" placeholder="Buscar exercício..." />
        </div>

        <!-- Filtros desktop -->
        <div class="hidden lg:block card">
          <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Grupo Muscular</h3>
          <div class="space-y-1">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="activeCategory = cat.value"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeCategory === cat.value
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
            >{{ cat.label }}</button>
          </div>
        </div>

        <!-- Stats card -->
        <div class="hidden lg:block card bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800">
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ total }}</p>
            <p class="text-sm text-primary-700 dark:text-primary-300">exercícios encontrados</p>
          </div>
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div>
        <!-- Filtros mobile (scroll horizontal) -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 mb-4 lg:hidden">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="activeCategory = cat.value"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              activeCategory === cat.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            ]"
          >{{ cat.label }}</button>
        </div>

        <!-- Info paginação -->
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ total }} exercícios · página {{ currentPage }} de {{ totalPages }}
        </p>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="i in 6" :key="i" class="skeleton h-24 rounded-xl"></div>
        </div>

        <!-- Lista -->
        <div v-else>
          <div v-if="exercises.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            <div
              v-for="exercise in exercises"
              :key="exercise.id"
              class="card hover:shadow-md transition-all"
            >
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PlayIcon class="w-4 h-4 text-primary-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-1">
                    <h3 class="font-semibold text-gray-800 dark:text-white text-sm">{{ exercise.name }}</h3>
                    <span v-if="exercise.category_name" class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {{ exercise.category_name }}
                    </span>
                  </div>
                  <p v-if="exercise.description" class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2" v-html="exercise.description"></p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">Nenhum exercício encontrado</p>
          </div>

          <!-- Paginação -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-4">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeftIcon class="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div class="flex gap-1">
              <button
                v-for="page in totalPages <= 7 ? Array.from({length: totalPages}, (_, i) => i + 1) : [1, 2, 3, '...', totalPages - 1, totalPages].filter(p => typeof p === 'string' || Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)"
                :key="page"
                @click="typeof page === 'number' && (currentPage = page)"
                :class="[
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  page === currentPage ? 'bg-primary-500 text-white' : typeof page === 'string' ? 'text-gray-400 cursor-default' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                ]"
              >{{ page }}</button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronRightIcon class="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
