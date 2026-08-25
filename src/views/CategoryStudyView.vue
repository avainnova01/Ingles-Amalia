<template>
  <div class="h-[calc(100dvh-75px)] sm:h-[calc(100vh-90px)] flex flex-col justify-between p-3 sm:p-5 max-w-lg mx-auto overflow-hidden">
    
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center glass-card rounded-3xl p-8">
      <div class="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="font-fredoka text-slate-300 text-sm">Cargando lección...</p>
    </div>

    <!-- Main Study View (Zero-scroll Mobile Fitted layout) -->
    <template v-else-if="category && words.length > 0">
      
      <!-- Top Minimal Header -->
      <div class="flex items-center justify-between gap-2 px-1 mb-1.5 flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xl sm:text-2xl">{{ category.icon || '🏠' }}</span>
          <h2 class="text-base sm:text-lg font-bold font-fredoka text-white truncate max-w-[200px] sm:max-w-xs">
            {{ category.name }}
          </h2>
        </div>

        <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
          {{ currentIndex + 1 }} / {{ words.length }}
        </span>
      </div>

      <!-- Main Word Flashcard (SWIPEABLE with finger touch gesture!) -->
      <div 
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        :class="[
          'flex-1 min-h-0 glass-panel rounded-3xl p-3 sm:p-5 flex flex-col justify-between shadow-2xl border border-slate-700/80 overflow-hidden relative touch-pan-y transition-transform duration-300',
          slideAnimationClass
        ]"
      >
        
        <!-- Word Header + Big Speaker Button -->
        <div class="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80 flex-shrink-0">
          <div>
            <h3 class="text-2xl sm:text-4xl font-bold font-fredoka text-white capitalize leading-tight">
              {{ currentWord.englishWord }}
            </h3>
            <p class="text-xs sm:text-sm text-indigo-300 font-semibold mt-0.5">
              {{ currentWord.spanishMeaning }}
            </p>
          </div>

          <!-- Big Audio Button -->
          <AudioButton 
            :text="currentWord.englishWord" 
            :rate="speechRate"
            size="md" 
            variant="gradient"
            label="Escuchar"
          />
        </div>

        <!-- Full-Size MAIN Cover Image Container -->
        <div class="flex-1 min-h-0 my-2 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner relative group select-none">
          <img 
            v-if="mainCoverImage" 
            :src="mainCoverImage" 
            :alt="currentWord.englishWord" 
            class="w-full h-full object-cover pointer-events-none"
            loading="eager"
          />
          <div v-else class="text-center p-4">
            <span class="text-4xl block mb-1">🖼️</span>
            <p class="text-slate-500 text-xs">Sin imagen</p>
          </div>

          <!-- Subtle swipe hint pill for kids -->
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-md text-[10px] text-slate-300 border border-white/10 opacity-70 pointer-events-none flex items-center gap-1">
            <span>👈 Desliza la tarjeta 👉</span>
          </div>
        </div>

        <!-- Bottom Controls: Speed toggle -->
        <div class="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800/80 flex-shrink-0">
          <span class="font-medium text-slate-300">Velocidad:</span>
          <div class="flex items-center gap-1.5">
            <button 
              @click="speechRate = 0.75" 
              :class="['px-2 py-0.5 rounded-lg text-[10px] font-bold transition', speechRate === 0.75 ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400']"
            >
              🐢 Lenta
            </button>
            <button 
              @click="speechRate = 0.95" 
              :class="['px-2 py-0.5 rounded-lg text-[10px] font-bold transition', speechRate === 0.95 ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400']"
            >
              🐰 Normal
            </button>
          </div>
        </div>

      </div>

      <!-- Bottom Mobile Navigation Controls (Previous / Next Word) -->
      <div class="flex items-center justify-between gap-3 mt-2 flex-shrink-0">
        <button 
          @click="prevWord" 
          :disabled="currentIndex === 0"
          class="flex-1 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-fredoka font-semibold text-sm flex items-center justify-center gap-1.5 transition border border-slate-700 active:scale-95"
        >
          <ChevronLeft class="w-5 h-5" />
          <span>Anterior</span>
        </button>

        <!-- Dots Indicator -->
        <div class="flex items-center gap-1.5 px-1">
          <span 
            v-for="(w, idx) in words" 
            :key="w.id"
            @click="goToWord(idx)"
            :class="[
              'w-2 h-2 rounded-full cursor-pointer transition-all duration-300',
              idx === currentIndex ? 'bg-pink-500 scale-125' : 'bg-slate-700'
            ]"
          ></span>
        </div>

        <button 
          @click="nextWord" 
          :disabled="currentIndex === words.length - 1"
          class="flex-1 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-fredoka font-semibold text-sm flex items-center justify-center gap-1.5 transition border border-slate-700 active:scale-95"
        >
          <span>Siguiente</span>
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

    </template>

    <!-- Empty Warning -->
    <div v-else class="glass-card rounded-3xl p-8 text-center max-w-sm mx-auto my-auto">
      <span class="text-5xl block mb-2">🔎</span>
      <h3 class="text-lg font-bold font-fredoka text-white mb-1">No hay palabras aquí</h3>
      <p class="text-slate-400 text-xs mb-4">Agrega palabras desde el panel de administración.</p>
      <router-link to="/admin" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-fredoka text-xs font-bold">
        Ir a Administración
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
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
const speechRate = ref(0.85)
const loading = ref(true)

// Touch Swipe State
const touchStartX = ref(0)
const touchEndX = ref(0)
const slideAnimationClass = ref('')

const currentWord = computed(() => words.value[currentIndex.value] || {})

// Always display the Main Image (images[0]) configured in Admin!
const mainCoverImage = computed(() => {
  const word = currentWord.value
  if (!word || !word.images || word.images.length === 0) return null
  return word.images[0]
})

const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}

// Preload all images in RAM for instant swiping
const preloadImages = (wordList) => {
  if (!wordList) return
  wordList.forEach(w => {
    if (w.images && w.images.length > 0) {
      const img = new Image()
      img.src = w.images[0]
    }
  })
}

const handleTouchStart = (event) => {
  touchStartX.value = event.touches[0].clientX
}

const handleTouchEnd = (event) => {
  touchEndX.value = event.changedTouches[0].clientX
  handleSwipe()
}

const handleSwipe = () => {
  const distance = touchStartX.value - touchEndX.value
  const minSwipeDistance = 45

  if (distance > minSwipeDistance) {
    if (currentIndex.value < words.value.length - 1) {
      slideAnimationClass.value = '-translate-x-3'
      setTimeout(() => { slideAnimationClass.value = '' }, 150)
      nextWord()
    }
  } else if (distance < -minSwipeDistance) {
    if (currentIndex.value > 0) {
      slideAnimationClass.value = 'translate-x-3'
      setTimeout(() => { slideAnimationClass.value = '' }, 150)
      prevWord()
    }
  }
}

const loadCategoryData = async () => {
  loading.value = true
  try {
    category.value = await getCategoryById(props.categoryId)
    words.value = await getWordsByCategory(props.categoryId)
    currentIndex.value = 0

    if (words.value.length > 0) {
      preloadImages(words.value)
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
    }, 150)
  }
}

const nextWord = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
    triggerHaptic()
    speakCurrentWord()
  }
}

const prevWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    triggerHaptic()
    speakCurrentWord()
  }
}

const goToWord = (idx) => {
  currentIndex.value = idx
  triggerHaptic()
  speakCurrentWord()
}

watch(() => props.categoryId, () => {
  loadCategoryData()
})

onMounted(() => {
  loadCategoryData()
})
</script>
