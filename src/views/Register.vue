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
  UserIcon,
  FireIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

const nameTouched = ref(false)
const emailTouched = ref(false)
const passwordTouched = ref(false)
const confirmTouched = ref(false)

const nameError = computed(() => {
  if (!nameTouched.value) return ''
  if (!name.value) return 'Nome é obrigatório'
  if (name.value.length < 2) return 'Nome muito curto'
  return ''
})

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

const confirmError = computed(() => {
  if (!confirmTouched.value) return ''
  if (!confirmPassword.value) return 'Confirme sua senha'
  if (password.value !== confirmPassword.value) return 'Senhas não coincidem'
  return ''
})

const passwordStrength = computed(() => {
  if (!password.value) return { level: 0, text: '', color: '' }
  let score = 0
  if (password.value.length >= 6) score++
  if (password.value.length >= 8) score++
  if (/[A-Z]/.test(password.value)) score++
  if (/[0-9]/.test(password.value)) score++
  if (/[^A-Za-z0-9]/.test(password.value)) score++
  if (score <= 2) return { level: score, text: 'Fraca', color: 'bg-red-500' }
  if (score <= 3) return { level: score, text: 'Média', color: 'bg-yellow-500' }
  return { level: score, text: 'Forte', color: 'bg-green-500' }
})

const isFormValid = computed(() => {
  return name.value && email.value && password.value && confirmPassword.value &&
    !nameError.value && !emailError.value && !passwordError.value && !confirmError.value
})

async function handleSubmit() {
  nameTouched.value = true
  emailTouched.value = true
  passwordTouched.value = true
  confirmTouched.value = true

  if (!isFormValid.value) {
    toast.error('Verifique os campos do formulário')
    return
  }

  loading.value = true
  const result = await authStore.register({ name: name.value, email: email.value, password: password.value })
  loading.value = false

  if (result.success) {
    toast.success('Conta criada com sucesso!')
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
          <h2 class="text-xl font-bold text-gray-900">Criar conta</h2>
          <p class="text-gray-500 text-sm mt-1">Preencha seus dados para começar</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nome -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="name"
                v-model="name"
                @blur="nameTouched = true"
                type="text"
                class="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none"
                :class="nameError ? 'border-red-300' : 'border-gray-200 focus:border-primary-500'"
                placeholder="Seu nome"
                autocomplete="name"
              />
            </div>
            <p v-if="nameError" class="mt-1.5 text-xs text-red-500">{{ nameError }}</p>
          </div>

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
                class="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none"
                :class="emailError ? 'border-red-300' : 'border-gray-200 focus:border-primary-500'"
                placeholder="seu@email.com"
                autocomplete="email"
              />
            </div>
            <p v-if="emailError" class="mt-1.5 text-xs text-red-500">{{ emailError }}</p>
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
                class="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none"
                :class="passwordError ? 'border-red-300' : 'border-gray-200 focus:border-primary-500'"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeSlashIcon v-if="showPassword" class="w-5 h-5" />
                <EyeIcon v-else class="w-5 h-5" />
              </button>
            </div>
            <!-- Força da senha -->
            <div v-if="password" class="mt-2">
              <div class="flex gap-1 mb-1">
                <div v-for="i in 5" :key="i" class="h-1 flex-1 rounded-full transition-colors"
                  :class="i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'"
                />
              </div>
              <p class="text-xs" :class="passwordStrength.color.replace('bg-', 'text-')">
                Senha {{ passwordStrength.text }}
              </p>
            </div>
            <p v-if="passwordError" class="mt-1.5 text-xs text-red-500">{{ passwordError }}</p>
          </div>

          <!-- Confirmar Senha -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                @blur="confirmTouched = true"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none"
                :class="[
                  confirmError ? 'border-red-300' :
                  confirmPassword && !confirmError ? 'border-green-400' :
                  'border-gray-200 focus:border-primary-500'
                ]"
                placeholder="Digite a senha novamente"
                autocomplete="new-password"
              />
              <div v-if="confirmPassword && !confirmError" class="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                <CheckCircleIcon class="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p v-if="confirmError" class="mt-1.5 text-xs text-red-500">{{ confirmError }}</p>
          </div>

          <!-- Botão -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{{ loading ? 'Criando conta...' : 'Criar conta' }}</span>
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-primary-100">
        Já tem uma conta?
        <router-link to="/login" class="text-white font-semibold ml-1 hover:underline transition-colors">Fazer login</router-link>
      </p>
    </div>
  </div>
</template>
