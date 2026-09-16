<template>
  <div class="min-h-[calc(100vh-70px)] py-3 sm:py-6 px-3 sm:px-6 max-w-4xl mx-auto flex flex-col justify-between select-none">
    
    <!-- Top Header -->
    <div class="flex items-center justify-between gap-2 mb-4 bg-white border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-sm">
      <!-- Back Button & Category -->
      <div class="flex items-center gap-2.5 min-w-0">
        <button 
          @click="goBack"
          class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-90 flex-shrink-0"
          title="Volver"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>

        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-lg">{{ category?.icon || '🎮' }}</span>
            <h2 class="font-fredoka font-bold text-slate-800 text-base sm:text-xl truncate">
              {{ category?.name || 'Memorama' }}
            </h2>
          </div>
          <p class="text-xs text-sky-600 font-semibold truncate">
            🎧 Memorama de Sonidos (Imagen ↔ Audio)
          </p>
        </div>
      </div>

      <!-- Live Counters & Difficulty -->
      <div class="flex items-center gap-2">
        <!-- Pairs Counter -->
        <div class="px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-fredoka text-xs sm:text-sm font-bold flex items-center gap-1.5">
          <span>🎯</span>
          <span>{{ matchedPairsCount }} / {{ currentPairsCount }}</span>
        </div>

        <!-- Moves Counter -->
        <div class="px-3 py-1.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 font-fredoka text-xs sm:text-sm font-bold flex items-center gap-1.5">
          <span>🔄</span>
          <span>{{ turns }} <span class="hidden sm:inline">intentos</span></span>
        </div>
      </div>
    </div>

    <!-- Difficulty Toggle (If Category has 4+ words) -->
    <div v-if="words.length >= 4" class="flex items-center justify-center gap-2 mb-3">
      <span class="text-xs text-slate-500 font-medium font-fredoka hidden sm:inline">Dificultad:</span>
      <button 
        v-if="words.length >= 3"
        @click="changeDifficulty(3)"
        :class="[
          'px-3 py-1 rounded-full text-xs font-fredoka font-bold transition-all',
          currentPairsCount === 3 
            ? 'bg-sky-500 text-white shadow-sm scale-105' 
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        ]"
      >
        🌟 3 Parejas (6 cartas)
      </button>

      <button 
        v-if="words.length >= 4"
        @click="changeDifficulty(4)"
        :class="[
          'px-3 py-1 rounded-full text-xs font-fredoka font-bold transition-all',
          currentPairsCount === 4 
            ? 'bg-indigo-500 text-white shadow-sm scale-105' 
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        ]"
      >
        🚀 4 Parejas (8 cartas)
      </button>

      <button 
        v-if="words.length >= 6"
        @click="changeDifficulty(6)"
        :class="[
          'px-3 py-1 rounded-full text-xs font-fredoka font-bold transition-all',
          currentPairsCount === 6 
            ? 'bg-purple-600 text-white shadow-sm scale-105' 
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        ]"
      >
        🏆 6 Parejas (12 cartas)
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center min-h-[350px]">
      <div class="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="font-fredoka text-slate-600 text-sm">Cargando cartas del juego...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="words.length < 2" class="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-sm mx-auto my-auto shadow-sm">
      <span class="text-5xl block mb-2">🧩</span>
      <h3 class="text-lg font-bold font-fredoka text-slate-800 mb-1">Se necesitan más palabras</h3>
      <p class="text-slate-500 text-xs mb-4">Esta categoría debe tener al menos 2 palabras para jugar al memorama.</p>
      <router-link to="/" class="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-fredoka text-xs font-bold shadow-md shadow-sky-500/20">
        Volver a Categorías
      </router-link>
    </div>

    <!-- Cards Grid -->
    <div 
      v-else
      :class="[
        'grid gap-2.5 sm:gap-4 my-auto pb-4',
        currentPairsCount === 3 ? 'grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto w-full' : '',
        currentPairsCount === 4 ? 'grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto w-full' : '',
        currentPairsCount === 6 ? 'grid-cols-3 sm:grid-cols-4 max-w-4xl mx-auto w-full' : ''
      ]"
    >
      <div 
        v-for="card in cards" 
        :key="card.id"
        class="perspective-1000 h-36 sm:h-44 md:h-48 cursor-pointer"
        @click="handleCardClick(card)"
      >
        <div 
          :class="[
            'relative w-full h-full transition-transform duration-500 transform-style-3d rounded-2xl sm:rounded-3xl',
            card.isFlipped || card.isMatched ? 'rotate-y-180' : '',
            card.isMismatched ? 'animate-card-shake' : ''
          ]"
        >
          <!-- Card Face: Back (Face-Down / Oculta) -->
          <div 
            class="absolute inset-0 w-full h-full backface-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-1 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center border-2 border-white/50"
          >
            <div class="w-full h-full rounded-[14px] sm:rounded-[22px] bg-white/15 backdrop-blur-xs flex flex-col items-center justify-center text-white relative overflow-hidden">
              <!-- Geometric subtle dots pattern -->
              <div class="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/20 blur-xs"></div>
              <div class="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-white/20 blur-xs"></div>
              
              <span class="text-3xl sm:text-4xl drop-shadow-md animate-bounce-subtle">✨</span>
              <span class="text-[10px] sm:text-xs font-fredoka font-bold tracking-wider uppercase mt-1 opacity-90">
                Toca
              </span>
            </div>
          </div>

          <!-- Card Face: Front (Face-Up / Revelada) -->
          <div 
            :class="[
              'absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-md flex flex-col items-center justify-between border-2 transition-all',
              card.isMatched 
                ? 'bg-emerald-50/90 border-emerald-400 ring-4 ring-emerald-400/30' 
                : card.isMismatched 
                  ? 'bg-rose-50 border-rose-400 ring-4 ring-rose-400/30'
                  : 'bg-white border-slate-200'
            ]"
          >
            <!-- Case A: Visual Card (Image) -->
            <template v-if="card.type === 'IMAGE'">
              <div class="w-full flex items-center justify-between text-[10px] font-fredoka font-bold text-slate-500 px-1">
                <span class="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                  🖼️ Imagen
                </span>
                <span v-if="card.isMatched" class="text-emerald-600 font-bold">¡Bien! ✨</span>
              </div>

              <!-- Center Image -->
              <div class="flex-1 w-full flex items-center justify-center my-1 relative overflow-hidden rounded-xl bg-slate-50">
                <img 
                  v-if="card.image" 
                  :src="card.image" 
                  :alt="card.word.englishWord"
                  class="w-full h-full object-contain p-1 rounded-xl"
                  loading="lazy"
                />
                <span v-else class="text-4xl">🖼️</span>
              </div>

              <!-- Spanish Word Label -->
              <div class="w-full text-center">
                <span class="text-xs sm:text-sm font-bold font-fredoka text-slate-700 truncate block">
                  {{ card.word.spanishTranslation || card.word.englishWord }}
                </span>
              </div>
            </template>

            <!-- Case B: Audio Card (Pronunciation & English Word) -->
            <template v-else>
              <div class="w-full flex items-center justify-between text-[10px] font-fredoka font-bold text-sky-600 px-1">
                <span class="inline-flex items-center gap-1 bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                  🎧 Voz
                </span>
                <span v-if="card.isMatched" class="text-emerald-600 font-bold">¡Genial! 🌟</span>
              </div>

              <!-- Audio Wave Visual & Replay Button -->
              <div class="flex-1 w-full flex flex-col items-center justify-center my-1 rounded-xl bg-sky-50/70 border border-sky-100/80 p-2">
                <button 
                  @click.stop="replayAudio(card)"
                  class="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/30 flex items-center justify-center transition transform active:scale-90 group"
                  title="Escuchar de nuevo"
                >
                  <Volume2 class="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                
                <!-- Animated sound bars -->
                <div class="flex items-center gap-1 mt-2">
                  <span class="w-1 h-2 bg-sky-400 rounded-full animate-bounce"></span>
                  <span class="w-1 h-3.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
                  <span class="w-1 h-2 bg-sky-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
                </div>
              </div>

              <!-- English Word Label -->
              <div class="w-full text-center">
                <span class="text-xs sm:text-sm font-bold font-fredoka text-sky-900 tracking-tight truncate block">
                  "{{ card.word.englishWord }}"
                </span>
              </div>
            </template>

          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Controls & Reset Dock -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-sm mt-2">
      <div class="flex items-center gap-2">
        <button 
          @click="resetGame"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-fredoka font-bold text-xs sm:text-sm transition active:scale-95"
        >
          <RotateCcw class="w-4 h-4 text-sky-500" />
          <span>Reiniciar</span>
        </button>

        <button 
          @click="shuffleNewWords"
          class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-fredoka font-bold text-xs sm:text-sm transition border border-sky-100 active:scale-95"
        >
          <Sparkles class="w-4 h-4 text-amber-500" />
          <span>Mezclar Nuevas Palabras</span>
        </button>
      </div>

      <router-link 
        :to="`/quiz/${props.categoryId}`"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-fredoka font-bold text-xs sm:text-sm transition border border-amber-200 active:scale-95"
      >
        <Gamepad2 class="w-4 h-4 text-amber-600" />
        <span>Ir al Quiz ➔</span>
      </router-link>
    </div>

    <!-- Victory Modal (Confetti + Stars) -->
    <div 
      v-if="showVictoryModal" 
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center relative overflow-hidden animate-spring">
        
        <!-- Subtle background glow -->
        <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Trophy Emoji -->
        <div class="text-6xl sm:text-7xl mb-3 animate-bounce">
          🏆
        </div>

        <h3 class="text-2xl sm:text-3xl font-bold font-fredoka text-slate-800 mb-1">
          ¡Increíble, Amalia!
        </h3>
        <p class="text-slate-500 text-sm mb-4">
          ¡Encontraste todas las parejas de sonidos e imágenes!
        </p>

        <!-- Star Rating -->
        <div class="flex items-center justify-center gap-2 mb-6">
          <Star 
            v-for="i in 3" 
            :key="i"
            :class="[
              'w-8 h-8 transition-transform duration-300',
              i <= starCount 
                ? 'text-amber-400 fill-amber-400 drop-shadow-md scale-110' 
                : 'text-slate-200 fill-slate-100'
            ]"
          />
        </div>

        <!-- Stats Card -->
        <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-6 flex items-center justify-around">
          <div>
            <span class="text-xs text-slate-500 font-fredoka uppercase block">Parejas</span>
            <span class="text-2xl font-bold font-fredoka text-emerald-600">{{ matchedPairsCount }} / {{ currentPairsCount }}</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div>
            <span class="text-xs text-slate-500 font-fredoka uppercase block">Intentos</span>
            <span class="text-2xl font-bold font-fredoka text-sky-600">{{ turns }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2.5">
          <button 
            @click="playAgain"
            class="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-fredoka font-bold text-sm sm:text-base shadow-md shadow-sky-500/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw class="w-5 h-5" />
            <span>Jugar otra vez con nuevas palabras</span>
          </button>

          <router-link 
            :to="`/study/${props.categoryId}`"
            class="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-fredoka font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <GraduationCap class="w-5 h-5 text-indigo-500" />
            <span>Seguir Estudiando</span>
          </router-link>

          <button 
            @click="goBack"
            class="w-full py-2.5 text-slate-500 hover:text-slate-800 font-fredoka font-semibold text-xs transition"
          >
            Volver a Categorías
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  Gamepad2, 
  Star, 
  GraduationCap 
} from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { getCategoryById, getWordsByCategory } from '../services/db'
import { 
  speakEnglish, 
  playCorrectSound, 
  playWrongSound, 
  playFanfareSound, 
  playFlipSound 
} from '../services/audio'

const props = defineProps({
  categoryId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const category = ref(null)
const words = ref([])
const loading = ref(true)

// Game State
const currentPairsCount = ref(4)
const cards = ref([])
const flippedCards = ref([])
const isEvaluating = ref(false)
const matchedPairsCount = ref(0)
const turns = ref(0)
const showVictoryModal = ref(false)

// Calculate Stars rating based on efficiency
const starCount = computed(() => {
  const perfectTurns = currentPairsCount.value
  if (turns.value <= perfectTurns + 2) return 3
  if (turns.value <= perfectTurns + 5) return 2
  return 1
})

const goBack = () => {
  router.push('/')
}

const shuffleArray = (arr) => {
  const array = [...arr]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Generate the deck of Visual + Audio cards
const setupDeck = () => {
  if (words.value.length < 2) return

  // Limit pairs to what is available
  const availableCount = Math.min(currentPairsCount.value, words.value.length)
  currentPairsCount.value = availableCount

  // Pick random words
  const selectedWords = shuffleArray(words.value).slice(0, availableCount)
  const deck = []

  selectedWords.forEach((word) => {
    // 1. Visual Card (Image)
    const imgUrl = (word.images && word.images.length > 0)
      ? word.images[Math.floor(Math.random() * word.images.length)]
      : null

    deck.push({
      id: `img_${word.id}`,
      wordId: word.id,
      type: 'IMAGE',
      word,
      image: imgUrl,
      isFlipped: false,
      isMatched: false,
      isMismatched: false
    })

    // 2. Audio Card (English Pronunciation & Label)
    deck.push({
      id: `aud_${word.id}`,
      wordId: word.id,
      type: 'AUDIO',
      word,
      isFlipped: false,
      isMatched: false,
      isMismatched: false
    })
  })

  // Shuffle full deck
  cards.value = shuffleArray(deck)
  flippedCards.value = []
  matchedPairsCount.value = 0
  turns.value = 0
  isEvaluating.value = false
  showVictoryModal.value = false
}

const handleCardClick = (card) => {
  // Ignore clicks if evaluating, card already flipped or matched
  if (isEvaluating.value) return
  if (card.isFlipped || card.isMatched) return
  if (flippedCards.value.length >= 2) return

  // Play flip click sound
  playFlipSound()

  // Flip card
  card.isFlipped = true
  flippedCards.value.push(card)

  // If it's an Audio card, pronounce immediately
  if (card.type === 'AUDIO') {
    speakEnglish(card.word.englishWord, 0.85)
  }

  // When two cards are open, check match
  if (flippedCards.value.length === 2) {
    turns.value++
    isEvaluating.value = true
    const [card1, card2] = flippedCards.value

    if (card1.wordId === card2.wordId) {
      // MATCH FOUND! 🎉
      setTimeout(() => {
        playCorrectSound()
        card1.isMatched = true
        card2.isMatched = true
        matchedPairsCount.value++
        flippedCards.value = []
        isEvaluating.value = false

        // Check if game won
        if (matchedPairsCount.value === currentPairsCount.value) {
          setTimeout(() => {
            showVictoryModal.value = true
            playFanfareSound()
            triggerConfetti()
          }, 500)
        }
      }, 400)
    } else {
      // MISMATCH! ❌
      setTimeout(() => {
        playWrongSound()
        card1.isMismatched = true
        card2.isMismatched = true

        setTimeout(() => {
          card1.isFlipped = false
          card2.isFlipped = false
          card1.isMismatched = false
          card2.isMismatched = false
          flippedCards.value = []
          isEvaluating.value = false
        }, 1100)
      }, 500)
    }
  }
}

const replayAudio = (card) => {
  speakEnglish(card.word.englishWord, 0.85)
}

const changeDifficulty = (pairs) => {
  currentPairsCount.value = pairs
  setupDeck()
}

const resetGame = () => {
  setupDeck()
}

const shuffleNewWords = () => {
  setupDeck()
}

const playAgain = () => {
  showVictoryModal.value = false
  setupDeck()
}

const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    })
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      })
    }, 250)
  } catch (e) {
    console.warn('Confetti error:', e)
  }
}

onMounted(async () => {
  try {
    loading.value = true
    category.value = await getCategoryById(props.categoryId)
    words.value = await getWordsByCategory(props.categoryId)

    if (words.value.length >= 4) {
      currentPairsCount.value = 4
    } else if (words.value.length >= 3) {
      currentPairsCount.value = 3
    } else {
      currentPairsCount.value = words.value.length
    }

    setupDeck()
  } catch (e) {
    console.error('Error loading memory game data:', e)
  } finally {
    loading.value = false
  }
})
</script>
