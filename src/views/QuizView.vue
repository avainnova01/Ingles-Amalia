<template>
  <div class="min-h-[calc(100vh-80px)] py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
    
    <!-- Top Progress Header -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <router-link 
        to="/" 
        class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-fredoka text-sm border border-slate-200 shadow-sm transition"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Salir del Test</span>
      </router-link>

      <!-- Score Pill (Only when quiz is active) -->
      <div v-if="selectedMode && questions.length > 0" class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-amber-600 font-fredoka font-bold text-sm">
        <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
        <span>Puntos: {{ score }} / {{ questions.length }}</span>
      </div>
    </div>

    <!-- MODE SELECTION SCREEN (Choose Listen vs Read mode) -->
    <div v-if="!selectedMode" class="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 text-center max-w-2xl mx-auto">
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 font-fredoka text-xs mb-4">
        <span>🎮 Elige el tipo de test</span>
      </div>

      <h2 class="text-3xl sm:text-4xl font-bold font-fredoka text-slate-800 mb-2">
        ¿Cómo quieres jugar hoy?
      </h2>
      <p class="text-slate-500 text-sm sm:text-base mb-8 max-w-md mx-auto">
        Categoría: <strong class="text-sky-600">{{ category?.name }}</strong>. Escoge tu modalidad preferida:
      </p>

      <!-- Mode Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        
        <!-- Option 1: LISTEN MODE -->
        <button 
          @click="startQuizWithMode('LISTEN')"
          class="group p-6 rounded-3xl bg-slate-50 hover:bg-sky-50/50 border-2 border-slate-200 hover:border-sky-500 text-left transition duration-200 flex flex-col justify-between cursor-pointer hover:scale-[1.02] shadow-sm"
        >
          <div>
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-3xl shadow-md mb-4 group-hover:scale-110 transition-transform text-white">
              🎧
            </div>
            <h3 class="text-xl font-bold font-fredoka text-slate-800 group-hover:text-sky-600 transition-colors mb-1">
              Modo Escucha (Listen)
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              La app pronuncia la palabra en inglés y tú debes seleccionar la imagen correcta.
            </p>
          </div>

          <div class="mt-6 inline-flex items-center gap-2 text-xs font-bold text-sky-600 font-fredoka">
            <span>Iniciar Test de Escucha</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <!-- Option 2: READ MODE -->
        <button 
          @click="startQuizWithMode('READ')"
          class="group p-6 rounded-3xl bg-slate-50 hover:bg-indigo-50/50 border-2 border-slate-200 hover:border-indigo-500 text-left transition duration-200 flex flex-col justify-between cursor-pointer hover:scale-[1.02] shadow-sm"
        >
          <div>
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-md mb-4 group-hover:scale-110 transition-transform text-white">
              📖
            </div>
            <h3 class="text-xl font-bold font-fredoka text-slate-800 group-hover:text-indigo-600 transition-colors mb-1">
              Modo Lectura (Read)
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Observas una imagen y debes leer y escoger cuál es la palabra en inglés.
            </p>
          </div>

          <div class="mt-6 inline-flex items-center gap-2 text-xs font-bold text-indigo-600 font-fredoka">
            <span>Iniciar Test de Lectura</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

      <!-- Bonus Option 3: MIXED MODE -->
      <button 
        @click="startQuizWithMode('MIXED')"
        class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 text-slate-600 hover:text-slate-900 font-fredoka text-xs font-semibold flex items-center justify-center gap-2 transition"
      >
        <span>🎲 Probar Modo Mixto (Combinación de Escucha + Lectura)</span>
      </button>

    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
      <div class="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="font-fredoka text-slate-600">Preparando tu examen de inglés...</p>
    </div>

    <!-- Active Question Card -->
    <div v-else-if="currentQuestion" class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
      
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
          <span>Pregunta {{ currentQuestionIndex + 1 }} de {{ questions.length }} • {{ selectedModeLabel }}</span>
          <span>{{ Math.round(((currentQuestionIndex + 1) / questions.length) * 100) }}%</span>
        </div>
        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div 
            class="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
            :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Question Banner -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 font-fredoka text-xs mb-3">
          <span>{{ currentQuestion.questionType === 'AUDIO_TO_IMAGE' ? '🎧 ESCUCHA Y ELIGE LA FOTO' : '📖 OBSERVA LA FOTO Y LEE LA PALABRA' }}</span>
        </div>

        <!-- LISTEN MODE QUESTION: Audio to Image -->
        <div v-if="currentQuestion.questionType === 'AUDIO_TO_IMAGE'" class="flex flex-col items-center">
          <h3 class="text-2xl sm:text-3xl font-bold font-fredoka text-slate-800 mb-4">
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
          <h3 class="text-2xl sm:text-3xl font-bold font-fredoka text-slate-800 mb-3">
            ¿Cómo se llama esto en inglés?
          </h3>
          <div class="w-full max-w-[320px] sm:max-w-sm h-52 sm:h-64 rounded-3xl overflow-hidden bg-white border-2 border-slate-200 shadow-sm p-2 mb-3 flex items-center justify-center">
            <img 
              :src="currentQuestion.selectedImage" 
              :alt="currentQuestion.targetWord.englishWord"
              class="w-full h-full object-contain rounded-2xl"
            />
          </div>
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
            'group relative rounded-2xl overflow-hidden border-3 transition-all duration-300 aspect-square text-left cursor-pointer bg-slate-50',
            getOptionBorderClass(option)
          ]"
        >
          <img 
            :src="option.displayImage" 
            :alt="option.englishWord"
            class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
          />

          <!-- Overlay Badge on Selection -->
          <div 
            v-if="isAnswered && (option.id === currentQuestion.targetWord.id || option.id === selectedOptionId)"
            class="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center font-fredoka font-bold text-lg"
          >
            <span v-if="option.id === currentQuestion.targetWord.id" class="text-emerald-600 text-2xl">✓ ¡Correcto!</span>
            <span v-else-if="option.id === selectedOptionId" class="text-rose-500 text-2xl">✗ Ups</span>
          </div>
        </button>
      </div>

      <!-- READ MODE: Options are TEXT WORDS -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          v-for="option in currentQuestion.options"
          :key="option.id"
          @click="selectAnswer(option)"
          :disabled="isAnswered"
          :class="[
            'p-4 sm:p-5 rounded-2xl border-2 font-fredoka text-left transition-all duration-200 flex items-center justify-between cursor-pointer',
            getOptionTextClass(option)
          ]"
        >
          <div>
            <span class="text-xl sm:text-2xl font-bold block capitalize">{{ option.englishWord }}</span>
            <span class="text-xs text-slate-400 font-medium">{{ option.spanishMeaning }}</span>
          </div>

          <div class="flex items-center gap-2">
            <AudioButton 
              :text="option.englishWord" 
              size="sm" 
              variant="icon-only"
              :showLabel="false"
            />
            <span v-if="isAnswered && option.id === currentQuestion.targetWord.id" class="text-emerald-600 font-bold text-xl">✓</span>
            <span v-else-if="isAnswered && option.id === selectedOptionId" class="text-rose-500 font-bold text-xl">✗</span>
          </div>
        </button>
      </div>

      <!-- Feedback Banner & Next Button -->
      <div v-if="isAnswered" class="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold', isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600']">
            {{ isCorrect ? '🎉' : '💡' }}
          </div>
          <div>
            <h4 :class="['font-fredoka font-bold text-lg', isCorrect ? 'text-emerald-700' : 'text-rose-700']">
              {{ isCorrect ? '¡Excelente trabajo!' : '¡Casi lo logras!' }}
            </h4>
            <p class="text-xs text-slate-500">
              La palabra correcta era: <strong class="text-slate-800 capitalize">{{ currentQuestion.targetWord.englishWord }}</strong> ({{ currentQuestion.targetWord.spanishMeaning }})
            </p>
          </div>
        </div>

        <button 
          @click="nextQuestion"
          class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-fredoka font-bold text-base shadow-md shadow-sky-500/25 transition transform hover:scale-102 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>{{ currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados Finales' }}</span>
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>

    </div>

    <!-- Empty Quiz Warning -->
    <div v-else-if="selectedMode && questions.length === 0" class="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
      <span class="text-6xl mb-4 block">⚠️</span>
      <h3 class="text-xl font-bold font-fredoka text-slate-800 mb-2">No hay suficientes palabras para el test</h3>
      <p class="text-slate-500 text-sm mb-6">Necesitas al menos 2 palabras registradas en esta categoría.</p>
      <router-link to="/admin" class="px-6 py-3 rounded-2xl bg-sky-500 text-white font-fredoka font-bold shadow-md">
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

const selectedMode = ref(null)
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

const getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const generateQuestions = () => {
  if (words.value.length < 2) return

  const generated = []
  const shuffledWords = shuffleArray(words.value)

  shuffledWords.forEach(targetWord => {
    let qType = selectedMode.value
    if (qType === 'MIXED') {
      qType = Math.random() > 0.5 ? 'AUDIO_TO_IMAGE' : 'IMAGE_TO_WORD'
    } else if (qType === 'LISTEN') {
      qType = 'AUDIO_TO_IMAGE'
    } else {
      qType = 'IMAGE_TO_WORD'
    }

    const otherWords = words.value.filter(w => w.id !== targetWord.id)
    const shuffledDistractors = shuffleArray(otherWords)
    const distractors = shuffledDistractors.slice(0, Math.min(3, otherWords.length))

    const rawOptions = [targetWord, ...distractors]
    const optionsWithOptionsImages = rawOptions.map(opt => {
      const selectedImg = (opt.images && opt.images.length > 0)
        ? getRandomItem(opt.images)
        : null
      return {
        ...opt,
        displayImage: selectedImg
      }
    })

    const options = shuffleArray(optionsWithOptionsImages)

    const questionSelectedImage = (targetWord.images && targetWord.images.length > 0)
      ? getRandomItem(targetWord.images)
      : null

    generated.push({
      targetWord,
      questionType: qType,
      selectedImage: questionSelectedImage,
      options
    })
  })

  questions.value = generated
}

const startQuizWithMode = (mode) => {
  selectedMode.value = mode
  generateQuestions()
  currentQuestionIndex.value = 0
  score.value = 0
  userAnswers.value = []
  startCurrentQuestion()
}

const startCurrentQuestion = () => {
  isAnswered.value = false
  selectedOptionId.value = null
  isCorrect.value = false

  if (currentQuestion.value && currentQuestion.value.questionType === 'AUDIO_TO_IMAGE') {
    setTimeout(() => {
      speakEnglish(currentQuestion.value.targetWord.englishWord, 0.85)
    }, 400)
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
    return 'border-slate-200 hover:border-sky-500 hover:scale-102 hover:shadow-md'
  }
  if (option.id === currentQuestion.value.targetWord.id) {
    return 'border-emerald-500 ring-4 ring-emerald-500/25'
  }
  if (option.id === selectedOptionId.value) {
    return 'border-rose-500 ring-4 ring-rose-500/25'
  }
  return 'border-slate-200 opacity-40'
}

const getOptionTextClass = (option) => {
  if (!isAnswered.value) {
    return 'bg-slate-50 border-slate-200 hover:border-sky-500 hover:bg-sky-50/30 text-slate-800 hover:scale-[1.01]'
  }
  if (option.id === currentQuestion.value.targetWord.id) {
    return 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
  }
  if (option.id === selectedOptionId.value) {
    return 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
  }
  return 'bg-slate-50 border-slate-200 opacity-40 text-slate-400'
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
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
