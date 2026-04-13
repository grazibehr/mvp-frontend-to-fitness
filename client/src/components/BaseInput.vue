<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

function handleInput(event) {
  const value = props.type === 'number' ? Number(event.target.value) : event.target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @input="handleInput"
      :class="[
        'w-full min-h-[44px] px-4 py-3 rounded-xl',
        'bg-white dark:bg-gray-700',
        'border-2 transition-colors duration-200',
        error
          ? 'border-red-500 focus:border-red-500'
          : 'border-gray-200 dark:border-gray-600 focus:border-primary-500',
        'text-gray-800 dark:text-gray-100',
        'placeholder-gray-400 dark:placeholder-gray-500',
        'focus:ring-0 focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ]"
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
