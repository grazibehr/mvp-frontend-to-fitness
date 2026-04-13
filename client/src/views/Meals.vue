<script setup>
import { meals as mealsApi } from "@/services/api";

import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  SunIcon,
  CloudIcon,
  MoonIcon,
  SparklesIcon,
} from "@heroicons/vue/24/outline";
import AddMealModal from "@/components/AddMealModal.vue";

const authStore = useAuthStore();
const toast = useToastStore();

const loading = ref(true);
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const showAddModal = ref(false);
const selectedMealType = ref("");

const meals = ref([]);
const dailySummary = ref({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

const user = computed(() => authStore.user);

const mealTypes = [
  { value: "breakfast", label: "Café da Manhã", icon: SunIcon, time: "06:00 - 09:00" },
  { value: "morning_snack", label: "Lanche da Manhã", icon: SparklesIcon, time: "09:00 - 11:00" },
  { value: "lunch", label: "Almoço", icon: SunIcon, time: "11:00 - 14:00" },
  { value: "afternoon_snack", label: "Lanche da Tarde", icon: CloudIcon, time: "14:00 - 17:00" },
  { value: "dinner", label: "Jantar", icon: MoonIcon, time: "18:00 - 21:00" },
  { value: "supper", label: "Ceia", icon: MoonIcon, time: "21:00 - 23:00" },
];

const formattedDate = computed(() => {
  const date = new Date(selectedDate.value + "T12:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (selectedDate.value === today.toISOString().split("T")[0]) return "Hoje";
  if (selectedDate.value === yesterday.toISOString().split("T")[0]) return "Ontem";

  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
});

const caloriesRemaining = computed(() => {
  const target = user.value?.daily_calorie_target || 2000;
  return target - dailySummary.value.calories;
});

const caloriesPercentage = computed(() => {
  const target = user.value?.daily_calorie_target || 2000;
  return Math.round((dailySummary.value.calories / target) * 100);
});

function getMealsByType(type) {
  return meals.value.filter((m) => m.meal_type === type);
}

function getMealTypeTotal(type) {
  return getMealsByType(type).reduce((sum, m) => sum + (m.total_calories || 0), 0);
}

function changeDate(days) {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + days);
  selectedDate.value = date.toISOString().split("T")[0];
  loadMeals();
}

function openAddMeal(type) {
  selectedMealType.value = type;
  showAddModal.value = true;
}

async function loadMeals() {
  loading.value = true;
  try {
    const [mealsRes, summaryRes] = await Promise.all([
      mealsApi.list(selectedDate.value),
      mealsApi.getSummary(selectedDate.value),
    ]);

    meals.value = Array.isArray(mealsRes) ? mealsRes : [];
    dailySummary.value = {
      calories: summaryRes.consumed.total_calories || 0,
      protein: summaryRes.consumed.total_protein || 0,
      carbs: summaryRes.consumed.total_carbs || 0,
      fat: summaryRes.consumed.total_fat || 0,
    };
  } catch (err) {
    console.error(err);
    toast.error("Erro ao carregar refeições");
  } finally {
    loading.value = false;
  }
}

async function deleteMeal(mealId) {
  if (!confirm("Excluir esta refeição?")) return;
  try {
    await mealsApi.delete(mealId);
    await loadMeals();
    toast.success("Refeição excluída");
  } catch (err) {
    console.error(err);
    toast.error("Erro ao excluir refeição");
  }
}

async function onMealAdded() {
  await loadMeals();
  showAddModal.value = false;
  toast.success("Refeição adicionada!");
}

onMounted(() => {
  loadMeals();
});
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1 class="page-title">Refeições</h1>
      <button @click="openAddMeal(mealTypes[0].value)" class="btn-primary py-2.5 px-4 text-sm">
        <PlusIcon class="w-4 h-4 mr-1.5 inline" /> Adicionar
      </button>
    </header>

    <!-- Layout desktop: 2 colunas -->
    <div class="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 lg:items-start">

      <!-- Coluna esquerda: Resumo (sticky no desktop) -->
      <div class="lg:sticky lg:top-6 space-y-4 mb-6 lg:mb-0">

        <!-- Seletor de Data -->
        <div class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            @click="changeDate(-1)"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            aria-label="Dia anterior"
          >
            <ChevronLeftIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <div class="text-center">
            <p class="font-bold text-gray-800 dark:text-white">{{ formattedDate }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ selectedDate }}</p>
          </div>
          <button
            @click="changeDate(1)"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            aria-label="Próximo dia"
            :disabled="selectedDate === new Date().toISOString().split('T')[0]"
            :class="{ 'opacity-30 cursor-not-allowed': selectedDate === new Date().toISOString().split('T')[0] }"
          >
            <ChevronRightIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <!-- Resumo do Dia -->
        <div class="card">
          <h2 class="font-semibold text-gray-800 dark:text-white mb-4">Resumo do Dia</h2>

          <!-- Calorias em destaque -->
          <div class="flex items-center gap-4 mb-4 p-3 rounded-xl"
            :class="caloriesRemaining >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'"
          >
            <div class="flex-1">
              <p class="text-2xl font-bold" :class="caloriesRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ Math.abs(caloriesRemaining) }} kcal
              </p>
              <p class="text-xs font-medium mt-0.5" :class="caloriesRemaining >= 0 ? 'text-green-600/70 dark:text-green-400/70' : 'text-red-600/70 dark:text-red-400/70'">
                {{ caloriesRemaining >= 0 ? 'restantes' : 'excedido' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400">Consumido</p>
              <p class="font-semibold text-gray-800 dark:text-white">{{ Math.round(dailySummary.calories) }}</p>
              <p class="text-xs text-gray-400">de {{ user?.daily_calorie_target || 2000 }} kcal</p>
            </div>
          </div>

          <!-- Barra de Calorias -->
          <div class="mb-4">
            <div class="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{{ caloriesPercentage }}% da meta</span>
            </div>
            <div class="progress-bar h-2.5">
              <div
                class="progress-bar-fill"
                :class="caloriesPercentage > 100 ? 'bg-red-500' : 'bg-primary-500'"
                :style="{ width: `${Math.min(caloriesPercentage, 100)}%` }"
              />
            </div>
          </div>

          <!-- Macros -->
          <div class="grid grid-cols-3 gap-2">
            <div class="text-center p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p class="text-base font-bold text-blue-600 dark:text-blue-400">{{ Math.round(dailySummary.protein) }}g</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Proteína</p>
              <div class="mt-1.5 h-1 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${Math.min((dailySummary.protein / (user?.daily_protein_target || 120)) * 100, 100)}%` }" />
              </div>
            </div>
            <div class="text-center p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p class="text-base font-bold text-amber-600 dark:text-amber-400">{{ Math.round(dailySummary.carbs) }}g</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Carbos</p>
              <div class="mt-1.5 h-1 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
                <div class="h-full bg-amber-400 rounded-full" :style="{ width: `${Math.min((dailySummary.carbs / 250) * 100, 100)}%` }" />
              </div>
            </div>
            <div class="text-center p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p class="text-base font-bold text-purple-600 dark:text-purple-400">{{ Math.round(dailySummary.fat) }}g</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Gordura</p>
              <div class="mt-1.5 h-1 bg-purple-100 dark:bg-purple-900/40 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 rounded-full" :style="{ width: `${Math.min((dailySummary.fat / 65) * 100, 100)}%` }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Atalhos de adição rápida (desktop) -->
        <div class="hidden lg:block card">
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Adicionar rápido</p>
          <div class="space-y-1.5">
            <button
              v-for="mt in mealTypes"
              :key="mt.value"
              @click="openAddMeal(mt.value)"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <div class="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/60 transition-colors">
                <component :is="mt.icon" class="w-3.5 h-3.5 text-primary-500" />
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ mt.label }}</span>
              <PlusIcon class="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 ml-auto transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <!-- Coluna direita: Lista de refeições -->
      <div class="space-y-4">

        <!-- Visão geral do dia (full-width) -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-gray-800 dark:text-white text-sm">Distribuição do dia</h2>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ Math.round(dailySummary.calories) }} / {{ user?.daily_calorie_target || 2000 }} kcal</span>
          </div>
          <div class="flex gap-1 h-8 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <div
              v-for="mealType in mealTypes"
              :key="mealType.value"
              v-show="getMealTypeTotal(mealType.value) > 0"
              class="h-full flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
              :class="[
                mealType.value === 'breakfast' ? 'bg-orange-400' :
                mealType.value === 'morning_snack' ? 'bg-yellow-400' :
                mealType.value === 'lunch' ? 'bg-green-500' :
                mealType.value === 'afternoon_snack' ? 'bg-teal-400' :
                mealType.value === 'dinner' ? 'bg-blue-500' : 'bg-purple-500'
              ]"
              :style="{ width: `${Math.max((getMealTypeTotal(mealType.value) / (user?.daily_calorie_target || 2000)) * 100, 0)}%` }"
              :title="`${mealType.label}: ${getMealTypeTotal(mealType.value)} kcal`"
            />
            <div v-if="dailySummary.calories === 0" class="flex-1 flex items-center justify-center">
              <span class="text-xs text-gray-400 dark:text-gray-500">Nenhuma refeição registrada hoje</span>
            </div>
          </div>
          <!-- Legenda -->
          <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <div v-for="mealType in mealTypes" :key="mealType.value" v-show="getMealTypeTotal(mealType.value) > 0" class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :class="[
                  mealType.value === 'breakfast' ? 'bg-orange-400' :
                  mealType.value === 'morning_snack' ? 'bg-yellow-400' :
                  mealType.value === 'lunch' ? 'bg-green-500' :
                  mealType.value === 'afternoon_snack' ? 'bg-teal-400' :
                  mealType.value === 'dinner' ? 'bg-blue-500' : 'bg-purple-500'
                ]"
              />
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ mealType.label }} <strong class="text-gray-700 dark:text-gray-200">{{ getMealTypeTotal(mealType.value) }}</strong> kcal</span>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div v-for="i in 6" :key="i" class="skeleton h-44 rounded-2xl"></div>
        </div>

        <!-- Grid de refeições -->
        <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div
            v-for="mealType in mealTypes"
            :key="mealType.value"
            class="card flex flex-col min-h-[180px]"
            :class="getMealsByType(mealType.value).length > 0 ? 'border-l-4' : ''"
            :style="getMealsByType(mealType.value).length > 0 ? {
              borderLeftColor:
                mealType.value === 'breakfast' ? '#fb923c' :
                mealType.value === 'morning_snack' ? '#facc15' :
                mealType.value === 'lunch' ? '#22c55e' :
                mealType.value === 'afternoon_snack' ? '#2dd4bf' :
                mealType.value === 'dinner' ? '#3b82f6' : '#a855f7'
            } : {}"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  :class="[
                    mealType.value === 'breakfast' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    mealType.value === 'morning_snack' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    mealType.value === 'lunch' ? 'bg-green-100 dark:bg-green-900/30' :
                    mealType.value === 'afternoon_snack' ? 'bg-teal-100 dark:bg-teal-900/30' :
                    mealType.value === 'dinner' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                  ]"
                >
                  <component :is="mealType.icon" class="w-5 h-5"
                    :class="[
                      mealType.value === 'breakfast' ? 'text-orange-500' :
                      mealType.value === 'morning_snack' ? 'text-yellow-500' :
                      mealType.value === 'lunch' ? 'text-green-500' :
                      mealType.value === 'afternoon_snack' ? 'text-teal-500' :
                      mealType.value === 'dinner' ? 'text-blue-500' : 'text-purple-500'
                    ]"
                  />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800 dark:text-white text-sm">{{ mealType.label }}</h3>
                  <p class="text-xs text-gray-400 dark:text-gray-500">{{ mealType.time }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="getMealTypeTotal(mealType.value) > 0" class="text-sm font-bold"
                  :class="[
                    mealType.value === 'breakfast' ? 'text-orange-500' :
                    mealType.value === 'morning_snack' ? 'text-yellow-500' :
                    mealType.value === 'lunch' ? 'text-green-500' :
                    mealType.value === 'afternoon_snack' ? 'text-teal-500' :
                    mealType.value === 'dinner' ? 'text-blue-500' : 'text-purple-500'
                  ]"
                >
                  {{ getMealTypeTotal(mealType.value) }} kcal
                </span>
                <button
                  @click="openAddMeal(mealType.value)"
                  class="w-8 h-8 rounded-xl hover:scale-105 transition-all flex items-center justify-center flex-shrink-0 text-white"
                  :class="[
                    mealType.value === 'breakfast' ? 'bg-orange-400 hover:bg-orange-500' :
                    mealType.value === 'morning_snack' ? 'bg-yellow-400 hover:bg-yellow-500' :
                    mealType.value === 'lunch' ? 'bg-green-500 hover:bg-green-600' :
                    mealType.value === 'afternoon_snack' ? 'bg-teal-400 hover:bg-teal-500' :
                    mealType.value === 'dinner' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
                  ]"
                  :aria-label="`Adicionar ${mealType.label}`"
                >
                  <PlusIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Itens -->
            <div v-if="getMealsByType(mealType.value).length > 0" class="space-y-2 flex-1">
              <div
                v-for="meal in getMealsByType(mealType.value)"
                :key="meal.id"
                class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/60 rounded-xl"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-800 dark:text-white text-sm truncate">{{ meal.name || "Refeição" }}</p>
                  <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span class="text-xs font-bold text-primary-500">{{ Math.round(meal.total_calories) }} kcal</span>
                    <span class="text-gray-300 dark:text-gray-600">·</span>
                    <span v-if="meal.total_protein" class="text-xs text-blue-500">P {{ Math.round(meal.total_protein) }}g</span>
                    <span v-if="meal.total_carbs" class="text-xs text-amber-500">C {{ Math.round(meal.total_carbs) }}g</span>
                    <span v-if="meal.total_fat" class="text-xs text-purple-500">G {{ Math.round(meal.total_fat) }}g</span>
                  </div>
                </div>
                <button
                  @click="deleteMeal(meal.id)"
                  class="p-1.5 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                  aria-label="Excluir refeição"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Empty state com botão central -->
            <div v-else class="flex-1 flex flex-col items-center justify-center gap-3 py-2">
              <button
                @click="openAddMeal(mealType.value)"
                class="w-12 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all hover:scale-105"
                :class="[
                  mealType.value === 'breakfast' ? 'border-orange-200 dark:border-orange-800/50 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20' :
                  mealType.value === 'morning_snack' ? 'border-yellow-200 dark:border-yellow-800/50 hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' :
                  mealType.value === 'lunch' ? 'border-green-200 dark:border-green-800/50 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' :
                  mealType.value === 'afternoon_snack' ? 'border-teal-200 dark:border-teal-800/50 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20' :
                  mealType.value === 'dinner' ? 'border-blue-200 dark:border-blue-800/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'border-purple-200 dark:border-purple-800/50 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                ]"
                :aria-label="`Adicionar ${mealType.label}`"
              >
                <PlusIcon class="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>
              <p class="text-xs text-gray-400 dark:text-gray-600">Adicionar alimentos</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AddMealModal
      v-if="showAddModal"
      :meal-type="selectedMealType"
      :date="selectedDate"
      @close="showAddModal = false"
      @added="onMealAdded"
    />
  </div>
</template>
