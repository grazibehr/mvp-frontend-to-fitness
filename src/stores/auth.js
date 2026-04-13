import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, user as userApi } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const needsOnboarding = computed(() => user.value && !user.value.goal)

  async function login(email, password) {
    try {
      const data = await auth.login(email, password)
      token.value = data.token
      user.value = data.user
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || 'Email ou senha incorretos' }
    }
  }

  async function register(data) {
    try {
      const result = await auth.register(data.email, data.password, data.name)
      token.value = result.token
      user.value = result.user
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || 'Erro ao criar conta' }
    }
  }

  async function fetchProfile() {
    try {
      const profile = await userApi.getProfile()
      user.value = profile
      localStorage.setItem('user', JSON.stringify(profile))
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async function updateProfile(data) {
    try {
      const result = await userApi.updateProfile(data)

      // Atualizar user local com os novos dados
      user.value = { ...user.value, ...data }

      // Se a API retornou targets, atualizar também
      if (result.targets) {
        user.value.daily_calorie_target = result.targets.daily_calorie_target
        user.value.daily_protein_target = result.targets.daily_protein_target
        user.value.daily_carbs_target = result.targets.daily_carbs_target
        user.value.daily_fat_target = result.targets.daily_fat_target
      }

      // Calcular IMC localmente para exibição
      if (data.weight && data.height) {
        const h = data.height / 100
        const bmi = Number((data.weight / (h * h)).toFixed(1))
        let bmi_category = 'normal'
        if (bmi < 18.5) bmi_category = 'underweight'
        else if (bmi >= 25 && bmi < 30) bmi_category = 'overweight'
        else if (bmi >= 30 && bmi < 35) bmi_category = 'obese_1'
        else if (bmi >= 35) bmi_category = 'obese_2'

        let body_type = 'mesomorph'
        if (bmi < 20) body_type = 'ectomorph'
        else if (bmi >= 26) body_type = 'endomorph'

        user.value.bmi = bmi
        user.value.bmi_category = bmi_category
        user.value.body_type = body_type
      }

      localStorage.setItem('user', JSON.stringify(user.value))
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || 'Erro ao atualizar perfil' }
    }
  }

  async function updateGoals(data) {
    try {
      // Combinar dados existentes com novos
      const profileData = {
        ...data,
        weight: user.value?.weight,
        height: user.value?.height,
        age: user.value?.age,
        gender: user.value?.gender
      }

      const result = await userApi.updateProfile(profileData)

      // Atualizar user local
      user.value = { ...user.value, ...data }

      if (result.targets) {
        user.value.daily_calorie_target = result.targets.daily_calorie_target
        user.value.daily_protein_target = result.targets.daily_protein_target
        user.value.daily_carbs_target = result.targets.daily_carbs_target
        user.value.daily_fat_target = result.targets.daily_fat_target
      }

      localStorage.setItem('user', JSON.stringify(user.value))
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || 'Erro ao atualizar objetivos' }
    }
  }

  function logout() {
    auth.logout()
    token.value = null
    user.value = null
  }

  return {
    user,
    token,
    isAuthenticated,
    needsOnboarding,
    login,
    register,
    fetchProfile,
    updateProfile,
    updateGoals,
    logout
  }
})
