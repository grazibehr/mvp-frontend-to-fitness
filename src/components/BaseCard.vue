<script setup>
defineProps({
  padding: { type: String, default: 'p-4' },
  clickable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-surface-dark rounded-2xl shadow-sm border transition-all',
      padding,
      selected
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
        : 'border-gray-100 dark:border-gray-600',
      clickable ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 active:scale-[0.98]' : ''
    ]"
    @click="clickable ? emit('click') : null"
  >
    <slot></slot>
  </div>
</template>
