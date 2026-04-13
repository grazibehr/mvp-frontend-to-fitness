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
    router.push('/')
  } else {
    toast.error(result.message)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FireIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-white">TO-FITNESS</h1>
        <p class="text-primary-200 text-sm mt-1">Controle sua vida fitness</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">Entrar</h2>
          <p class="text-gray-500 text-sm mt-1">Acesse sua conta para continuar</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <EnvelopeIcon class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="email"
                @blur="emailTouched = true"
                type="email"
                class="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200"
                :class="emailError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'"
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
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="password"
                @blur="passwordTouched = true"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200"
                :class="passwordError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'"
                placeholder="Digite sua senha"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
      </div>

      <p class="mt-6 text-center text-primary-100">
        Novo por aqui?
        <router-link to="/register" class="text-white font-semibold ml-1 hover:underline transition-colors">Crie sua conta</router-link>
      </p>
    </div>
  </div>
</template>
