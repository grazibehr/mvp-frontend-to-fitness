<script setup>
import { useSlots } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: { type: String, required: true },
  maxHeight: { type: String, default: '85vh' },
  zIndex: { type: String, default: 'z-50' },
  showFooter: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])
const slots = useSlots()
</script>

<template>
  <Teleport to="body">
    <div
      :class="['fixed inset-0 flex items-end justify-center bg-black/50', zIndex]"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl flex flex-col animate-slide-up"
        :style="`max-height: ${maxHeight}`"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
            {{ title }}
          </h2>
          <button
            @click="emit('close')"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <XMarkIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Conteudo -->
        <div class="flex-1 overflow-y-auto p-4 min-h-0">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div
          v-if="slots.footer || showFooter"
          class="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0 safe-area-bottom"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
