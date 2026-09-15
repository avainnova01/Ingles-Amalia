<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white relative overflow-x-hidden pb-24 sm:pb-0">
    <!-- Main Top Navbar -->
    <Navbar />

    <!-- View Container -->
    <main class="flex-1 relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Native Mobile App Floating Bottom Navigation Bar -->
    <BottomTabBar />

    <!-- Clean Footer -->
    <footer class="hidden sm:block border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white/70 mt-auto">
      <p class="font-fredoka">Inglés para Amalia • Aprende jugando con imágenes y voz 🌟</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import BottomTabBar from './components/BottomTabBar.vue'
import { seedInitialDataIfEmpty } from './services/seedData'

onMounted(async () => {
  try {
    // Automatically populate Firebase Cloud Database on app startup if empty!
    await seedInitialDataIfEmpty()
  } catch (e) {
    console.error('App startup cloud sync error:', e)
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
