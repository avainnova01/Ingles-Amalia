<template>
  <div class="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    
    <!-- Hero Banner for Amalia -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-6 sm:p-10 mb-10 shadow-2xl shadow-purple-900/30">
      <!-- Background floating stars & decorations -->
      <div class="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute right-20 bottom-0 text-7xl opacity-20 pointer-events-none animate-float">🚀</div>
      <div class="absolute left-1/3 top-2 text-4xl opacity-30 pointer-events-none">⭐</div>

      <div class="relative z-10 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold font-fredoka uppercase tracking-wider mb-4 border border-white/10">
          <span>🌟 Aprende Jugando</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-bold font-fredoka text-white tracking-tight mb-3 leading-tight">
          ¡Hola Amalia! 👋
        </h2>
        <p class="text-base sm:text-xl text-purple-100 font-medium">
          Selecciona una categoría para escuchar las palabras, mirar sus imágenes y poner a prueba lo que aprendiste.
        </p>
      </div>
    </div>

    <!-- Category Grid Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-2xl font-bold font-fredoka text-slate-100 flex items-center gap-2">
          <span>📚 Categorías de Estudio</span>
        </h3>
        <p class="text-sm text-slate-400">Escoge un grupo para practicar</p>
      </div>

      <router-link 
        to="/admin" 
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
      >
        <span>+ Agregar nueva categoría</span>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 rounded-3xl bg-slate-800/50 animate-pulse border border-slate-800"></div>
    </div>

    <!-- Categories Grid -->
    <div v-else-if="categories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <div 
        v-for="cat in categories" 
        :key="cat.id"
        class="group relative glass-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between overflow-hidden"
      >
        <!-- Top accent color bar -->
        <div :class="['absolute top-0 left-0 right-0 h-2 bg-gradient-to-r', cat.color || 'from-indigo-500 to-purple-500']"></div>

        <div>
          <div class="flex items-start justify-between mb-4">
            <div class="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
              {{ cat.icon || '📘' }}
            </div>
            
            <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/60">
              {{ wordCounts[cat.id] || 0 }} {{ (wordCounts[cat.id] === 1) ? 'palabra' : 'palabras' }}
            </span>
          </div>

          <h4 class="text-2xl font-bold font-fredoka text-white group-hover:text-pink-400 transition-colors mb-1">
            {{ cat.name }}
          </h4>
          <p class="text-sm font-semibold text-indigo-300 mb-6">
            {{ cat.englishName || cat.name }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
          <router-link 
            :to="`/study/${cat.id}`"
            class="px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-fredoka font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen class="w-4 h-4" />
            <span>Estudiar</span>
          </router-link>

          <router-link 
            :to="`/quiz/${cat.id}`"
            class="px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-fredoka font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Gamepad2 class="w-4 h-4" />
            <span>Hacer Test</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 glass-card rounded-3xl p-8 max-w-lg mx-auto">
      <span class="text-6xl mb-4 block">📦</span>
      <h3 class="text-xl font-bold font-fredoka text-white mb-2">No hay categorías guardadas aún</h3>
      <p class="text-slate-400 text-sm mb-6">Ve al módulo administrativo para subir tus primeras palabras e imágenes.</p>
      <router-link to="/admin" class="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-fredoka font-bold">
        Ir al Módulo Administrativo
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BookOpen, Gamepad2 } from 'lucide-vue-next'
import { getCategories, getWordsByCategory } from '../services/db'
import { seedInitialDataIfEmpty } from '../services/seedData'

const categories = ref([])
const wordCounts = ref({})
const loading = ref(true)

const loadData = async () => {
  loading.value = true
  try {
    // Seed initial dataset if empty
    await seedInitialDataIfEmpty()

    const list = await getCategories()
    categories.value = list

    // Load word count per category
    const counts = {}
    for (const cat of list) {
      const words = await getWordsByCategory(cat.id)
      counts[cat.id] = words.length
    }
    wordCounts.value = counts
  } catch (error) {
    console.error('Error loading home categories:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
