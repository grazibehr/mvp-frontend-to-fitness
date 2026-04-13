import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - adiciona token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH ====================
export const auth = {
  async register(email, password, name) {
    const { data } = await api.post('/auth/register', { email, password, name })
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

// ==================== USER ====================
export const user = {
  async getProfile() {
    const { data } = await api.get('/users/profile')
    return data
  },

  async updateProfile(profileData) {
    const { data } = await api.put('/users/profile', profileData)
    // Atualizar user no localStorage
    const currentUser = auth.getUser()
    if (currentUser && profileData.name) {
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...profileData }))
    }
    return data
  }
}

// ==================== EXERCISES ====================
export const exercises = {
  async list(params = {}) {
    const { data } = await api.get('/exercises', { params })
    return data
  },

  async getMuscleGroups() {
    const { data } = await api.get('/exercises/muscle-groups')
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/exercises/${id}`)
    return data
  }
}

// ==================== WORKOUTS ====================
export const workouts = {
  async list() {
    const { data } = await api.get('/workouts')
    return data
  },

  async create(workout) {
    const { data } = await api.post('/workouts', workout)
    return data
  },

  async update(id, workout) {
    const { data } = await api.put(`/workouts/${id}`, workout)
    return data
  },

  async delete(id) {
    const { data } = await api.delete(`/workouts/${id}`)
    return data
  },

  async getHistory() {
    const { data } = await api.get('/workouts/history')
    return data
  },

  async saveHistory(historyData) {
    const { data } = await api.post('/workouts/history', historyData)
    return data
  }
}

// ==================== FOODS ====================
export const foods = {
  async list(params = {}) {
    const { data } = await api.get('/foods', { params })
    return data
  },

  async getCategories() {
    const { data } = await api.get('/foods/categories')
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/foods/${id}`)
    return data
  },

  async create(food) {
    const { data } = await api.post('/foods', food)
    return data
  },

  // Busca externa (Open Food Facts)
  async search(query) {
    const { data } = await api.get('/external/foods/search', { params: { query }, timeout: 35000 })
    return data
  },

  async getByBarcode(barcode) {
    const { data } = await api.get(`/external/foods/barcode/${barcode}`, { timeout: 35000 })
    return data
  }
}

// ==================== MEALS ====================
export const meals = {
  async list(date) {
    const params = date ? { date } : {}
    const { data } = await api.get('/meals', { params })
    return data
  },

  async getSummary(date) {
    const params = date ? { date } : {}
    const { data } = await api.get('/meals/summary', { params })
    return data
  },

  async create(meal) {
    const { data } = await api.post('/meals', meal)
    return data
  },

  async addItem(mealId, item) {
    const { data } = await api.post(`/meals/${mealId}/items`, item)
    return data
  },

  async removeItem(itemId) {
    const { data } = await api.delete(`/meals/items/${itemId}`)
    return data
  },

  async delete(id) {
    const { data } = await api.delete(`/meals/${id}`)
    return data
  }
}

// ==================== EXTERNAL EXERCISES ====================
export const externalExercises = {
  async search(query, language = 4, limit = 20, offset = 0, category = 0) {
    const { data } = await api.get('/external/exercises/search', { params: { query, language, limit, offset, category } })
    return data
  },

  async getCategories() {
    const { data } = await api.get('/external/exercises/categories')
    return data
  },

  async getMuscles() {
    const { data } = await api.get('/external/exercises/muscles')
    return data
  }
}

// ==================== RECIPES ====================
export const recipes = {
  async search(query = '', category = '') {
    const { data } = await api.get('/external/recipes/search', { params: { query, category }, timeout: 30000 })
    return data
  },

  async getCategories() {
    const { data } = await api.get('/external/recipes/categories')
    return data
  }
}

export default api
