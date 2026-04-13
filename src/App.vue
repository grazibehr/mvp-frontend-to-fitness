<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import BottomNavigation from "@/components/BottomNavigation.vue";
import SideNavigation from "@/components/SideNavigation.vue";
import ToastNotification from "@/components/ToastNotification.vue";

const route = useRoute();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const showNavigation = ref(true);

const hiddenNavRoutes = ["login", "register", "onboarding"];

watch(
  () => route.name,
  (name) => {
    showNavigation.value = !hiddenNavRoutes.includes(name);
  },
);

onMounted(() => {
  themeStore.initTheme();
  showNavigation.value = !hiddenNavRoutes.includes(route.name);
});
</script>

<template>
  <div :class="{ dark: themeStore.isDark }">
    <ToastNotification />

    <SideNavigation v-if="authStore.isAuthenticated && showNavigation" />

    <main
      class="min-h-screen transition-colors duration-200 main-content"
      :class="{
        'lg:ml-64': authStore.isAuthenticated && showNavigation,
        'bg-background-light dark:bg-background-dark': showNavigation,
      }"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation - Mobile -->
    <BottomNavigation v-if="authStore.isAuthenticated && showNavigation" />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
