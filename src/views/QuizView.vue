<template>
  <div class="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
    
    <!-- Top Progress Header -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <router-link 
        to="/" 
        class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-fredoka text-sm border border-slate-700 transition"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Salir del Test</span>
      </router-link>

      <!-- Score Pill (Only when quiz is active) -->
      <div v-if="selectedMode && questions.length > 0" class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-fredoka font-bold text-sm">
        <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
        <span>Puntos: {{ score }} / {{ questions.length }}</span>
      </div>
    </div>

    <!-- MODE SELECTION SCREEN (Choose Listen vs Read mode) -->
    <div v-if="!selectedMode" class="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700/80 text-center max-w-2xl mx-auto">
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 font-fredoka text-xs mb-4">
        <span>🎮 Elige el tipo de examen</span>
      </div>

      <h2 class="text-3xl sm:text-4xl font-bold font-fredoka text-white mb-2">
        ¿Cómo quieres jugar hoy?
      </h2>
      <p class="text-slate-300 text-sm sm:text-base mb-8 max-w-md mx-auto">
        Categoría: <strong class="text-pink-300">{{ category?.name }}</strong>. Escoge tu modalidad preferida:
      </p>

      <!-- Mode Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        
        <!-- Option 1: LISTEN MODE -->
        <button 
          @click="startQuizWithMode('LISTEN')"
          class="group p-6 rounded-3xl bg-slate-900/90 border-2 border-slate-700 hover:border-pink-500 hover:bg-slate-800 text-left transition duration-300 flex flex-col justify-between cursor-pointer hover:scale-103 shadow-xl"
        >
          <div>
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
              🎧
            </div>
            <h3 class="text-xl font-bold font-fredoka text-white group-hover:text-pink-300 transition-colors mb-1">
              Modo Escucha (Listen)
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              La app pronuncia la palabra en inglés y tú debes seleccionar la imagen correcta.
            </p>
          </div>

          <div class="mt-6 inline-flex items-center gap-2 text-xs font-bold text-pink-400 font-fredoka">
            <span>Iniciar Test de Escucha</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <!-- Option 2: READ MODE -->
        <button 
          @click="startQuizWithMode('READ')"
          class="group p-6 rounded-3xl bg-slate-900/90 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-left transition duration-300 flex flex-col justify-between cursor-pointer hover:scale-103 shadow-xl"
        >
          <div>
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
              📖
            </div>
            <h3 class="text-xl font-bold font-fredoka text-white group-hover:text-indigo-300 transition-colors mb-1">
              Modo Lectura (Read)
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Observas una imagen aleatoria y debes leer/escoger cuál es la palabra en inglés.
            </p>
          </div>

          <div class="mt-6 inline-flex items-center gap-2 text-xs font-bold text-indigo-400 font-fredoka">
            <span>Iniciar Test de Lectura</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

      <!-- Bonus Option 3: MIXED MODE -->
      <button 
        @click="startQuizWithMode('MIXED')"
        class="w-full p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500 hover:bg-slate-800 text-slate-300 hover:text-white font-fredoka text-xs font-semibold flex items-center justify-center gap-2 transition"
      >
        <span>🎲 Probar Modo Mixto (Combinación de Escucha + Lectura)</span>
      </button>

    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="glass-card rounded-3xl p-12 text-center">
      <div class="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="font-fredoka text-slate-300">Preparando tu examen de inglés...</p>
    </div>

    <!-- Active Question Card -->
    <div v-else-if="currentQuestion" class="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80">
      
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
          <span>Pregunta {{ currentQuestionIndex + 1 }} de {{ questions.length }} • {{ selectedModeLabel }}</span>
          <span>{{ Math.round(((currentQuestionIndex + 1) / questions.length) * 100) }}%</span>
        </div>
        <div class="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            class="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Question Banner -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 font-fredoka text-xs mb-3">
          <span>{{ currentQuestion.questionType === 'AUDIO_TO_IMAGE' ? '🎧 ESCUCHA Y ELIGE LA FOTO' : '📖 OBSERVA LA FOTO Y LEE LA PALABRA' }}</span>
        </div>

        <!-- LISTEN MODE QUESTION: Audio to Image -->
        <div v-if="currentQuestion.questionType === 'AUDIO_TO_IMAGE'" class="flex flex-col items-center">
          <h3 class="text-2xl sm:text-3xl font-bold font-fredoka text-white mb-4">
            ¿Cuál foto corresponde a esta palabra?
          </h3>
          <AudioButton 
            :text="currentQuestion.targetWord.englishWord" 
            size="xl" 
            variant="gradient"
            label="Toca para Escuchar la Pronunciación 🔊"
          />
        </div>

        <!-- READ MODE QUESTION: Image to Word -->
        <div v-else class="flex flex-col items-center">
          <h3 class="text-2xl sm:text-3xl font-bold font-fredoka text-white mb-4">
            ¿Cómo se escribe/llama esto en inglés?
          </h3>
          <div class="w-64 h-48 rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-xl mb-2">
            <img 
              :src="currentQuestion.selectedImage" 
              :alt="currentQuestion.targetWord.englishWord"
              class="w-full h-full object-cover"
            />
          </div>
          <span class="text-[11px] text-slate-400">
            ✨ Imagen seleccionada aleatoriamente
          </span>
        </div>

      </div>

      <!-- Multiple Choice Options -->

      <!-- LISTEN MODE: Options are IMAGES -->
      <div v-if="currentQuestion.questionType === 'AUDIO_TO_IMAGE'" class="grid grid-cols-2 gap-4">
        <button
          v-for="option in currentQuestion.options"
          :key="option.id"
          @click="selectAnswer(option)"
          :disabled="isAnswered"
          :class="[
            'group relative rounded-2xl overflow-hidden border-4 transition-all duration-300 aspect-square text-left cursor-pointer',
            getOptionBorderClass(option)
          ]"
        >
          <img 
            :src="option.displayImage" 
            :alt="option.englishWord"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />

          <!-- Overlay Badge on Selection -->
          <div 
            v-if="isAnswered && (option.id === currentQuestion.targetWord.id || option.id === selectedOptionId)"
            class="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center font-fredoka font-bold text-lg text-white"
          >
            <span v-if="option.id === currentQuestion.targetWord.id" class="text-emerald-400 text-3xl">✓ ¡Correcto!</span>
            <span v-else-if="option.id === selectedOptionId" class="text-rose-400 text-3xl">✗ Ups</span>
          </div>
        </button>
      </div>

      <!-- READ MODE: Options are TEXT WORDS -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          v-for="option in currentQuestion.options"
          :key="option.id"
          @click="selectAnswer(option)"
          :disabled="isAnswered"
          :class="[
            'p-5 rounded-2xl border-2 font-fredoka text-left transition-all duration-300 flex items-center justify-between cursor-pointer',
            getOptionTextClass(option)
          ]"
        >
          <div>
            <span class="text-2xl font-bold block text-white capitalize">{{ option.englishWord }}</span>
            <span class="text-xs text-slate-400">{{ option.spanishMeaning }}</span>
          </div>

          <div class="flex items-center gap-2">
            <AudioButton 
              :text="option.englishWord" 
              size="sm" 
              variant="icon-only"
              :showLabel="false"
            />
            <span v-if="isAnswered && option.id === currentQuestion.targetWord.id" class="text-emerald-400 font-bold text-xl">✓</span>
            <span v-else-if="isAnswered && option.id === selectedOptionId" class="text-rose-400 font-bold text-xl">✗</span>
          </div>
        </button>
      </div>

      <!-- Feedback Banner & Next Button -->
      <div v-if="isAnswered" class="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold', isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400']">
            {{ isCorrect ? '🎉' : '💡' }}
          </div>
          <div>
            <h4 :class="['font-fredoka font-bold text-lg', isCorrect ? 'text-emerald-400' : 'text-rose-400']">
              {{ isCorrect ? '¡Excelente trabajo!' : '¡Casi lo logras!' }}
            </h4>
            <p class="text-xs text-slate-300">
              La palabra correcta era: <strong class="text-white capitalize">{{ currentQuestion.targetWord.englishWord }}</strong> ({{ currentQuestion.targetWord.spanishMeaning }})
            </p>
          </div>
        </div>

        <button 
          @click="nextQuestion"
          class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-fredoka font-bold text-base shadow-lg shadow-pink-500/25 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>{{ currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados Finales' }}</span>
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>

    </div>

    <!-- Empty Quiz Warning -->
    <div v-else-if="selectedMode && questions.length === 0" class="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto">
      <span class="text-6xl mb-4 block">⚠️</span>
      <h3 class="text-xl font-bold font-fredoka text-white mb-2">No hay suficientes palabras para el test</h3>
      <p class="text-slate-400 text-sm mb-6">Necesitas al menos 2 palabras registradas en esta categoría.</p>
      <router-link to="/admin" class="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-fredoka font-bold">
        Agregar Palabras en Administración
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Star, ArrowRight } from 'lucide-vue-next'
import { getCategoryById, getWordsByCategory } from '../services/db'
import { speakEnglish, playCorrectSound, playWrongSound } from '../services/audio'
import AudioButton from '../components/AudioButton.vue'

const props = defineProps({
  categoryId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const category = ref(null)
const words = ref([])
const questions = ref([])
const currentQuestionIndex = ref(0)
const selectedOptionId = ref(null)
const isAnswered = ref(false)
const isCorrect = ref(false)
const score = ref(0)
const loading = ref(false)

const selectedMode = ref(null) // 'LISTEN', 'READ', 'MIXED'
const userAnswers = ref([])

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null)

const selectedModeLabel = computed(() => {
  if (selectedMode.value === 'LISTEN') return 'Modo Escucha 🎧'
  if (selectedMode.value === 'READ') return 'Modo Lectura 📖'
  return 'Modo Mixto 🎲'
})

const shuffleArray = (arr) => {
  const array = [...arr]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const getRandomImageFromWord = (word) => {
  if (!word.images || word.images.length === 0) return null
  const randomIndex = Math.floor(Math.random() * word.images.length)
  return word.images[randomIndex]
}

const startQuizWithMode = async (mode) => {
  selectedMode.value = mode
  loading.value = true

  try {
    if (words.value.length < 2) {
      loading.value = false
      return
    }

    const targetWords = shuffleArray(words.value)
    const generatedQuestions = []

    targetWords.forEach((targetWord, index) => {
      const selectedImage = getRandomImageFromWord(targetWord)

      const otherWords = words.value.filter(w => w.id !== targetWord.id)
      const shuffledOthers = shuffleArray(otherWords)
      const distractors = shuffledOthers.slice(0, 3)

      const rawOptions = [targetWord, ...distractors]
      const options = shuffleArray(rawOptions).map(opt => ({
        ...opt,
        displayImage: getRandomImageFromWord(opt)
      }))

      // Determine Question Type based on user selected mode!
      let questionType = 'AUDIO_TO_IMAGE' // default LISTEN
      if (mode === 'READ') {
        questionType = 'IMAGE_TO_WORD'
      } else if (mode === 'MIXED') {
        questionType = index % 2 === 0 ? 'AUDIO_TO_IMAGE' : 'IMAGE_TO_WORD'
      }

      generatedQuestions.push({
        id: `q_${index}`,
        targetWord,
        selectedImage,
        options,
        questionType
      })
    })

    questions.value = generatedQuestions
    currentQuestionIndex.value = 0
    score.value = 0
    userAnswers.value = []

    startCurrentQuestion()
  } catch (err) {
    console.error('Error generating quiz:', err)
  } finally {
    loading.value = false
  }
}

const startCurrentQuestion = () => {
  selectedOptionId.value = null
  isAnswered.value = false
  isCorrect.value = false

  if (currentQuestion.value && currentQuestion.value.questionType === 'AUDIO_TO_IMAGE') {
    setTimeout(() => {
      speakEnglish(currentQuestion.value.targetWord.englishWord)
    }, 250)
  }
}

const selectAnswer = (option) => {
  if (isAnswered.value) return

  selectedOptionId.value = option.id
  isAnswered.value = true
  isCorrect.value = (option.id === currentQuestion.value.targetWord.id)

  if (isCorrect.value) {
    score.value++
    playCorrectSound()
  } else {
    playWrongSound()
  }

  userAnswers.value.push({
    questionNumber: currentQuestionIndex.value + 1,
    targetWord: currentQuestion.value.targetWord,
    selectedOption: option,
    selectedImage: currentQuestion.value.selectedImage || option.displayImage,
    isCorrect: isCorrect.value
  })
}

const getOptionBorderClass = (option) => {
  if (!isAnswered.value) {
    return 'border-slate-700/80 hover:border-pink-500 hover:scale-102 hover:shadow-lg'
  }
  if (option.id === currentQuestion.value.targetWord.id) {
    return 'border-emerald-500 ring-4 ring-emerald-500/30'
  }
  if (option.id === selectedOptionId.value) {
    return 'border-rose-500 ring-4 ring-rose-500/30'
  }
  return 'border-slate-800 opacity-40'
}

const getOptionTextClass = (option) => {
  if (!isAnswered.value) {
    return 'bg-slate-900/90 border-slate-700 hover:border-pink-500 hover:bg-slate-800 hover:scale-101'
  }
  if (option.id === currentQuestion.value.targetWord.id) {
    return 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
  }
  if (option.id === selectedOptionId.value) {
    return 'bg-rose-950/80 border-rose-500 text-rose-200'
  }
  return 'bg-slate-900/50 border-slate-800 opacity-40'
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++
    startCurrentQuestion()
  } else {
    const resultData = {
      categoryId: category.value ? category.value.id : null,
      categoryName: category.value ? category.value.name : 'Examen',
      categoryIcon: category.value ? category.value.icon : '⭐',
      score: score.value,
      total: questions.value.length,
      answers: userAnswers.value
    }
    
    sessionStorage.setItem('lastQuizResult', JSON.stringify(resultData))
    router.push({ name: 'quiz-result' })
  }
}

onMounted(async () => {
  try {
    category.value = await getCategoryById(props.categoryId)
    words.value = await getWordsByCategory(props.categoryId)
  } catch (e) {
    console.error('Error loading quiz category info:', e)
  }
})
</script>
