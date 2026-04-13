<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  MagnifyingGlassIcon,
  CalculatorIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const searchQuery = ref('')
const searchResults = ref([])
const selectedFood = ref(null)
const quantity = ref(1)
const selectedMeasure = ref(null)
const searching = ref(false)

const user = computed(() => authStore.user)

const mockFoods = [
  { id: 1, name: 'Arroz branco cozido', category: 'Cereais', calories_per_100g: 128, protein_per_100g: 2.5, carbs_per_100g: 28, fat_per_100g: 0.2, fiber_per_100g: 0.4, measures: [
    { name: 'colher de sopa', grams: 25 }, { name: 'colher de servir', grams: 45 }, { name: 'escumadeira', grams: 90 }, { name: 'xícara', grams: 160 }
  ]},
  { id: 2, name: 'Feijão carioca cozido', category: 'Leguminosas', calories_per_100g: 76, protein_per_100g: 4.8, carbs_per_100g: 13.6, fat_per_100g: 0.5, fiber_per_100g: 8.5, measures: [
    { name: 'colher de sopa', grams: 17 }, { name: 'concha média', grams: 60 }, { name: 'concha grande', grams: 100 }
  ]},
  { id: 3, name: 'Frango grelhado (peito)', category: 'Carnes', calories_per_100g: 159, protein_per_100g: 32, carbs_per_100g: 0, fat_per_100g: 3.2, fiber_per_100g: 0, measures: [
    { name: 'filé pequeno', grams: 80 }, { name: 'filé médio', grams: 120 }, { name: 'filé grande', grams: 180 }
  ]},
  { id: 4, name: 'Ovo cozido', category: 'Ovos', calories_per_100g: 146, protein_per_100g: 13, carbs_per_100g: 0.6, fat_per_100g: 9.5, fiber_per_100g: 0, measures: [
    { name: 'unidade pequena', grams: 40 }, { name: 'unidade média', grams: 50 }, { name: 'unidade grande', grams: 60 }
  ]},
  { id: 5, name: 'Banana prata', category: 'Frutas', calories_per_100g: 98, protein_per_100g: 1.3, carbs_per_100g: 26, fat_per_100g: 0.1, fiber_per_100g: 2, measures: [
    { name: 'unidade pequena', grams: 55 }, { name: 'unidade média', grams: 86 }, { name: 'unidade grande', grams: 115 }
  ]},
  { id: 6, name: 'Pão francês', category: 'Pães', calories_per_100g: 300, protein_per_100g: 8, carbs_per_100g: 58.6, fat_per_100g: 3.1, fiber_per_100g: 2.3, measures: [
    { name: 'unidade pequena', grams: 35 }, { name: 'unidade média', grams: 50 }, { name: 'unidade grande', grams: 70 }
  ]},
  { id: 7, name: 'Leite integral', category: 'Laticínios', calories_per_100g: 61, protein_per_100g: 3, carbs_per_100g: 4.5, fat_per_100g: 3.5, fiber_per_100g: 0, measures: [
    { name: 'copo pequeno', grams: 150 }, { name: 'copo médio', grams: 200 }, { name: 'copo grande', grams: 300 }
  ]},
  { id: 8, name: 'Batata doce cozida', category: 'Tubérculos', calories_per_100g: 77, protein_per_100g: 0.6, carbs_per_100g: 18.4, fat_per_100g: 0.1, fiber_per_100g: 2.2, measures: [
    { name: 'unidade pequena', grams: 100 }, { name: 'unidade média', grams: 150 }, { name: 'unidade grande', grams: 250 }
  ]},
  { id: 9, name: 'Aveia em flocos', category: 'Cereais', calories_per_100g: 394, protein_per_100g: 14, carbs_per_100g: 66.6, fat_per_100g: 8.5, fiber_per_100g: 9.1, measures: [
    { name: 'colher de sopa', grams: 15 }, { name: 'xícara', grams: 80 }
  ]},
  { id: 10, name: 'Azeite de oliva', category: 'Óleos', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, fiber_per_100g: 0, measures: [
    { name: 'colher de chá', grams: 5 }, { name: 'colher de sopa', grams: 13 }
  ]}
]

const calculatedNutrition = computed(() => {
  if (!selectedFood.value) return null
  const grams = selectedMeasure.value ? quantity.value * selectedMeasure.value.grams : quantity.value
  const multiplier = grams / 100
  return {
    grams: Math.round(grams),
    calories: Math.round(selectedFood.value.calories_per_100g * multiplier),
    protein: Number((selectedFood.value.protein_per_100g * multiplier).toFixed(1)),
    carbs: Number((selectedFood.value.carbs_per_100g * multiplier).toFixed(1)),
    fat: Number((selectedFood.value.fat_per_100g * multiplier).toFixed(1)),
    fiber: Number((selectedFood.value.fiber_per_100g * multiplier).toFixed(1))
  }
})

const percentOfDaily = computed(() => {
  if (!calculatedNutrition.value || !user.value) return null
  return {
    calories: Math.round((calculatedNutrition.value.calories / (user.value.daily_calorie_target || 2000)) * 100),
    protein: Math.round((calculatedNutrition.value.protein / (user.value.daily_protein_target || 120)) * 100),
    carbs: Math.round((calculatedNutrition.value.carbs / (user.value.daily_carb_target || 250)) * 100),
    fat: Math.round((calculatedNutrition.value.fat / (user.value.daily_fat_target || 65)) * 100)
  }
})

function searchFoods() {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  searching.value = true
  setTimeout(() => {
    searchResults.value = mockFoods.filter(f =>
      f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    searching.value = false
  }, 300)
}

function selectFood(food) {
  selectedFood.value = food
  selectedMeasure.value = food.measures[0]
  quantity.value = 1
  searchQuery.value = ''
  searchResults.value = []
}

function reset() {
  selectedFood.value = null
  selectedMeasure.value = null
  quantity.value = 1
  searchQuery.value = ''
}

watch(searchQuery, searchFoods)
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
          <CalculatorIcon class="w-5 h-5 text-primary-500" />
        </div>
        <h1 class="page-title">Calculadora</h1>
      </div>
    </header>

    <!-- Layout desktop: 2 colunas -->
    <div class="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

      <!-- Coluna esquerda: busca e configuração -->
      <div>
        <div class="relative mb-6">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            class="input pl-12 text-lg"
            placeholder="Buscar alimento..."
          />
          <div
            v-if="searchResults.length > 0"
            class="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 max-h-72 overflow-y-auto z-20"
          >
            <button
              v-for="food in searchResults"
              :key="food.id"
              @click="selectFood(food)"
              class="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0"
            >
              <p class="font-medium text-gray-800 dark:text-white">{{ food.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ food.category }} • {{ food.calories_per_100g }} kcal/100g</p>
            </button>
          </div>
        </div>

        <!-- Alimento selecionado -->
        <div v-if="selectedFood" class="card animate-fade-in">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ selectedFood.name }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedFood.category }}</p>
            </div>
            <button @click="reset" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Limpar">
              <ArrowPathIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="mb-4">
            <label class="input-label">Medida</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="measure in selectedFood.measures"
                :key="measure.name"
                @click="selectedMeasure = measure"
                :class="['p-3 rounded-xl border-2 text-left transition-all text-sm', selectedMeasure?.name === measure.name ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-600']"
              >
                <span class="font-medium text-gray-800 dark:text-white block">{{ measure.name }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ measure.grams }}g</span>
              </button>
              <button
                @click="selectedMeasure = null"
                :class="['p-3 rounded-xl border-2 text-left transition-all text-sm', !selectedMeasure ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-600']"
              >
                <span class="font-medium text-gray-800 dark:text-white block">gramas</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">digitar quantidade</span>
              </button>
            </div>
          </div>

          <div>
            <label class="input-label">Quantidade</label>
            <div class="flex items-center gap-4">
              <input
                v-model.number="quantity"
                type="number"
                step="0.5"
                min="0.5"
                class="input w-32 text-center text-xl font-bold"
              />
              <span class="text-gray-600 dark:text-gray-400">
                {{ selectedMeasure ? selectedMeasure.name : 'gramas' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty state mobile -->
        <div v-else class="text-center py-12 lg:hidden">
          <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <CalculatorIcon class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">Calculadora de Calorias</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Busque um alimento para calcular calorias e macronutrientes.</p>
        </div>
      </div>

      <!-- Coluna direita: resultado -->
      <div>
        <!-- Empty state desktop -->
        <div v-if="!selectedFood" class="hidden lg:flex flex-col items-center justify-center text-center py-20">
          <div class="w-24 h-24 mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <CalculatorIcon class="w-12 h-12 text-gray-400" />
          </div>
          <h3 class="text-xl font-medium text-gray-800 dark:text-white mb-2">Calculadora Nutricional</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm">Busque e selecione um alimento para ver os valores nutricionais calculados.</p>
        </div>

        <div v-if="selectedFood && calculatedNutrition" class="space-y-6 animate-fade-in">
          <div class="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div class="flex items-center gap-2 mb-4">
              <InformationCircleIcon class="w-5 h-5 text-white/80" />
              <p class="text-primary-100 text-sm">{{ calculatedNutrition.grams }}g de {{ selectedFood.name }}</p>
            </div>
            <div class="text-center mb-6">
              <p class="text-6xl font-bold">{{ calculatedNutrition.calories }}</p>
              <p class="text-primary-200 text-lg">calorias</p>
            </div>
            <div class="grid grid-cols-4 gap-3">
              <div class="bg-white/10 rounded-xl p-3 text-center">
                <p class="text-xl font-bold">{{ calculatedNutrition.protein }}g</p>
                <p class="text-xs text-primary-200">Proteína</p>
              </div>
              <div class="bg-white/10 rounded-xl p-3 text-center">
                <p class="text-xl font-bold">{{ calculatedNutrition.carbs }}g</p>
                <p class="text-xs text-primary-200">Carbos</p>
              </div>
              <div class="bg-white/10 rounded-xl p-3 text-center">
                <p class="text-xl font-bold">{{ calculatedNutrition.fat }}g</p>
                <p class="text-xs text-primary-200">Gordura</p>
              </div>
              <div class="bg-white/10 rounded-xl p-3 text-center">
                <p class="text-xl font-bold">{{ calculatedNutrition.fiber }}g</p>
                <p class="text-xs text-primary-200">Fibra</p>
              </div>
            </div>
          </div>

          <div v-if="percentOfDaily" class="card">
            <h3 class="font-semibold text-gray-800 dark:text-white mb-4">% da Meta Diária</h3>
            <div class="space-y-4">
              <div v-for="(item, key) in [
                { label: 'Calorias', value: percentOfDaily.calories, color: percentOfDaily.calories > 30 ? 'bg-orange-500' : 'bg-primary-500', textColor: percentOfDaily.calories > 30 ? 'text-orange-500' : 'text-gray-800 dark:text-white' },
                { label: 'Proteína', value: percentOfDaily.protein, color: 'bg-blue-500', textColor: 'text-gray-800 dark:text-white' },
                { label: 'Carboidratos', value: percentOfDaily.carbs, color: 'bg-yellow-500', textColor: 'text-gray-800 dark:text-white' },
                { label: 'Gordura', value: percentOfDaily.fat, color: 'bg-purple-500', textColor: 'text-gray-800 dark:text-white' },
              ]" :key="key">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600 dark:text-gray-400">{{ item.label }}</span>
                  <span class="font-medium" :class="item.textColor">{{ item.value }}%</span>
                </div>
                <div class="progress-bar">
                  <div :class="['progress-bar-fill', item.color]" :style="{ width: `${Math.min(item.value, 100)}%` }" />
                </div>
              </div>
            </div>
            <p v-if="percentOfDaily.calories > 25" class="mt-4 text-sm text-orange-600 dark:text-orange-400">
              ⚠️ Este alimento representa uma parte significativa das suas calorias diárias.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
