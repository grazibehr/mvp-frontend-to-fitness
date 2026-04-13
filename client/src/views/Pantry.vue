<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, TrashIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)
const searchQuery = ref('')
const pantryItems = ref([])
const selectedCategory = ref('')

const mockPantry = [
  { id: 1, food: { name: 'Frango (peito)', category: 'Carnes' }, quantity: 500, unit: 'g' },
  { id: 2, food: { name: 'Arroz integral', category: 'Cereais' }, quantity: 1, unit: 'kg' },
  { id: 3, food: { name: 'Feijão preto', category: 'Leguminosas' }, quantity: 500, unit: 'g' },
  { id: 4, food: { name: 'Ovos', category: 'Ovos' }, quantity: 12, unit: 'unidades' },
  { id: 5, food: { name: 'Banana', category: 'Frutas' }, quantity: 6, unit: 'unidades' },
  { id: 6, food: { name: 'Batata doce', category: 'Tubérculos' }, quantity: 1, unit: 'kg' },
  { id: 7, food: { name: 'Aveia', category: 'Cereais' }, quantity: 500, unit: 'g' },
  { id: 8, food: { name: 'Leite', category: 'Laticínios' }, quantity: 1, unit: 'L' },
]

const categories = computed(() => {
  const cats = [...new Set(pantryItems.value.map(i => i.food.category))]
  return cats
})

const filteredItems = computed(() => {
  let items = pantryItems.value
  if (selectedCategory.value) {
    items = items.filter(i => i.food.category === selectedCategory.value)
  }
  if (searchQuery.value) {
    items = items.filter(item =>
      item.food.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  return items
})

const itemsByCategory = computed(() => {
  const groups = {}
  filteredItems.value.forEach(item => {
    const cat = item.food.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  })
  return groups
})

const categoryIcons = {
  'Carnes': '🥩',
  'Cereais': '🌾',
  'Leguminosas': '🫘',
  'Ovos': '🥚',
  'Frutas': '🍎',
  'Tubérculos': '🥔',
  'Laticínios': '🥛',
}

function removeItem(id) {
  pantryItems.value = pantryItems.value.filter(i => i.id !== id)
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 400))
  pantryItems.value = mockPantry
  loading.value = false
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Minha Despensa</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden lg:block">{{ pantryItems.length }} itens cadastrados</p>
      </div>
      <button class="btn-primary py-2.5 px-4 text-sm">
        <PlusIcon class="w-4 h-4 mr-1 inline" /> Adicionar
      </button>
    </header>

    <!-- Layout desktop: sidebar + conteúdo -->
    <div class="lg:grid lg:grid-cols-[240px_1fr] lg:gap-6 lg:items-start">

      <!-- Sidebar esquerda -->
      <div class="lg:sticky lg:top-6 space-y-4 mb-6 lg:mb-0">

        <!-- Stats -->
        <div class="card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div class="flex items-center gap-3 mb-4">
            <SparklesIcon class="w-8 h-8 text-white/80" />
            <div>
              <p class="font-semibold">Sugestões</p>
              <p class="text-xs text-green-100">Com base na despensa</p>
            </div>
          </div>
          <button class="w-full py-2 bg-white text-green-600 rounded-xl font-medium text-sm hover:bg-green-50 transition-colors">
            Ver Receitas
          </button>
        </div>

        <!-- Filtro por categoria -->
        <div class="card">
          <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categorias</h3>
          <div class="space-y-1">
            <button
              @click="selectedCategory = ''"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between',
                selectedCategory === ''
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <span>Todos</span>
              <span class="text-xs opacity-70">{{ pantryItems.length }}</span>
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              @click="selectedCategory = cat"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between',
                selectedCategory === cat
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <span class="flex items-center gap-2">
                <span>{{ categoryIcons[cat] || '📦' }}</span>
                {{ cat }}
              </span>
              <span class="text-xs opacity-70">{{ pantryItems.filter(i => i.food.category === cat).length }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div>
        <!-- Busca -->
        <div class="relative mb-6">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input v-model="searchQuery" type="text" class="input pl-12" placeholder="Buscar na despensa..." />
        </div>

        <!-- Filtros mobile (horizontal scroll) -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 mb-4 lg:hidden">
          <button
            @click="selectedCategory = ''"
            :class="['px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0', selectedCategory === '' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300']"
          >Todos</button>
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            :class="['px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0', selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300']"
          >{{ categoryIcons[cat] || '' }} {{ cat }}</button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="i in 6" :key="i" class="skeleton h-20 rounded-xl"></div>
        </div>

        <!-- Lista -->
        <div v-else class="space-y-6">
          <div v-for="(items, category) in itemsByCategory" :key="category">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>{{ categoryIcons[category] || '📦' }}</span>
              {{ category }}
              <span class="text-xs font-normal normal-case bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{{ items.length }}</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="item in items"
                :key="item.id"
                class="card flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p class="font-semibold text-gray-800 dark:text-white">{{ item.food.name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ item.quantity }} {{ item.unit }}</p>
                </div>
                <button @click="removeItem(item.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="Object.keys(itemsByCategory).length === 0" class="empty-state">
            <div class="empty-state-icon mx-auto">
              <SparklesIcon class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-500 font-medium mt-4">Nenhum item encontrado</p>
            <p class="text-sm text-gray-400 mt-1">Adicione itens para receber sugestões de receitas</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
