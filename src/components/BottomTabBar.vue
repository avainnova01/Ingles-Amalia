<template>
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 z-50 mobile-tab-bar pb-safe px-3 py-2 flex items-center justify-around">
    
    <!-- Tab 1: Inicio / Categorías -->
    <router-link 
      to="/" 
      @click="vibrate"
      :class="[
        'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 relative',
        $route.path === '/' ? 'text-pink-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
      ]"
    >
      <Home class="w-6 h-6 mb-1 transition-transform group-active:scale-95" />
      <span class="text-[11px] font-fredoka">Inicio</span>
      <span v-if="$route.path === '/'" class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-pink-400 shadow-lg shadow-pink-500/80"></span>
    </router-link>

    <!-- Tab 2: Estudiar -->
    <router-link 
      :to="studyPath" 
      @click="vibrate"
      :class="[
        'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 relative',
        $route.path.startsWith('/study') ? 'text-purple-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
      ]"
    >
      <BookOpen class="w-6 h-6 mb-1" />
      <span class="text-[11px] font-fredoka">Estudiar</span>
      <span v-if="$route.path.startsWith('/study')" class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-lg shadow-purple-500/80"></span>
    </router-link>

    <!-- Tab 3: Test / Juego -->
    <router-link 
      :to="quizPath" 
      @click="vibrate"
      :class="[
        'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 relative',
        $route.path.startsWith('/quiz') ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
      ]"
    >
      <div class="relative">
        <Gamepad2 class="w-6 h-6 mb-1" />
        <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
      </div>
      <span class="text-[11px] font-fredoka">Hacer Test</span>
      <span v-if="$route.path.startsWith('/quiz')" class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-500/80"></span>
    </router-link>

    <!-- Tab 4: Administración (Padres) -->
    <router-link 
      to="/admin" 
      @click="vibrate"
      :class="[
        'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 relative',
        $route.path.startsWith('/admin') ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
      ]"
    >
      <Settings class="w-6 h-6 mb-1" />
      <span class="text-[11px] font-fredoka">Admin</span>
      <span v-if="$route.path.startsWith('/admin')" class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-500/80"></span>
    </router-link>

  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Home, BookOpen, Gamepad2, Settings } from 'lucide-vue-next'
import { getCategories } from '../services/db'

const studyPath = ref('/study/cat_house_parts')
const quizPath = ref('/quiz/cat_house_parts')

const vibrate = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10) // Light native haptic touch feedback
  }
}

onMounted(async () => {
  try {
    const list = await getCategories()
    if (list && list.length > 0) {
      studyPath.value = `/study/${list[0].id}`
      quizPath.value = `/quiz/${list[0].id}`
    }
  } catch (e) {
    console.error('Error fetching categories for tab bar:', e)
  }
})
</script>
