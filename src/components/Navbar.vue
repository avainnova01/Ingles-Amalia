<template>
  <header 
    class="hidden sm:flex sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 min-h-[64px] items-center transition-all"
  >
    <div class="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-500 p-0.5 shadow-md shadow-sky-500/10 group-hover:scale-105 transition-transform flex-shrink-0">
          <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <span class="text-xl lg:text-2xl animate-bounce-subtle">✨</span>
          </div>
        </div>
        <div>
          <h1 class="text-lg lg:text-xl font-bold font-fredoka text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">
            Inglés para Amalia
          </h1>
          <p class="text-[11px] text-slate-500 font-medium hidden sm:block">Aprende jugando con imágenes y voz</p>
        </div>
      </router-link>

      <!-- Desktop Navigation Actions -->
      <div class="hidden sm:flex items-center gap-2.5">
        <!-- Student Mode Link -->
        <router-link 
          to="/" 
          :class="[
            'px-4 py-2 rounded-2xl font-fredoka text-sm transition-all flex items-center gap-2',
            $route.path === '/' || $route.path.startsWith('/study') || $route.path.startsWith('/quiz')
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          ]"
        >
          <Sparkles class="w-4 h-4 text-amber-200" />
          <span>Aprender</span>
        </router-link>

        <!-- Admin Mode Link -->
        <router-link 
          to="/admin" 
          :class="[
            'px-4 py-2 rounded-2xl font-fredoka text-sm transition-all flex items-center gap-2 border',
            $route.path.startsWith('/admin')
              ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 font-semibold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <Settings class="w-4 h-4 text-slate-400" />
          <span>Administración</span>
        </router-link>
      </div>

      <!-- Mobile Top App Badge -->
      <div class="sm:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[11px] font-semibold text-sky-700 font-fredoka">
        <span>🌟 Modo Niña</span>
      </div>

    </div>
  </header>
</template>

<script setup>
import { Sparkles, Settings } from 'lucide-vue-next'
</script>
