<template>
  <!-- Floating Bottom Capsule Dock (Hidden in Study view since Study has its own dedicated dock) -->
  <div 
    v-if="!$route.path.startsWith('/study')"
    class="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200/90 shadow-2xl rounded-full px-3 py-2 flex items-center gap-2"
  >
    <!-- Tab 1: Inicio / Categorías -->
    <router-link 
      to="/" 
      @click="vibrate"
      :class="[
        'transition-all duration-200 flex items-center justify-center',
        $route.path === '/' 
          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-bold px-4 h-12 rounded-full gap-2 scale-102' 
          : 'w-12 h-12 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-90'
      ]"
    >
      <LayoutGrid class="w-6 h-6" />
      <span v-if="$route.path === '/'" class="text-xs font-fredoka">Inicio</span>
    </router-link>

    <!-- Tab 2: Estudiar -->
    <router-link 
      :to="studyPath" 
      @click="vibrate"
      :class="[
        'transition-all duration-200 flex items-center justify-center',
        $route.path.startsWith('/study') 
          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold px-4 h-12 rounded-full gap-2 scale-102' 
          : 'w-12 h-12 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-90'
      ]"
    >
      <GraduationCap class="w-6 h-6" />
      <span v-if="$route.path.startsWith('/study')" class="text-xs font-fredoka">Estudiar</span>
    </router-link>

    <!-- Tab 3: Test / Quiz -->
    <router-link 
      :to="quizPath" 
      @click="vibrate"
      :class="[
        'transition-all duration-200 flex items-center justify-center',
        $route.path.startsWith('/quiz') 
          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 font-bold px-4 h-12 rounded-full gap-2 scale-102' 
          : 'w-12 h-12 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-90'
      ]"
    >
      <Gamepad2 class="w-6 h-6" />
      <span v-if="$route.path.startsWith('/quiz')" class="text-xs font-fredoka">Test</span>
    </router-link>

    <!-- Tab 4: Admin -->
    <router-link 
      to="/admin" 
      @click="vibrate"
      :class="[
        'transition-all duration-200 flex items-center justify-center',
        $route.path.startsWith('/admin') 
          ? 'bg-slate-800 text-white shadow-md shadow-slate-800/30 font-bold px-4 h-12 rounded-full gap-2 scale-102' 
          : 'w-12 h-12 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-90'
      ]"
    >
      <Settings class="w-6 h-6" />
      <span v-if="$route.path.startsWith('/admin')" class="text-xs font-fredoka">Admin</span>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { LayoutGrid, GraduationCap, Gamepad2, Settings } from 'lucide-vue-next'
import { getCategories } from '../services/db'

const studyPath = ref('/study/cat_house_parts')
const quizPath = ref('/quiz/cat_house_parts')

const vibrate = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10)
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
