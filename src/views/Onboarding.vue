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
      return true
    default:
      return false
  }
})

function skipOnboarding() {
  router.push('/')
}

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

function maskDecimal(value, maxIntegers = 3, maxDecimals = 1) {
  let v = value.replace(/[^\d,\.]/g, '').replace('.', ',')
  const parts = v.split(',')
  parts[0] = parts[0].slice(0, maxIntegers)
  if (parts.length > 1) {
    v = parts[0] + ',' + parts[1].replace(/\D/g, '').slice(0, maxDecimals)
  } else {
    v = parts[0]
  }
  return v
}

function maskInteger(value, maxDigits = 3) {
  return value.replace(/\D/g, '').slice(0, maxDigits)
}

function onWeightInput(e) {
  const masked = maskDecimal(e.target.value, 3, 1)
  formData.value.weight = masked
  e.target.value = masked
}

function onHeightInput(e) {
  const masked = maskInteger(e.target.value, 3)
  formData.value.height = masked
  e.target.value = masked
}

function onCircumferenceInput(field, e) {
  const masked = maskDecimal(e.target.value, 3, 1)
  formData.value[field] = masked
  e.target.value = masked
}

function parseDecimal(value) {
  if (!value) return null
  return Number(String(value).replace(',', '.'))
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
    const profileResult = await authStore.updateProfile({
      gender: formData.value.gender,
      age: Number(formData.value.age),
      weight: parseDecimal(formData.value.weight),
      height: parseDecimal(formData.value.height),
      waist_circumference: parseDecimal(formData.value.waist_circumference),
      neck_circumference: parseDecimal(formData.value.neck_circumference),
      hip_circumference: parseDecimal(formData.value.hip_circumference),
      activity_level: formData.value.activity_level,
      health_conditions: formData.value.health_conditions
    })

    if (!profileResult.success) {
      toast.error(profileResult.message)
      loading.value = false
      return
    }

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
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col">
    <!-- Header -->
    <div class="bg-white/10 backdrop-blur-sm border-b border-white/10">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-3">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="p-2 -ml-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div v-else class="w-9"></div>

          <p class="text-sm text-white/80 font-medium">Passo {{ currentStep }} de {{ totalSteps }}</p>

          <button
            @click="skipOnboarding"
            class="text-sm text-white/70 hover:text-white font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
          >
            Pular
          </button>
        </div>

        <!-- Barra de progresso -->
        <div class="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-white rounded-full transition-all duration-700 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Conteudo -->
    <div class="flex-1 flex flex-col overflow-y-auto">
      <div class="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8">

        <!-- Step 1: Dados Basicos -->
        <div v-if="currentStep === 1" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <UserIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Sobre Você</h2>
              <p class="text-white/60 text-sm">Informações básicas</p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-6 space-y-5">
            <!-- Gênero -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sexo biológico</label>
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
              <label for="age" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idade</label>
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
        </div>

        <!-- Step 2: Medidas Corporais -->
        <div v-if="currentStep === 2" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <ScaleIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Medidas Corporais</h2>
              <p class="text-white/60 text-sm">Para calcular seu IMC e metas</p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-6 space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Peso (kg)</label>
                <input
                  id="weight"
                  :value="formData.weight"
                  @input="onWeightInput"
                  type="text"
                  inputmode="decimal"
                  class="input"
                  placeholder="70,5"
                  maxlength="5"
                />
              </div>
              <div>
                <label for="height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Altura (cm)</label>
                <input
                  id="height"
                  :value="formData.height"
                  @input="onHeightInput"
                  type="text"
                  inputmode="numeric"
                  class="input"
                  placeholder="175"
                  maxlength="3"
                />
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Opcional: para cálculo de gordura corporal
              </p>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="waist" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cintura (cm)</label>
                  <input
                    id="waist"
                    :value="formData.waist_circumference"
                    @input="onCircumferenceInput('waist_circumference', $event)"
                    type="text"
                    inputmode="decimal"
                    class="input"
                    placeholder="80"
                    maxlength="5"
                  />
                </div>
                <div>
                  <label for="neck" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pescoço (cm)</label>
                  <input
                    id="neck"
                    :value="formData.neck_circumference"
                    @input="onCircumferenceInput('neck_circumference', $event)"
                    type="text"
                    inputmode="decimal"
                    class="input"
                    placeholder="38"
                    maxlength="5"
                  />
                </div>
              </div>
              <div v-if="formData.gender === 'female'" class="mt-4">
                <label for="hip" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quadril (cm)</label>
                <input
                  id="hip"
                  :value="formData.hip_circumference"
                  @input="onCircumferenceInput('hip_circumference', $event)"
                  type="text"
                  inputmode="decimal"
                  class="input"
                  placeholder="95"
                  maxlength="5"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Objetivo e Atividade -->
        <div v-if="currentStep === 3" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <FireIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Seu Objetivo</h2>
              <p class="text-white/60 text-sm">O que você quer alcançar?</p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-6 space-y-6">
            <!-- Objetivos -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selecione sua meta</label>
              <div class="space-y-2">
                <button
                  v-for="goal in goals"
                  :key="goal.value"
                  type="button"
                  @click="formData.goal = goal.value"
                  :class="[
                    'w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                    formData.goal === goal.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  ]"
                >
                  <span class="text-xl">{{ goal.icon }}</span>
                  <div>
                    <span class="font-semibold text-gray-800 dark:text-white text-sm block">{{ goal.label }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ goal.desc }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Nível de atividade -->
            <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Nível de Atividade Física</label>
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
                  <span class="font-medium text-gray-800 dark:text-white text-sm block">{{ level.label }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ level.desc }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Condições de Saúde -->
        <div v-if="currentStep === 4" class="animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <HeartIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Condições de Saúde</h2>
              <p class="text-white/60 text-sm">Para exercícios seguros (opcional)</p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Selecione as condições que se aplicam a você.
            </p>

            <div class="grid grid-cols-2 gap-2.5">
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

            <div class="mt-5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p class="text-xs text-amber-700 dark:text-amber-200">
                Consulte um médico antes de iniciar qualquer programa de exercícios.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer com botões -->
      <div class="bg-white/10 backdrop-blur-sm border-t border-white/10">
        <div class="max-w-2xl mx-auto px-4 py-4" style="padding-bottom: max(1rem, env(safe-area-inset-bottom))">
          <div class="flex gap-3">
            <button
              @click="skipOnboarding"
              class="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Pular
            </button>
            <button
              @click="nextStep"
              :disabled="!canProceed || loading"
              class="flex-[2] py-3 px-4 bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  </div>
</template>
