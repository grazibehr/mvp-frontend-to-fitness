<script setup>
import { meals as mealsApi } from "@/services/api";

import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import {
  SunIcon,
  MoonIcon,
  PlusIcon,
  FireIcon,
  BeakerIcon,
  ScaleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const loading = ref(true);
const todaySummary = ref({
  calories: { consumed: 0, target: 2000, percentage: 0 },
  protein: { consumed: 0, target: 120, percentage: 0 },
  carbs: { consumed: 0, target: 250, percentage: 0 },
  fat: { consumed: 0, target: 65, percentage: 0 },
});

const user = computed(() => authStore.user);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
});

const goalLabels = {
  lose_weight: "Perder Peso",
  lose_fat: "Perder Gordura",
  gain_muscle: "Ganhar Músculo",
  maintain: "Manter Peso",
  improve_health: "Melhorar Saúde",
};

const bmiCategories = {
  underweight: { label: "Abaixo do peso", color: "text-blue-500" },
  normal: { label: "Peso normal", color: "text-green-500" },
  overweight: { label: "Sobrepeso", color: "text-yellow-500" },
  obese_1: { label: "Obesidade grau 1", color: "text-orange-500" },
  obese_2: { label: "Obesidade grau 2", color: "text-red-500" },
  obese_3: { label: "Obesidade grau 3", color: "text-red-700" },
};

const quickActions = [
  {
    name: "Adicionar Refeição",
    icon: PlusIcon,
    route: "/meals",
    color: "bg-primary-500",
  },
  {
    name: "Calculadora",
    icon: BeakerIcon,
    route: "/calculator",
    color: "bg-blue-500",
  },
  {
    name: "Meu Treino",
    icon: FireIcon,
    route: "/workouts",
    color: "bg-green-500",
  },
  { name: "Peso", icon: ScaleIcon, route: "/profile", color: "bg-purple-500" },
];

const bodyTypeLabels = {
  ectomorph: "Ectomorfo",
  mesomorph: "Mesomorfo",
  endomorph: "Endomorfo",
};

const bodyTypeDescriptions = {
  ectomorph: "Magro, metabolismo rápido",
  mesomorph: "Atlético, ganha músculo com facilidade",
  endomorph: "Tendência a acumular gordura",
};

function getProgressStrokeColor(percentage) {
  if (percentage <= 50) return "text-green-500";
  if (percentage <= 80) return "text-primary-500";
  if (percentage <= 100) return "text-yellow-500";
  return "text-red-500";
}
function round(value, decimals = 1) {
  return Number(value?.toFixed(decimals)) || 0;
}
async function loadTodaySummary() {
  const today = new Date().toISOString().split("T")[0];
  const summary = await mealsApi.getSummary(today);

  todaySummary.value.calories.consumed = Math.round(
    summary.consumed.total_calories || 0
  );
  todaySummary.value.protein.consumed = round(summary.consumed.total_protein);
  todaySummary.value.carbs.consumed = round(summary.consumed.total_carbs);
  todaySummary.value.fat.consumed = round(summary.consumed.total_fat);

  todaySummary.value.calories.target = summary.targets.daily_calorie_target;
  todaySummary.value.protein.target = summary.targets.daily_protein_target;
  todaySummary.value.carbs.target = summary.targets.daily_carbs_target;
  todaySummary.value.fat.target = summary.targets.daily_fat_target;

  todaySummary.value.calories.percentage = Math.round(
    (todaySummary.value.calories.consumed / todaySummary.value.calories.target) * 100
  );
  todaySummary.value.protein.percentage = Math.round(
    (todaySummary.value.protein.consumed / todaySummary.value.protein.target) * 100
  );
  todaySummary.value.carbs.percentage = Math.round(
    (todaySummary.value.carbs.consumed / todaySummary.value.carbs.target) * 100
  );
  todaySummary.value.fat.percentage = Math.round(
    (todaySummary.value.fat.consumed / todaySummary.value.fat.target) * 100
  );
}

onMounted(async () => {
  loading.value = true;
  await authStore.fetchProfile();
  await loadTodaySummary();
  loading.value = false;
});

const motivationMessages = computed(() => {
  const messages = [];
  const p = todaySummary.value.protein.percentage;
  const c = todaySummary.value.carbs.percentage;
  const f = todaySummary.value.fat.percentage;
  const cal = todaySummary.value.calories.percentage;

  if (p >= 90 && p < 100) messages.push("💪 Você está quase batendo a meta de proteínas!");
  else if (p >= 100 && p <= 110) messages.push("🔥 Boa! Meta de proteínas atingida.");
  else if (p > 110) messages.push("⚠️ Ops… você exagerou um pouco nas proteínas.");

  if (c >= 90 && c < 100) messages.push("⚡ Quase lá nos carboidratos!");
  else if (c > 110) messages.push("🍞 Atenção: carboidratos acima do ideal.");

  if (f > 110) messages.push("🧈 Gordura acima da meta hoje, fique atento.");

  if (cal >= 95 && cal <= 105) messages.push("🎯 Calorias muito bem controladas hoje!");
  else if (cal > 110) messages.push("🚨 Você ultrapassou bastante as calorias hoje.");

  return messages;
});

const caloriesRemaining = computed(
  () => todaySummary.value.calories.target - todaySummary.value.calories.consumed
);
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6 lg:mb-8">
      <div>
        <p class="text-gray-400 dark:text-gray-500 text-sm font-medium">{{ greeting }},</p>
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
          {{ user?.name?.split(" ")[0] || "Usuário" }} 👋
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden lg:flex flex-col items-end">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
            {{
              new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            }}
          </span>
          <span v-if="user?.goal" class="text-xs text-primary-500 font-medium mt-0.5">
            Meta: {{ goalLabels[user.goal] }}
          </span>
        </div>
        <button
          @click="themeStore.toggleTheme()"
          class="p-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-all hover:scale-105"
          :aria-label="themeStore.isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
        >
          <MoonIcon v-if="!themeStore.isDark" class="w-5 h-5 text-gray-500" />
          <SunIcon v-else class="w-5 h-5 text-yellow-400" />
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="lg:grid lg:grid-cols-3 lg:gap-6 space-y-4 lg:space-y-0">
        <div class="skeleton h-48 rounded-2xl lg:col-span-2"></div>
        <div class="skeleton h-48 rounded-2xl"></div>
      </div>
      <div class="grid grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="skeleton h-24 rounded-xl"></div>
      </div>
      <div class="skeleton h-32 rounded-2xl"></div>
    </div>

    <template v-else>
      <!-- Grid principal: 2 colunas no desktop -->
      <div class="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0 mb-6">

        <!-- Coluna esquerda: Calorias + Macros (2/3 da largura) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Card de Calorias -->
          <div class="card">
            <div class="flex items-center justify-between mb-4 lg:mb-6">
              <h2 class="font-semibold text-gray-800 dark:text-white text-lg">
                Calorias Hoje
              </h2>
              <span class="text-sm text-gray-500 dark:text-gray-400 lg:hidden">
                {{
                  new Date().toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })
                }}
              </span>
            </div>

            <!-- Layout do círculo + info: horizontal em todas as telas -->
            <div class="flex items-center gap-6 lg:gap-10">
              <!-- Círculo de progresso -->
              <div class="relative w-28 h-28 lg:w-36 lg:h-36 flex-shrink-0">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    class="text-gray-200 dark:text-gray-600"
                    stroke="currentColor"
                    stroke-width="10"
                    fill="none"
                    cx="50" cy="50" r="40"
                  />
                  <circle
                    :class="getProgressStrokeColor(todaySummary.calories.percentage)"
                    class="transition-all duration-500"
                    stroke="currentColor"
                    stroke-width="10"
                    stroke-linecap="round"
                    fill="none"
                    cx="50" cy="50" r="40"
                    :stroke-dasharray="`${Math.min(todaySummary.calories.percentage, 100) * 2.51} 251`"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                    {{ todaySummary.calories.consumed }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">kcal</span>
                </div>
              </div>

              <!-- Stats ao lado do círculo -->
              <div class="flex-1">
                <!-- Mobile: stack, Desktop: grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                  <div class="flex lg:flex-col justify-between lg:justify-start items-center lg:items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Meta diária</span>
                    <span class="font-bold text-gray-800 dark:text-white lg:text-xl">
                      {{ todaySummary.calories.target }}
                      <span class="text-xs font-normal text-gray-500">kcal</span>
                    </span>
                  </div>
                  <div class="flex lg:flex-col justify-between lg:justify-start items-center lg:items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Consumido</span>
                    <span class="font-bold text-gray-800 dark:text-white lg:text-xl">
                      {{ todaySummary.calories.consumed }}
                      <span class="text-xs font-normal text-gray-500">kcal</span>
                    </span>
                  </div>
                  <div class="flex lg:flex-col justify-between lg:justify-start items-center lg:items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Restante</span>
                    <span
                      class="font-bold lg:text-xl"
                      :class="caloriesRemaining >= 0 ? 'text-green-500' : 'text-red-500'"
                    >
                      {{ caloriesRemaining }}
                      <span class="text-xs font-normal">kcal</span>
                    </span>
                  </div>
                </div>

                <router-link
                  to="/meals"
                  class="mt-3 inline-flex items-center gap-1.5 text-sm text-primary-500 font-medium hover:text-primary-600 transition-colors"
                >
                  <PlusIcon class="w-4 h-4" />
                  Adicionar refeição
                </router-link>
              </div>
            </div>

            <!-- Macros -->
            <div class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <!-- Proteína -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Proteína</span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    <span class="font-semibold text-gray-700 dark:text-gray-200">{{ todaySummary.protein.consumed }}g</span>
                    / {{ todaySummary.protein.target }}g
                    <span class="ml-1 font-semibold text-blue-500">{{ todaySummary.protein.percentage }}%</span>
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill bg-blue-500" :style="{ width: `${Math.min(todaySummary.protein.percentage, 100)}%` }" />
                </div>
              </div>

              <!-- Carboidratos -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Carboidratos</span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    <span class="font-semibold text-gray-700 dark:text-gray-200">{{ todaySummary.carbs.consumed }}g</span>
                    / {{ todaySummary.carbs.target }}g
                    <span class="ml-1 font-semibold text-amber-500">{{ todaySummary.carbs.percentage }}%</span>
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill bg-amber-400" :style="{ width: `${Math.min(todaySummary.carbs.percentage, 100)}%` }" />
                </div>
              </div>

              <!-- Gordura -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Gordura</span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    <span class="font-semibold text-gray-700 dark:text-gray-200">{{ todaySummary.fat.consumed }}g</span>
                    / {{ todaySummary.fat.target }}g
                    <span class="ml-1 font-semibold text-purple-500">{{ todaySummary.fat.percentage }}%</span>
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill bg-purple-500" :style="{ width: `${Math.min(todaySummary.fat.percentage, 100)}%` }" />
                </div>
              </div>
            </div>
          </div>

          <!-- Ações Rápidas -->
          <div>
            <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Ações rápidas</h2>
            <div class="grid grid-cols-4 gap-3">
              <button
                v-for="action in quickActions"
                :key="action.name"
                @click="router.push(action.route)"
                class="flex flex-col items-center gap-2 p-3 lg:p-4 rounded-2xl bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <div
                  :class="[action.color, 'w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm']"
                >
                  <component :is="action.icon" class="w-5 h-5 text-white" />
                </div>
                <span class="text-xs text-gray-600 dark:text-gray-300 text-center font-medium leading-tight">
                  {{ action.name }}
                </span>
              </button>
            </div>
          </div>

          <!-- Banner de Onboarding -->
          <div v-if="!user?.goal" class="card bg-gradient-to-r from-primary-500 to-primary-600">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ArrowTrendingUpIcon class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-white mb-1">Complete seu perfil</h3>
                <p class="text-primary-100 text-sm mb-3">
                  Configure seus dados e objetivos para receber recomendações personalizadas.
                </p>
                <router-link
                  to="/onboarding"
                  class="inline-block px-4 py-2 bg-white text-primary-600 rounded-lg font-medium text-sm hover:bg-primary-50 transition-colors"
                >
                  Completar agora
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna direita: Indicadores + Motivação (1/3 da largura) -->
        <div class="space-y-4 lg:space-y-5">

          <!-- Mensagens de motivação -->
          <div v-if="motivationMessages.length" class="card !p-3 space-y-2">
            <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Hoje</p>
            <div
              v-for="(msg, index) in motivationMessages"
              :key="index"
              class="px-3 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-sm text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800/60 leading-snug"
            >
              {{ msg }}
            </div>
          </div>

          <!-- Card de Saúde / Indicadores -->
          <div v-if="user?.bmi" class="card">
            <h2 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <ChartBarIcon class="w-4 h-4 text-primary-500" />
              Seus Indicadores
            </h2>

            <div class="space-y-2">
              <div class="stat-row">
                <span class="text-sm text-gray-500 dark:text-gray-400">IMC</span>
                <div class="text-right">
                  <span class="font-bold text-gray-800 dark:text-white">{{ user.bmi }}</span>
                  <span
                    v-if="user.bmi_category"
                    :class="['ml-2 text-xs font-medium', bmiCategories[user.bmi_category]?.color]"
                  >{{ bmiCategories[user.bmi_category]?.label }}</span>
                </div>
              </div>

              <div class="stat-row">
                <span class="text-sm text-gray-500 dark:text-gray-400">Peso atual</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ user.weight }} kg</span>
              </div>

              <div v-if="user.body_fat_percentage" class="stat-row">
                <span class="text-sm text-gray-500 dark:text-gray-400">Gordura corporal</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ user.body_fat_percentage }}%</span>
              </div>

              <div class="stat-row">
                <span class="text-sm text-gray-500 dark:text-gray-400">Objetivo</span>
                <span class="text-sm font-semibold text-primary-500">{{ goalLabels[user.goal] || "Não definido" }}</span>
              </div>
            </div>

            <!-- Tipo Corporal -->
            <div
              v-if="user.body_type"
              class="mt-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/40"
            >
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tipo corporal</p>
              <p class="text-sm font-semibold text-primary-700 dark:text-primary-300">{{ bodyTypeLabels[user.body_type] || "Misto" }}</p>
              <p class="text-xs text-primary-500 dark:text-primary-400 mt-0.5">{{ bodyTypeDescriptions[user.body_type] || "" }}</p>
            </div>
          </div>

          <!-- Se não tem IMC mas tem motivação, garante que aparece o card vazio -->
          <div v-if="!user?.bmi && !user?.goal" class="card text-center py-10">
            <div class="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ArrowTrendingUpIcon class="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Perfil incompleto</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              Complete seu perfil para ver seus indicadores de saúde.
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
