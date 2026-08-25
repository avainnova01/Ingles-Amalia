<template>
  <div class="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
    
    <!-- Top Navigation Bar -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <router-link 
        to="/" 
        class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-fredoka text-sm border border-slate-700 transition"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Volver a Categorías</span>
      </router-link>

      <router-link 
        v-if="category"
        :to="`/quiz/${category.id}`"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-fredoka text-sm font-semibold shadow-lg shadow-pink-500/20 transition hover:scale-105 active:scale-95"
      >
        <Gamepad2 class="w-4 h-4" />
        <span>Hacer Test Ahora</span>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="glass-card rounded-3xl p-12 text-center">
      <div class="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="font-fredoka text-slate-300">Cargando lección de estudio...</p>
    </div>

    <!-- Main Flashcard Content -->
    <div v-else-if="category && words.length > 0">
      
      <!-- Category Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center gap-3 px-6 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-inner mb-2">
          <span class="text-2xl">{{ category.icon || '🏠' }}</span>
          <h2 class="text-xl font-bold font-fredoka text-white">{{ category.name }}</h2>
        </div>
        <p class="text-xs text-slate-400 font-medium">
          Palabra {{ currentIndex + 1 }} de {{ words.length }}
        </p>
      </div>

      <!-- Flashcard Container -->
      <div class="relative glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl border border-slate-700/80">
        
        <!-- Word Title & Audio -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-center sm:text-left border-b border-slate-800 pb-6">
          <div>
            <h3 class="text-3xl sm:text-5xl font-bold font-fredoka bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-200 bg-clip-text text-transparent capitalize">
              {{ currentWord.englishWord }}
            </h3>
            <p class="text-base sm:text-lg text-slate-400 font-medium mt-1">
              {{ currentWord.spanishMeaning }}
            </p>
          </div>

          <!-- Pronunciation Button -->
          <AudioButton 
            :text="currentWord.englishWord" 
            :rate="speechRate"
            size="lg" 
            variant="gradient"
            label="Escuchar"
          />
        </div>

        <!-- Image Gallery Carousel for this word -->
        <div class="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner group">
          <img 
            v-if="currentImage" 
            :src="currentImage" 
            :alt="currentWord.englishWord" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div v-else class="text-center p-8">
            <span class="text-5xl block mb-2">🖼️</span>
            <p class="text-slate-500 text-sm font-medium">No hay imagen subida</p>
          </div>

          <!-- Image Carousel Overlay Navigation (when word has multiple images) -->
          <div v-if="currentWord.images && currentWord.images.length > 1" class="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
            <button 
              @click.stop="prevImage"
              class="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 pointer-events-auto transition hover:scale-110 active:scale-95 shadow-lg"
              title="Ver otra imagen de esta palabra"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            
            <button 
              @click.stop="nextImage"
              class="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 pointer-events-auto transition hover:scale-110 active:scale-95 shadow-lg"
              title="Ver otra imagen de esta palabra"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>

          <!-- Multiple Images Indicator Badge -->
          <div v-if="currentWord.images && currentWord.images.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
            <span>Foto {{ currentImageIndex + 1 }} de {{ currentWord.images.length }}</span>
            <span class="text-amber-400">📸</span>
          </div>
        </div>

        <!-- Controls: Speed selector & Voice helper -->
        <div class="mt-6 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div class="flex items-center gap-2">
            <span>Velocidad de Voz:</span>
            <button 
              @click="speechRate = 0.75" 
              :class="['px-2.5 py-1 rounded-lg font-semibold transition', speechRate === 0.75 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400']"
            >
              🐢 Lenta
            </button>
            <button 
              @click="speechRate = 0.95" 
              :class="['px-2.5 py-1 rounded-lg font-semibold transition', speechRate === 0.95 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400']"
            >
              🐰 Normal
            </button>
          </div>

          <span class="hidden sm:inline">Web Speech API • Audio HD</span>
        </div>

      </div>

      <!-- Navigation Arrows for Words in Category -->
      <div class="flex items-center justify-between gap-4 mt-8 max-w-2xl mx-auto">
        <button 
          @click="prevWord" 
          :disabled="currentIndex === 0"
          class="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-fredoka font-semibold flex items-center gap-2 transition disabled:cursor-not-allowed border border-slate-700"
        >
          <ChevronLeft class="w-5 h-5" />
          <span>Anterior</span>
        </button>

        <!-- Dots Indicator -->
        <div class="flex items-center gap-2">
          <span 
            v-for="(w, idx) in words" 
            :key="w.id"
            @click="goToWord(idx)"
            :class="[
              'w-3 h-3 rounded-full cursor-pointer transition-all duration-300',
              idx === currentIndex ? 'bg-pink-500 scale-125' : 'bg-slate-700 hover:bg-slate-600'
            ]"
          ></span>
        </div>

        <button 
          @click="nextWord" 
          :disabled="currentIndex === words.length - 1"
          class="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-fredoka font-semibold flex items-center gap-2 transition disabled:cursor-not-allowed border border-slate-700"
        >
          <span>Siguiente</span>
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

    </div>

    <!-- Empty Words Warning -->
    <div v-else class="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto">
      <span class="text-6xl mb-4 block">🔎</span>
      <h3 class="text-xl font-bold font-fredoka text-white mb-2">No hay palabras en esta categoría</h3>
      <p class="text-slate-400 text-sm mb-6">Pídele a tus papás que agreguen palabras en el módulo administrativo.</p>
      <router-link to="/admin" class="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-fredoka font-bold">
        Ir a Administración
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getCategoryById, getWordsByCategory } from '../services/db'
import { speakEnglish } from '../services/audio'
import AudioButton from '../components/AudioButton.vue'

const props = defineProps({
  categoryId: {
    type: String,
    required: true
  }
})

const category = ref(null)
const words = ref([])
const currentIndex = ref(0)
const currentImageIndex = ref(0)
const speechRate = ref(0.85)
const loading = ref(true)

const currentWord = computed(() => words.value[currentIndex.value] || {})

const currentImage = computed(() => {
  if (!currentWord.value || !currentWord.value.images || currentWord.value.images.length === 0) {
    return null
  }
  return currentWord.value.images[currentImageIndex.value] || currentWord.value.images[0]
})

const loadCategoryData = async () => {
  loading.value = true
  try {
    category.value = await getCategoryById(props.categoryId)
    words.value = await getWordsByCategory(props.categoryId)
    currentIndex.value = 0
    currentImageIndex.value = 0

    if (words.value.length > 0) {
      speakCurrentWord()
    }
  } catch (error) {
    console.error('Error loading study category:', error)
  } finally {
    loading.value = false
  }
}

const speakCurrentWord = () => {
  if (currentWord.value && currentWord.value.englishWord) {
    setTimeout(() => {
      speakEnglish(currentWord.value.englishWord, speechRate.value)
    }, 200)
  }
}

const nextWord = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
    currentImageIndex.value = 0
    speakCurrentWord()
  }
}

const prevWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    currentImageIndex.value = 0
    speakCurrentWord()
  }
}

const goToWord = (idx) => {
  currentIndex.value = idx
  currentImageIndex.value = 0
  speakCurrentWord()
}

const nextImage = () => {
  if (currentWord.value.images && currentWord.value.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % currentWord.value.images.length
  }
}

const prevImage = () => {
  if (currentWord.value.images && currentWord.value.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value - 1 + currentWord.value.images.length) % currentWord.value.images.length
  }
}

watch(() => props.categoryId, () => {
  loadCategoryData()
})

onMounted(() => {
  loadCategoryData()
})
</script>
