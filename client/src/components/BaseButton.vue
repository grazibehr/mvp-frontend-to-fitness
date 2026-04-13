<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false }
})

const buttonClass = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300',
    secondary: 'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50 active:bg-primary-100 dark:bg-gray-700 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-gray-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
  }

  const sizes = {
    sm: 'min-h-[36px] px-4 py-2 text-sm',
    md: 'min-h-[44px] px-6 py-3',
    lg: 'min-h-[52px] px-8 py-4 text-lg'
  }

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.fullWidth ? 'w-full' : ''
  ].join(' ')
})
</script>

<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading"
  >
    <svg
      v-if="loading"
      class="animate-spin w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <slot v-else></slot>
  </button>
</template>
