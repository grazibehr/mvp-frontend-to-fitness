import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/Onboarding.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/foods',
    name: 'foods',
    component: () => import('@/views/Foods.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('@/views/FoodCalculator.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/meals',
    name: 'meals',
    component: () => import('@/views/Meals.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pantry',
    name: 'pantry',
    component: () => import('@/views/Pantry.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: () => import('@/views/Recipes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exercises',
    name: 'exercises',
    component: () => import('@/views/Exercises.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts',
    name: 'workouts',
    component: () => import('@/views/Workouts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
