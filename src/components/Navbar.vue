<template>
  <header 
    :class="[
      'sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-2.5 pt-safe',
      $route.path.startsWith('/study') ? 'hidden sm:flex' : 'flex'
    ]"
  >
    <div class="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
          <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span class="text-xl lg:text-2xl animate-bounce-subtle">✨</span>
          </div>
        </div>
        <div>
          <h1 class="text-lg lg:text-xl font-bold font-fredoka bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-200 bg-clip-text text-transparent leading-tight">
            Inglés para Amalia
          </h1>
          <p class="text-[11px] text-slate-400 font-medium hidden sm:block">Aprende jugando con imágenes y voz</p>
        </div>
      </router-link>

      <!-- Desktop Navigation Actions -->
      <div class="hidden sm:flex items-center gap-3">
        <!-- Student Mode Link -->
        <router-link 
          to="/" 
          :class="[
            'px-4 py-2 rounded-xl font-fredoka text-sm transition-all flex items-center gap-2',
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
            'px-4 py-2 rounded-xl font-fredoka text-sm transition-all flex items-center gap-2 border',
            $route.path.startsWith('/admin')
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20 font-semibold'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          ]"
        >
          <Settings class="w-4 h-4 text-indigo-400" />
          <span>Módulo Administración</span>
        </router-link>
      </div>

      <!-- Mobile Top App Badge -->
      <div class="sm:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-semibold text-pink-300 font-fredoka">
        <span>🌟 Modo Niña</span>
      </div>

    </div>
  </header>
</template>

<script setup>
import { Sparkles, Settings } from 'lucide-vue-next'
</script>
