<script setup>
import { ref, computed, watch } from "vue";
import { meals, foods as foodsApi } from "@/services/api";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  mealType: { type: String, required: true },
  date: { type: String, required: true },
});

const emit = defineEmits(["close", "added"]);

const searchQuery = ref("");
const searchResults = ref([]);
const selectedItems = ref([]);
const loading = ref(false);
const searching = ref(false);

let debounceTimer = null;

const mealTypeLabels = {
  breakfast: "Café da Manhã",
  morning_snack: "Lanche da Manhã",
  lunch: "Almoço",
  afternoon_snack: "Lanche da Tarde",
  dinner: "Jantar",
  supper: "Ceia",
};

/* =====================
   SEARCH EXTERNAL API
===================== */

async function searchFoods() {
  if (!searchQuery.value || searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }

  searching.value = true;
  try {
    const res = await foodsApi.search(searchQuery.value);

    searchResults.value = (res.products || res).map((f) => ({
      id: f.id,
      name: f.name,
      calories_per_100g: f.calories,
      protein_per_100g: f.protein,
      carbs_per_100g: f.carbs,
      fat_per_100g: f.fat,
      household_measure: "100g",
      household_measure_grams: 100,
    }));
  } catch (err) {
    console.error("FOOD API ERROR:", err);
    searchResults.value = [];
  } finally {
    searching.value = false;
  }
}

/* =====================
   DEBOUNCE
===================== */
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(searchFoods, 400);
});

/* =====================
   CALCULATIONS
===================== */
function calculateItem(item) {
  const gramsMultiplier = (item.quantity * item.grams) / 100;
  item.calculated = {
    calories: Math.round(item.food.calories_per_100g * gramsMultiplier),
    protein: +(item.food.protein_per_100g * gramsMultiplier).toFixed(1),
    carbs: +(item.food.carbs_per_100g * gramsMultiplier).toFixed(1),
    fat: +(item.food.fat_per_100g * gramsMultiplier).toFixed(1),
  };
}

function addFood(food) {
  const existing = selectedItems.value.find((i) => i.food.id === food.id);

  if (existing) {
    existing.quantity++;
    calculateItem(existing);
    return;
  }

  const item = {
    food,
    quantity: 1,
    unit: "g",
    grams: 100,
    calculated: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };

  calculateItem(item);
  selectedItems.value.push(item);
  searchQuery.value = "";
  searchResults.value = [];
}

function updateQuantity(item, delta) {
  item.quantity = Math.max(0.5, item.quantity + delta);
  calculateItem(item);
}

function removeItem(index) {
  selectedItems.value.splice(index, 1);
}

/* =====================
   TOTALS
===================== */
const totalCalories = computed(() =>
  selectedItems.value.reduce((s, i) => s + i.calculated.calories, 0)
);
const totalProtein = computed(() =>
  selectedItems.value.reduce((s, i) => s + i.calculated.protein, 0)
);
const totalCarbs = computed(() =>
  selectedItems.value.reduce((s, i) => s + i.calculated.carbs, 0)
);
const totalFat = computed(() =>
  selectedItems.value.reduce((s, i) => s + i.calculated.fat, 0)
);

/* =====================
   SAVE MEAL
===================== */
async function saveMeal() {
  if (!selectedItems.value.length) return;

  loading.value = true;
  try {
    await meals.create({
      meal_type: props.mealType,
      date: props.date,
      items: selectedItems.value.map((i) => ({
        food_id: i.food.id,
        food_name: i.food.name,
        quantity: i.quantity,
        calories: i.calculated.calories,
        protein: i.calculated.protein,
        carbs: i.calculated.carbs,
        fat: i.calculated.fat,
      })),
    });

    emit("added");
    emit("close");
  } catch (err) {
    console.error("SAVE MEAL ERROR:", err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl lg:rounded-2xl flex flex-col animate-slide-up modal-container lg:modal-desktop"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0"
        >
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
            {{ mealTypeLabels[mealType] }}
          </h2>
          <button
            @click="emit('close')"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <svg
              class="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Conteudo scrollavel -->
        <div class="flex-1 overflow-y-auto p-4 min-h-0">
          <!-- Busca de Alimentos -->
          <div class="relative mb-4">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              class="input pl-10"
              placeholder="Buscar alimento..."
            />

            <!-- Resultados da busca -->
            <div
              v-if="searchResults.length > 0"
              class="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto z-10"
            >
              <button
                v-for="food in searchResults"
                :key="food.id"
                @click="addFood(food)"
                class="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0 transition-colors"
              >
                <p class="font-medium text-gray-800 dark:text-white text-sm">
                  {{ food.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ food.calories_per_100g }} kcal/100g -
                  {{ food.household_measure }} ({{
                    food.household_measure_grams
                  }}g)
                </p>
              </button>
            </div>

            <!-- Loading -->
            <div
              v-if="searching"
              class="absolute left-0 right-0 top-full mt-1 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg text-center"
            >
              <p class="text-sm text-gray-500">Buscando...</p>
            </div>
          </div>

          <!-- Alimentos Selecionados -->
          <div v-if="selectedItems.length > 0" class="space-y-3">
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Alimentos adicionados
            </h3>

            <div
              v-for="(item, index) in selectedItems"
              :key="item.food.id"
              class="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <p class="font-medium text-gray-800 dark:text-white text-sm">
                    {{ item.food.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.calculated.calories }} kcal - P:
                    {{ item.calculated.protein }}g - C:
                    {{ item.calculated.carbs }}g - G: {{ item.calculated.fat }}g
                  </p>
                </div>
                <button
                  @click="removeItem(index)"
                  class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remover"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>

              <!-- Controle de quantidade -->
              <div class="flex items-center gap-3">
                <button
                  @click="updateQuantity(item, -0.5)"
                  class="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-500"
                  aria-label="Diminuir"
                >
                  <MinusIcon class="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>

                <div class="text-center">
                  <span class="font-medium text-gray-800 dark:text-white">{{
                    item.quantity
                  }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 ml-1">{{
                    item.unit
                  }}</span>
                </div>

                <button
                  @click="updateQuantity(item, 0.5)"
                  class="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-500"
                  aria-label="Aumentar"
                >
                  <PlusIcon class="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>

                <span class="text-xs text-gray-400 ml-auto">
                  ({{ Math.round(item.quantity * item.grams) }}g)
                </span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8">
            <p class="text-gray-400 dark:text-gray-500 mb-2">
              Nenhum alimento adicionado
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Use a busca acima para adicionar alimentos
            </p>
          </div>
        </div>

        <!-- Footer SEMPRE VISIVEL -->
        <div
          class="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 modal-footer"
        >
          <!-- Totais -->
          <div
            v-if="selectedItems.length > 0"
            class="grid grid-cols-4 gap-2 mb-4"
          >
            <div class="text-center">
              <p class="text-lg font-bold text-primary-500">
                {{ totalCalories }}
              </p>
              <p class="text-xs text-gray-500">kcal</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-blue-500">
                {{ totalProtein.toFixed(1) }}g
              </p>
              <p class="text-xs text-gray-500">proteina</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-yellow-500">
                {{ totalCarbs.toFixed(1) }}g
              </p>
              <p class="text-xs text-gray-500">carbos</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-purple-500">
                {{ totalFat.toFixed(1) }}g
              </p>
              <p class="text-xs text-gray-500">gordura</p>
            </div>
          </div>

          <button
            @click="saveMeal"
            :disabled="selectedItems.length === 0 || loading"
            class="w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{{ loading ? "Salvando..." : "Salvar Refeicao" }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-container {
  max-height: 85vh;
  max-height: 85dvh;
}

.modal-footer {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

@media (min-width: 1024px) {
  .modal-desktop {
    max-height: 90vh;
    max-height: 90dvh;
  }
}
</style>
