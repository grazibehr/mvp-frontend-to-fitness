<script setup>
import { useToastStore } from '@/stores/toast'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'

const toastStore = useToastStore()

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon
}
</script>

<template>
  <div
    class="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['toast pointer-events-auto', `toast-${toast.type}`]"
        role="alert"
      >
        <component
          :is="icons[toast.type]"
          class="w-5 h-5 flex-shrink-0"
          aria-hidden="true"
        />
        <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
        <button
          @click="toastStore.remove(toast.id)"
          class="p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Fechar notificação"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  animation: slideDown 0.3s ease-out;
}

.toast-leave-active {
  animation: slideUp 0.2s ease-in forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
