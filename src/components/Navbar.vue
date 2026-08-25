<template>
  <header class="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
          <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span class="text-xl lg:text-2xl animate-bounce-subtle">✨</span>
          </div>
        </div>
        <div>
          <h1 class="text-lg lg:text-xl font-bold font-fredoka bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Inglés para Amalia
          </h1>
          <p class="text-xs text-slate-400 font-medium hidden sm:block">Aprende jugando con imágenes y voz</p>
        </div>
      </router-link>

      <!-- Navigation Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Student Mode Link -->
        <router-link 
          to="/" 
          :class="[
            'px-3 sm:px-4 py-2 rounded-xl font-fredoka text-sm transition-all flex items-center gap-2',
            $route.path === '/' || $route.path.startsWith('/study') || $route.path.startsWith('/quiz')
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20 font-semibold'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          ]"
        >
          <Sparkles class="w-4 h-4 text-amber-300" />
          <span>Aprender</span>
        </router-link>

        <!-- Admin Mode Link -->
        <router-link 
          to="/admin" 
          :class="[
            'px-3 sm:px-4 py-2 rounded-xl font-fredoka text-sm transition-all flex items-center gap-2 border',
            $route.path.startsWith('/admin')
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20 font-semibold'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          ]"
        >
          <Settings class="w-4 h-4 text-indigo-400" />
          <span class="hidden sm:inline">Modulo</span> Administración
        </router-link>
      </div>

    </div>
  </header>
</template>

<script setup>
import { Sparkles, Settings } from 'lucide-vue-next'
</script>
