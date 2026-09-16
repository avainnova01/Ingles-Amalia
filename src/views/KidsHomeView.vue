<template>
  <div class="min-h-[calc(100vh-80px)] py-4 sm:py-8 px-3.5 sm:px-6 lg:px-8 max-w-5xl mx-auto">
    
    <!-- Welcoming Header (Clean & Soft) -->
    <div class="flex items-center justify-between gap-4 mb-6 sm:mb-8 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-sm">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold font-fredoka uppercase tracking-wider mb-2 border border-sky-100">
          <span>🌟 Aprende Jugando</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-bold font-fredoka text-slate-800 tracking-tight">
          ¡Hola Amalia! 👋
        </h2>
        <p class="text-xs sm:text-base text-slate-500 font-medium mt-0.5">
          Elige una categoría para mirar sus dibujos y escuchar cómo se pronuncian:
        </p>
      </div>

      <router-link 
        to="/admin" 
        class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-fredoka transition border border-slate-200"
      >
        <span>+ Nueva Categoría</span>
      </router-link>
    </div>

    <!-- Full Screen Native App Splash Loader -->
    <transition name="fade">
      <div 
        v-if="loading" 
        class="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none"
      >
        <!-- Soft background radial glow -->
        <div class="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-sky-200/40 via-indigo-100/40 to-pink-200/40 blur-3xl animate-pulse pointer-events-none"></div>

        <!-- Big App Icon Badge -->
        <div class="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[32px] bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-500 p-1 shadow-2xl shadow-indigo-500/20 mb-6 animate-spring">
          <div class="w-full h-full bg-white rounded-[28px] flex items-center justify-center shadow-inner">
            <span class="text-5xl sm:text-6xl animate-bounce-subtle">✨</span>
          </div>
        </div>

        <!-- App Brand Name -->
        <h1 class="text-3xl sm:text-4xl font-bold font-fredoka text-slate-800 tracking-tight text-center mb-2">
          Inglés para Amalia
        </h1>

        <p class="text-sm sm:text-base text-slate-500 font-medium font-fredoka text-center max-w-xs mb-8">
          Aprende jugando con imágenes y voz 🌟
        </p>

        <!-- Playful Animated Dots -->
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-sky-500 animate-bounce"></span>
          <span class="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 0.15s"></span>
          <span class="w-3 h-3 rounded-full bg-pink-500 animate-bounce" style="animation-delay: 0.3s"></span>
        </div>
      </div>
    </transition>

    <!-- 2-Column Mobile Category Cards -->
    <div v-if="categories.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 pb-20">
      <div 
        v-for="(cat, index) in categories" 
        :key="cat.id"
        class="group relative bg-white border border-slate-200/90 rounded-[28px] p-3 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer select-none"
        @click="goToStudy(cat.id)"
      >
        <!-- Top Row: Badge & Progress -->
        <div class="flex items-center justify-between w-full mb-1">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold font-fredoka">
            {{ wordCounts[cat.id] || 0 }} palabras
          </span>

          <div class="flex items-center gap-1.5">
            <!-- 1. Memorama Button -->
            <router-link 
              :to="`/memory/${cat.id}`"
              @click.stop
              title="Jugar Memorama de Sonidos"
              class="w-8 h-8 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 flex items-center justify-center transition border border-sky-200 active:scale-90"
            >
              <Headphones class="w-4 h-4" />
            </router-link>

            <!-- 2. Quiz Button -->
            <router-link 
              :to="`/quiz/${cat.id}`"
              @click.stop
              title="Hacer test de preguntas"
              class="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition border border-amber-200 active:scale-90"
            >
              <Gamepad2 class="w-4 h-4" />
            </router-link>
          </div>
        </div>

        <!-- Center: Big Illustration / Emoji with clean breathing room -->
        <div class="my-2 sm:my-4 flex items-center justify-center h-24 sm:h-28">
          <span class="text-5xl sm:text-6xl drop-shadow-sm group-hover:scale-115 transition-transform duration-300 pointer-events-none">
            {{ cat.icon || '📘' }}
          </span>
        </div>

        <!-- Bottom Pill: Solid Cheerful Color Container with Bold Name -->
        <div 
          :style="{ backgroundColor: getSolidPillColor(index, cat) }"
          class="w-full rounded-2xl py-2.5 px-3 text-center shadow-md transition-transform group-hover:scale-[1.02] duration-200"
        >
          <h3 class="text-white font-bold font-fredoka text-base sm:text-lg leading-tight truncate">
            {{ cat.englishName || cat.name }}
          </h3>
          <p class="text-white/85 text-[11px] sm:text-xs font-medium truncate mt-0.5">
            {{ cat.name }}
          </p>
        </div>

      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
      <span class="text-6xl mb-4 block">📦</span>
      <h3 class="text-xl font-bold font-fredoka text-slate-800 mb-2">Aún no hay categorías</h3>
      <p class="text-slate-500 text-sm mb-6">Agrega tus primeras categorías y palabras desde el panel de administración.</p>
      <router-link to="/admin" class="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-fredoka font-bold shadow-md shadow-sky-500/25 transition">
        Ir al Módulo de Administración
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Gamepad2, Headphones } from 'lucide-vue-next'
import { getCategories, getWordsByCategory, subscribeCategories } from '../services/db'
import { seedInitialDataIfEmpty } from '../services/seedData'

const router = useRouter()
const categories = ref([])
const wordCounts = ref({})
const loading = ref(true)
let unsubscribe = null

// Vibrant, friendly solid colors matching the mobile app reference
const solidPalette = [
  '#00BCD4', // Cyan (School)
  '#E53935', // Crimson Red (Kitchen)
  '#5D4037', // Warm Chocolate (Home)
  '#FB8C00', // Deep Orange (Sports)
  '#7E57C2', // Soft Purple (Face)
  '#2E7D32', // Emerald Green (Moving)
  '#1E88E5', // Sky/Royal Blue (Work)
  '#FFA726', // Amber Yellow (Animals)
  '#00897B', // Teal Green (Education)
  '#D84315', // Rust Red (Kitchen 2)
  '#8E24AA', // Berry Violet
  '#3949AB'  // Indigo
]

const getSolidPillColor = (index, cat) => {
  if (cat.solidColor) return cat.solidColor
  return solidPalette[index % solidPalette.length]
}

const goToStudy = (catId) => {
  router.push(`/study/${catId}`)
}

const loadWordCounts = async (list) => {
  const counts = {}
  for (const cat of list) {
    const words = await getWordsByCategory(cat.id)
    counts[cat.id] = words.length
  }
  wordCounts.value = counts
}

const loadData = async () => {
  loading.value = true
  try {
    await seedInitialDataIfEmpty()
    const list = await getCategories()
    categories.value = list
    await loadWordCounts(list)
  } catch (error) {
    console.error('Error loading categories for home:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()

  // Real-time synchronization: if any category is added or edited in Firestore, update instantly!
  unsubscribe = subscribeCategories(async (cloudList) => {
    if (cloudList && cloudList.length > 0) {
      categories.value = cloudList
      await loadWordCounts(cloudList)
      loading.value = false
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
