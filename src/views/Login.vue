<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  FireIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const emailTouched = ref(false)
const passwordTouched = ref(false)

const emailError = computed(() => {
  if (!emailTouched.value) return ''
  if (!email.value) return 'Email é obrigatório'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) return 'Email inválido'
  return ''
})

const passwordError = computed(() => {
  if (!passwordTouched.value) return ''
  if (!password.value) return 'Senha é obrigatória'
  if (password.value.length < 6) return 'Mínimo 6 caracteres'
  return ''
})

const isFormValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

async function handleSubmit() {
  emailTouched.value = true
  passwordTouched.value = true

  if (!isFormValid.value) {
    toast.error('Verifique os campos do formulário')
    return
  }

  loading.value = true
  const result = await authStore.login(email.value, password.value)
  loading.value = false

  if (result.success) {
    toast.success('Bem-vindo de volta!')
    if (authStore.needsOnboarding) {
      router.push('/onboarding')
    } else {
      router.push('/')
    }
  } else {
    toast.error(result.message)
  }
}
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex">
    <!-- Coluna esquerda: Branding (apenas desktop) -->
    <div class="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-800 flex-col justify-between p-12">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <FireIcon class="w-6 h-6 text-white" />
        </div>
        <span class="text-2xl font-bold text-white">ToFitness</span>
      </div>

      <div>
        <h2 class="text-4xl font-bold text-white mb-4 leading-tight">
          Controle sua vida<br/>fitness com facilidade
        </h2>
        <p class="text-primary-200 text-lg mb-10">
          Registre refeições, acompanhe treinos e atinja seus objetivos.
        </p>

        <div class="space-y-4">
          <div class="flex items-center gap-3 text-white">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm">🍎</span>
            </div>
            <span class="text-primary-100">Diário alimentar com cálculo automático de macros</span>
          </div>
          <div class="flex items-center gap-3 text-white">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm">💪</span>
            </div>
            <span class="text-primary-100">Treinos personalizados por dia da semana</span>
          </div>
          <div class="flex items-center gap-3 text-white">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm">📊</span>
            </div>
            <span class="text-primary-100">Acompanhamento de IMC, peso e gordura corporal</span>
          </div>
          <div class="flex items-center gap-3 text-white">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm">🥗</span>
            </div>
            <span class="text-primary-100">Receitas e calculadora nutricional</span>
          </div>
        </div>
      </div>

      <p class="text-primary-300 text-sm">© 2026 ToFitness. Todos os direitos reservados.</p>
    </div>

    <!-- Coluna direita: Formulário -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 lg:max-w-md lg:mx-0">
      <div class="w-full max-w-sm lg:max-w-none">
        <!-- Logo mobile -->
        <div class="text-center mb-8 lg:text-left">
          <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-lg shadow-primary-500/30">
            <FireIcon class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">TO-FITNESS</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle sua vida fitness</p>
        </div>

        <!-- Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:p-8">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Entrar</h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Acesse sua conta para continuar</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <EnvelopeIcon class="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  v-model="email"
                  @blur="emailTouched = true"
                  type="email"
                  class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                  :class="emailError ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-primary-500'"
                  placeholder="seu@email.com"
                  autocomplete="email"
                />
              </div>
              <p v-if="emailError" class="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ emailError }}
              </p>
            </div>

            <!-- Senha -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                <button type="button" class="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">Esqueceu?</button>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockClosedIcon class="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  v-model="password"
                  @blur="passwordTouched = true"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                  :class="passwordError ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-primary-500'"
                  placeholder="Digite sua senha"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                >
                  <EyeSlashIcon v-if="showPassword" class="w-5 h-5" />
                  <EyeIcon v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="passwordError" class="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ passwordError }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
            </button>
          </form>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white dark:bg-gray-800 text-gray-500">ou continue com</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button type="button" class="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
            </button>
            <button type="button" class="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl transition-colors">
              <svg class="w-5 h-5 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Apple</span>
            </button>
          </div>
        </div>

        <p class="mt-6 text-center text-gray-600 dark:text-gray-400">
          Novo por aqui?
          <router-link to="/register" class="text-primary-500 hover:text-primary-600 font-semibold ml-1 transition-colors">Crie sua conta</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
