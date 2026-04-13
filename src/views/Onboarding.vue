<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ScaleIcon,
  UserIcon,
  FireIcon,
  HeartIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const currentStep = ref(1)
const totalSteps = 4
const loading = ref(false)

// Dados do formulário
const formData = ref({
  gender: '',
  age: '',
  weight: '',
  height: '',
  waist_circumference: '',
  neck_circumference: '',
  hip_circumference: '',
  activity_level: '',
  goal: '',
  health_conditions: []
})

const goals = [
  { value: 'lose_weight', label: 'Perder Peso', icon: '⚖️', desc: 'Reduzir o peso corporal de forma saudável' },
  { value: 'lose_fat', label: 'Perder Gordura', icon: '🔥', desc: 'Diminuir gordura mantendo massa muscular' },
  { value: 'gain_muscle', label: 'Ganhar Músculo', icon: '💪', desc: 'Aumentar massa muscular e força' },
  { value: 'maintain', label: 'Manter Peso', icon: '⚡', desc: 'Manter o peso e forma física atual' },
  { value: 'improve_health', label: 'Melhorar Saúde', icon: '❤️', desc: 'Foco em saúde geral e bem-estar' }
]

const activityLevels = [
  { value: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
  { value: 'light', label: 'Levemente Ativo', desc: 'Exercício leve 1-3 dias/semana' },
  { value: 'moderate', label: 'Moderadamente Ativo', desc: 'Exercício moderado 3-5 dias/semana' },
  { value: 'active', label: 'Muito Ativo', desc: 'Exercício intenso 6-7 dias/semana' },
  { value: 'very_active', label: 'Extremamente Ativo', desc: 'Exercício muito intenso + trabalho físico' }
]

const healthConditions = [
  { code: 'hypertension', label: 'Hipertensão' },
  { code: 'diabetes', label: 'Diabetes' },
  { code: 'heart_disease', label: 'Problemas Cardíacos' },
  { code: 'back_pain', label: 'Dor nas Costas' },
  { code: 'knee_problems', label: 'Problemas no Joelho' },
  { code: 'shoulder_injury', label: 'Lesão no Ombro' },
  { code: 'asthma', label: 'Asma' },
  { code: 'obesity', label: 'Obesidade' },
  { code: 'pregnancy', label: 'Gestante' },
  { code: 'elderly', label: 'Idoso (65+)' }
]

const progress = computed(() => (currentStep.value / totalSteps) * 100)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.gender && formData.value.age
    case 2:
      return formData.value.weight && formData.value.height
    case 3:
      return formData.value.activity_level && formData.value.goal
    case 4:
      return true // Condições de saúde são opcionais
    default:
      return false
  }
})

function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  } else {
    submitOnboarding()
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function toggleCondition(code) {
  const index = formData.value.health_conditions.indexOf(code)
  if (index > -1) {
    formData.value.health_conditions.splice(index, 1)
  } else {
    formData.value.health_conditions.push(code)
  }
}

async function submitOnboarding() {
  loading.value = true

  try {
    // Primeiro atualiza o perfil com dados físicos
    const profileResult = await authStore.updateProfile({
      gender: formData.value.gender,
      age: Number(formData.value.age),
      weight: Number(formData.value.weight),
      height: Number(formData.value.height),
      waist_circumference: formData.value.waist_circumference ? Number(formData.value.waist_circumference) : null,
      neck_circumference: formData.value.neck_circumference ? Number(formData.value.neck_circumference) : null,
      hip_circumference: formData.value.hip_circumference ? Number(formData.value.hip_circumference) : null,
      activity_level: formData.value.activity_level,
      health_conditions: formData.value.health_conditions
    })

    if (!profileResult.success) {
      toast.error(profileResult.message)
      loading.value = false
      return
    }

    // Depois define os objetivos
    const goalsResult = await authStore.updateGoals({
      goal: formData.value.goal,
      activity_level: formData.value.activity_level
    })

    if (goalsResult.success) {
      toast.success('Perfil configurado com sucesso!')
      router.push('/')
    } else {
      toast.error(goalsResult.message)
    }
  } catch (error) {
    toast.error('Erro ao salvar dados')
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
    <!-- Header com progresso -->
    <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4 mb-4">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div v-else class="w-9"></div>
          <div class="flex-1 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Passo {{ currentStep }} de {{ totalSteps }}</p>
          </div>
          <span class="text-sm font-medium text-primary-500 w-9 text-right">{{ Math.round(progress) }}%</span>
        </div>

        <!-- Barra de progresso -->
        <div class="progress-bar">
          <div
            class="progress-bar-fill"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Conteúdo centralizado -->
    <div class="flex-1 flex flex-col">
      <div class="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
        <!-- Step 1: Dados Básicos -->
        <div v-if="currentStep === 1" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <UserIcon class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">Sobre Você</h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Informações básicas</p>
            </div>
          </div>

          <div class="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
            <!-- Gênero -->
            <div class="space-y-6">
              <div>
                <label class="input-label">Sexo biológico</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    @click="formData.gender = 'male'"
                    :class="[
                      'p-4 rounded-xl border-2 text-left transition-all',
                      formData.gender === 'male'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    ]"
                  >
                    <span class="text-2xl mb-2 block">👨</span>
                    <span class="font-medium text-gray-800 dark:text-white">Masculino</span>
                  </button>
                  <button
                    type="button"
                    @click="formData.gender = 'female'"
                    :class="[
                      'p-4 rounded-xl border-2 text-left transition-all',
                      formData.gender === 'female'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    ]"
                  >
                    <span class="text-2xl mb-2 block">👩</span>
                    <span class="font-medium text-gray-800 dark:text-white">Feminino</span>
                  </button>
                </div>
              </div>

              <!-- Idade -->
              <div>
                <label for="age" class="input-label">Idade</label>
                <input
                  id="age"
                  v-model="formData.age"
                  type="number"
                  class="input"
                  placeholder="Ex: 25"
                  min="10"
                  max="120"
                />
              </div>
            </div>

            <!-- Info desktop -->
            <div class="hidden lg:flex flex-col justify-center p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
              <div class="text-4xl mb-4">👤</div>
              <h3 class="font-semibold text-gray-800 dark:text-white mb-2">Por que precisamos dessas informações?</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Seu sexo biológico e idade são essenciais para calcular com precisão seu metabolismo basal (TMB) e as calorias diárias ideais para seus objetivos.</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Medidas Corporais -->
        <div v-if="currentStep === 2" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <ScaleIcon class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">Medidas Corporais</h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Para calcular seu IMC e metas</p>
            </div>
          </div>

          <div class="lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0">
            <div class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <!-- Peso -->
                <div>
                  <label for="weight" class="input-label">Peso (kg)</label>
                  <input
                    id="weight"
                    v-model="formData.weight"
                    type="number"
                    step="0.1"
                    class="input"
                    placeholder="70.5"
                  />
                </div>

                <!-- Altura -->
                <div>
                  <label for="height" class="input-label">Altura (cm)</label>
                  <input
                    id="height"
                    v-model="formData.height"
                    type="number"
                    class="input"
                    placeholder="175"
                  />
                </div>
              </div>
            </div>

            <!-- Medidas opcionais para gordura corporal -->
            <div class="pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                Opcional: para cálculo de gordura corporal
              </p>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="waist" class="input-label">Cintura (cm)</label>
                  <input
                    id="waist"
                    v-model="formData.waist_circumference"
                    type="number"
                    class="input"
                    placeholder="80"
                  />
                </div>
                <div>
                  <label for="neck" class="input-label">Pescoço (cm)</label>
                  <input
                    id="neck"
                    v-model="formData.neck_circumference"
                    type="number"
                    class="input"
                    placeholder="38"
                  />
                </div>
              </div>

              <div v-if="formData.gender === 'female'" class="mt-4">
                <label for="hip" class="input-label">Quadril (cm)</label>
                <input
                  id="hip"
                  v-model="formData.hip_circumference"
                  type="number"
                  class="input"
                  placeholder="95"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Objetivo e Atividade -->
        <div v-if="currentStep === 3" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <FireIcon class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">Seu Objetivo</h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm">O que você quer alcançar?</p>
            </div>
          </div>

          <div class="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
            <!-- Objetivos -->
            <div>
              <label class="input-label mb-3">Selecione sua meta</label>
              <div class="space-y-3">
                <button
                  v-for="goal in goals"
                  :key="goal.value"
                  type="button"
                  @click="formData.goal = goal.value"
                  :class="[
                    'w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4',
                    formData.goal === goal.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  ]"
                >
                  <span class="text-2xl">{{ goal.icon }}</span>
                  <div>
                    <span class="font-semibold text-gray-800 dark:text-white block">{{ goal.label }}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ goal.desc }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Nível de atividade -->
            <div class="pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700">
              <label class="input-label mb-3">Nível de Atividade Física</label>
              <div class="space-y-2">
                <button
                  v-for="level in activityLevels"
                  :key="level.value"
                  type="button"
                  @click="formData.activity_level = level.value"
                  :class="[
                    'w-full p-3 rounded-xl border-2 text-left transition-all',
                    formData.activity_level === level.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  ]"
                >
                  <span class="font-medium text-gray-800 dark:text-white block">{{ level.label }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ level.desc }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Condições de Saúde -->
        <div v-if="currentStep === 4" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <HeartIcon class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">Condições de Saúde</h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Para exercícios seguros (opcional)</p>
            </div>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Selecione as condições que se aplicam a você. Isso nos ajuda a recomendar exercícios seguros.
          </p>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              v-for="condition in healthConditions"
              :key="condition.code"
              type="button"
              @click="toggleCondition(condition.code)"
              :class="[
                'p-3 rounded-xl border-2 text-left transition-all',
                formData.health_conditions.includes(condition.code)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              ]"
            >
              <span class="font-medium text-sm text-gray-800 dark:text-white">{{ condition.label }}</span>
            </button>
          </div>

          <div class="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <p class="text-sm text-amber-800 dark:text-amber-200">
              Consulte um médico antes de iniciar qualquer programa de exercícios, especialmente se tiver condições de saúde.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer com botão -->
      <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div class="max-w-3xl mx-auto p-4" style="padding-bottom: max(1rem, env(safe-area-inset-bottom))">
          <button
            @click="nextStep"
            :disabled="!canProceed || loading"
            class="btn-primary w-full flex items-center justify-center gap-2"
          >
            <span v-if="loading">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </span>
            <template v-else>
              <span>{{ currentStep === totalSteps ? 'Concluir' : 'Continuar' }}</span>
              <CheckIcon v-if="currentStep === totalSteps" class="w-5 h-5" />
              <ArrowRightIcon v-else class="w-5 h-5" />
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
