<script setup>
import { ref, computed, watch } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { foods as foodsApi } from "@/services/api";

const loading = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");
const foods = ref([]);

const categories = [
  { value: "", label: "Todos" },
  { value: "Cereais", label: "Cereais" },
  { value: "Leguminosas", label: "Leguminosas" },
  { value: "Carnes", label: "Carnes" },
  { value: "Ovos", label: "Ovos" },
  { value: "Laticínios", label: "Laticínios" },
  { value: "Frutas", label: "Frutas" },
  { value: "Verduras", label: "Verduras" },
  { value: "Tubérculos", label: "Tubérculos" },
];

let debounceTimer = null;

async function searchFoods() {
  if (!searchQuery.value || searchQuery.value.length < 3) {
    foods.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await foodsApi.search(searchQuery.value);
    foods.value = res.products || res || [];
  } catch (err) {
    console.error("Erro ao buscar alimentos:", err);
    foods.value = [];
  } finally {
    loading.value = false;
  }
}

watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(searchFoods, 400);
});

const filteredFoods = computed(() => {
  if (!selectedCategory.value) return foods.value;
  return foods.value.filter((f) => f.category === selectedCategory.value);
});
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1 class="page-title">Alimentos</h1>
    </header>

    <!-- Layout desktop: sidebar de filtros + resultados -->
    <div class="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6 lg:items-start">

      <!-- Coluna esquerda: filtros (sidebar no desktop, scroll horizontal no mobile) -->
      <div class="lg:sticky lg:top-6">
        <!-- Mobile: scroll horizontal -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar mb-6 -mx-4 px-4 lg:hidden">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectedCategory = cat.value"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === cat.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            ]"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Desktop: lista vertical de categorias -->
        <div class="hidden lg:block card mb-0">
          <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categorias</h3>
          <div class="space-y-1">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="selectedCategory = cat.value"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedCategory === cat.value
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Coluna direita: busca + resultados -->
      <div>
        <!-- Busca -->
        <div class="relative mb-6">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            class="input pl-12"
            placeholder="Buscar alimento (mín. 3 letras)"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div v-for="i in 6" :key="i" class="skeleton h-20 rounded-xl"></div>
        </div>

        <!-- Lista em grid no desktop -->
        <div v-else>
          <div
            v-if="filteredFoods.length > 0"
            class="grid grid-cols-1 lg:grid-cols-2 gap-3"
          >
            <div
              v-for="food in filteredFoods"
              :key="food.id"
              class="card p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1 min-w-0 pr-3">
                  <p class="font-medium text-gray-800 dark:text-white truncate">{{ food.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    {{ food.brand || "Sem marca" }} • {{ food.portion_description || "100g" }}
                  </p>
                </div>
                <span class="text-lg font-bold text-primary-500 flex-shrink-0">
                  {{ Math.round(food.calories) }} kcal
                </span>
              </div>

              <div class="flex gap-4 text-xs mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                <span class="text-blue-500 font-medium">P: {{ food.protein }}g</span>
                <span class="text-yellow-500 font-medium">C: {{ food.carbs }}g</span>
                <span class="text-purple-500 font-medium">G: {{ food.fat }}g</span>
                <span v-if="food.category" class="text-gray-400 ml-auto">{{ food.category }}</span>
              </div>
            </div>
          </div>

          <!-- Empty states -->
          <div
            v-if="!loading && filteredFoods.length === 0 && searchQuery.length >= 3"
            class="text-center py-16"
          >
            <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-500 font-medium">Nenhum alimento encontrado</p>
            <p class="text-sm text-gray-400 mt-1">Tente outra busca</p>
          </div>

          <div v-if="searchQuery.length === 0" class="text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-500 font-medium">Busque um alimento</p>
            <p class="text-sm text-gray-400 mt-1">Digite pelo menos 3 letras para buscar</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
