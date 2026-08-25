<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white relative overflow-x-hidden pb-20 sm:pb-0">
    <!-- Ambient glowing light blobs in background -->
    <div class="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

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

    <!-- Native Mobile App Bottom Navigation Bar -->
    <BottomTabBar />

    <!-- Footer (Hidden on small mobile screens to keep app feel clean) -->
    <footer class="hidden sm:block border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 glass-panel mt-auto">
      <p class="font-fredoka">Inglés para Amalia • Aprende jugando con imágenes y voz 🌟</p>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import BottomTabBar from './components/BottomTabBar.vue'
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
