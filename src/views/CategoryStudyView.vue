<template>
  <div class="h-[calc(100dvh-60px)] sm:h-[calc(100vh-70px)] flex flex-col justify-between p-3 sm:p-6 max-w-2xl mx-auto overflow-hidden relative select-none">
    
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl p-8 border border-slate-200">
      <div class="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="font-fredoka text-slate-600 text-sm">Cargando palabras...</p>
    </div>

    <!-- Main Study Scene (Distraction-Free, Matching Screenshots 2 & 3) -->
    <template v-else-if="category && words.length > 0">
      
      <!-- Top Bar: Progress & Prev/Next Arrows -->
      <div class="flex items-center justify-between px-2 pt-1 flex-shrink-0 z-10">
        <!-- Left: Circular / Pill Progress & Category Name -->
        <div class="flex items-center gap-2.5">
          <button 
            @click="goHome"
            class="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-sm transition active:scale-95"
            title="Volver"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-2 bg-white border border-slate-200/90 rounded-full px-3 py-1 shadow-sm">
            <span class="text-sm">{{ category.icon || '🏠' }}</span>
            <span class="text-xs font-bold font-fredoka text-slate-700 truncate max-w-[120px] sm:max-w-xs">
              {{ category.name }}
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span class="text-xs font-bold text-sky-600 font-fredoka">
              {{ currentIndex + 1 }}/{{ words.length }}
            </span>
          </div>
        </div>

        <!-- Right: Memorama Link & Clean Prev / Next Arrow Pills -->
        <div class="flex items-center gap-1.5">
          <router-link 
            :to="`/memory/${props.categoryId}`"
            class="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-sky-600 hover:bg-sky-50 text-xs font-bold font-fredoka shadow-sm transition active:scale-95"
            title="Jugar Memorama de Sonidos"
          >
            <Headphones class="w-3.5 h-3.5" />
            <span>Memorama</span>
          </router-link>

          <div class="flex items-center gap-1 bg-white border border-slate-200/90 rounded-full p-1 shadow-sm">
            <button 
              @click="prevWord" 
              :disabled="currentIndex === 0"
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 disabled:text-slate-300 hover:bg-slate-100 transition active:scale-90"
              title="Anterior"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button 
              @click="nextWord" 
              :disabled="currentIndex === words.length - 1"
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 disabled:text-slate-300 hover:bg-slate-100 transition active:scale-90"
              title="Siguiente"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Center Stage: Pastel Blob + Centered Illustration + Text -->
      <div 
        class="flex-1 flex flex-col items-center justify-center my-auto relative w-full py-2"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <!-- Illustration Container with Organic Pastel Backdrop -->
        <div class="relative w-64 h-64 sm:w-80 sm:h-80 max-h-[48vh] flex items-center justify-center mb-3">
          <!-- Soft Organic Pastel Blob (Rotates softly by index) -->
          <div 
            :style="{ backgroundColor: currentPastelBlob }"
            class="absolute inset-2 sm:inset-4 rounded-[42px] blob-organic transition-all duration-500 shadow-inner"
          ></div>

          <!-- The Illustration Image -->
          <img 
            v-if="mainCoverImage" 
            :src="mainCoverImage" 
            :alt="currentWord.englishWord" 
            class="relative z-10 max-h-52 sm:max-h-64 max-w-[85%] object-contain drop-shadow-sm select-none pointer-events-none transition-transform duration-300 hover:scale-105"
            loading="eager"
          />
          <div v-else class="relative z-10 text-center p-4">
            <span class="text-6xl sm:text-7xl block mb-2">🖼️</span>
            <p class="text-slate-400 text-xs font-fredoka">Sin imagen asignada</p>
          </div>

          <!-- Speech feedback toast (when Amalia speaks into mic) -->
          <transition name="fade">
            <div 
              v-if="speechFeedback" 
              class="absolute -top-3 z-20 px-4 py-1.5 rounded-full bg-emerald-500 text-white font-fredoka font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 animate-bounce-subtle"
            >
              <span>🎉</span>
              <span>{{ speechFeedback }}</span>
            </div>
          </transition>
        </div>

        <!-- English Word & Spanish Hint in Clean Legible Typography -->
        <div class="text-center max-w-md px-4 mt-1 mb-2">
          <h2 class="text-2xl sm:text-4xl font-bold font-fredoka text-slate-800 tracking-wide leading-tight">
            {{ currentWord.englishWord }}
          </h2>

          <!-- Translation / Hint (Toggled by the lightbulb button or shown smoothly) -->
          <div class="h-6 mt-1 flex items-center justify-center">
            <transition name="fade" mode="out-in">
              <p 
                v-if="showTranslation" 
                class="text-sm sm:text-base text-slate-500 font-medium font-fredoka"
              >
                {{ currentWord.spanishMeaning }}
              </p>
              <button 
                v-else 
                @click="showTranslation = true"
                class="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
              >
                <span>💡 Toca para ver traducción</span>
              </button>
            </transition>
          </div>
        </div>

      </div>

      <!-- Floating Action Dock (Exact Style from Screenshots 2 & 3) -->
      <div class="flex items-center justify-center pb-3 flex-shrink-0 z-20">
        <div class="bg-white border border-slate-200/90 shadow-xl rounded-full px-3 py-2 flex items-center gap-2 sm:gap-4">
          
          <!-- 1. Home Button -->
          <button 
            @click="goHome"
            class="w-10 h-10 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition active:scale-95"
            title="Inicio"
          >
            <Home class="w-5 h-5" />
          </button>

          <!-- 2. Speed Toggle (Slow / Normal) -->
          <button 
            @click="toggleSpeed"
            class="w-10 h-10 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition active:scale-95 text-lg"
            :title="speechRate < 0.9 ? 'Velocidad Lenta' : 'Velocidad Normal'"
          >
            <span v-if="speechRate < 0.9">🐢</span>
            <span v-else>🐰</span>
          </button>

          <!-- 3. Audio Speaker Button -->
          <button 
            @click="speakCurrentWord"
            class="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition active:scale-95"
            title="Escuchar pronunciación"
          >
            <Volume2 class="w-5 h-5" />
          </button>

          <!-- 4. Microphone Button (Primary Action - Vivid Blue Pill!) -->
          <button 
            @click="startListening"
            :class="[
              'w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md',
              isListening 
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 scale-105' 
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/30 active:scale-95'
            ]"
            :title="isListening ? 'Escuchando tu voz...' : 'Practicar diciendo la palabra'"
          >
            <Mic class="w-5 h-5" />
          </button>

          <!-- 5. Lightbulb / Hint Button (Toggle Spanish) -->
          <button 
            @click="showTranslation = !showTranslation"
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95',
              showTranslation 
                ? 'bg-amber-100 text-amber-600 font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            ]"
            title="Ver / Ocultar traducción"
          >
            <Lightbulb class="w-5 h-5" />
          </button>

        </div>
      </div>

    </template>

    <!-- Empty State -->
    <div v-else class="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-sm mx-auto my-auto shadow-sm">
      <span class="text-5xl block mb-2">🔎</span>
      <h3 class="text-lg font-bold font-fredoka text-slate-800 mb-1">No hay palabras aquí</h3>
      <p class="text-slate-500 text-xs mb-4">Agrega palabras desde el panel de administración.</p>
      <router-link to="/admin" class="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-fredoka text-xs font-bold shadow-md shadow-sky-500/20">
        Ir a Administración
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Home, Volume2, Mic, Lightbulb, Headphones } from 'lucide-vue-next'
import { getCategoryById, getWordsByCategory } from '../services/db'
import { speakEnglish, playCorrectSound } from '../services/audio'

const props = defineProps({
  categoryId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const category = ref(null)
const words = ref([])
const currentIndex = ref(0)
const speechRate = ref(0.85)
const loading = ref(true)
const showTranslation = ref(true)
const isListening = ref(false)
const speechFeedback = ref('')

// Gentle pastel backdrop colors rotating per card (inspired by Screenshots 2 & 3)
const pastelBlobs = [
  '#E8F5E9', // Pale Mint
  '#FCE4EC', // Soft Rose Pink
  '#E3F2FD', // Pale Sky Blue
  '#FFF8E1', // Pale Cream Yellow
  '#F3E5F5', // Soft Lilac
  '#E0F2F1', // Soft Aqua
  '#FFF3E0'  // Soft Peach
]

const currentPastelBlob = computed(() => {
  return pastelBlobs[currentIndex.value % pastelBlobs.length]
})

// Touch Swipe State
const touchStartX = ref(0)
const touchEndX = ref(0)

const currentWord = computed(() => words.value[currentIndex.value] || {})

const mainCoverImage = computed(() => {
  const word = currentWord.value
  if (!word || !word.images || word.images.length === 0) return null
  return word.images[0]
})

const goHome = () => {
  router.push('/')
}

const toggleSpeed = () => {
  speechRate.value = speechRate.value < 0.9 ? 1.0 : 0.75
  speakCurrentWord()
}

const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}

// Preload images for silky-smooth swiping
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
  const distance = touchStartX.value - touchEndX.value
  const minSwipeDistance = 45

  if (distance > minSwipeDistance) {
    nextWord()
  } else if (distance < -minSwipeDistance) {
    prevWord()
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
    }, 100)
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

// Speech Recognition Practice (Fun interactive feature for the mic button!)
const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    // If not supported, repeat pronunciation
    speakCurrentWord()
    return
  }

  try {
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    isListening.value = true

    recognition.onresult = (event) => {
      isListening.value = false
      const spokenText = event.results[0][0].transcript.toLowerCase().trim()
      const targetText = currentWord.value.englishWord.toLowerCase().trim()

      if (spokenText.includes(targetText) || targetText.includes(spokenText)) {
        speechFeedback.value = '¡Excelente pronunciación! ⭐'
        playCorrectSound()
        setTimeout(() => { speechFeedback.value = '' }, 3000)
      } else {
        speechFeedback.value = `Dijiste: "${spokenText}". ¡Casi! Vuelve a intentar 💪`
        setTimeout(() => { speechFeedback.value = '' }, 3000)
      }
    }

    recognition.onerror = () => {
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
    }

    recognition.start()
  } catch (err) {
    console.error('Speech recognition error:', err)
    isListening.value = false
    speakCurrentWord()
  }
}

watch(() => props.categoryId, () => {
  loadCategoryData()
})

onMounted(() => {
  loadCategoryData()
})
</script>
