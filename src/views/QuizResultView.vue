<template>
  <div class="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
    
    <!-- Result Card -->
    <div class="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700/80 text-center relative overflow-hidden mb-8">
      
      <!-- Background confetti / glow effect -->
      <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Category badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-fredoka text-xs mb-4">
        <span>{{ result.categoryIcon || '🎯' }} {{ result.categoryName || 'Examen de Inglés' }}</span>
      </div>

      <!-- Title & Celebratory Emoji -->
      <div class="text-6xl sm:text-7xl mb-4 animate-bounce">
        {{ getEmojiForScore(result.score, result.total) }}
      </div>

      <h2 class="text-3xl sm:text-5xl font-bold font-fredoka text-white tracking-tight mb-2">
        {{ getTitleForScore(result.score, result.total) }}
      </h2>

      <p class="text-slate-300 text-base sm:text-lg max-w-md mx-auto mb-8 font-medium">
        {{ getSubtitleForScore(result.score, result.total) }}
      </p>

      <!-- Score Gauge Display -->
      <div class="inline-flex items-center justify-center p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-inner mb-8 min-w-[240px]">
        <div class="text-center">
          <span class="text-5xl sm:text-6xl font-bold font-fredoka bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            {{ result.score }} / {{ result.total }}
          </span>
          <span class="block text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Respuestas Correctas
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <router-link 
          to="/" 
          class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-fredoka font-bold text-base shadow-lg shadow-indigo-600/25 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Home class="w-5 h-5" />
          <span>Volver al Inicio</span>
        </router-link>

        <router-link 
          v-if="result.categoryId"
          :to="`/quiz/${result.categoryId}`"
          class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-fredoka font-bold text-base transition flex items-center justify-center gap-2"
        >
          <RotateCcw class="w-5 h-5 text-pink-400" />
          <span>Intentar de nuevo</span>
        </router-link>
      </div>

    </div>

    <!-- Detailed Answer Breakdown ("Cuales fueron las buenas y cuales las malas") -->
    <div v-if="result.answers && result.answers.length > 0" class="glass-card rounded-3xl p-6 sm:p-8">
      
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 class="text-xl font-bold font-fredoka text-white flex items-center gap-2">
            <span>📋 Resumen de Respuestas</span>
          </h3>
          <p class="text-xs text-slate-400">Revisa tus respuestas para seguir aprendiendo</p>
        </div>

        <div class="flex items-center gap-3 text-xs font-semibold">
          <span class="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ✓ {{ correctCount }} Correctas
          </span>
          <span v-if="wrongCount > 0" class="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            ✗ {{ wrongCount }} A repasar
          </span>
        </div>
      </div>

      <!-- Items Grid -->
      <div class="space-y-4">
        <div 
          v-for="(item, idx) in result.answers" 
          :key="idx"
          :class="[
            'p-4 rounded-2xl border transition flex flex-col sm:flex-row items-center justify-between gap-4',
            item.isCorrect ? 'bg-slate-900/60 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'
          ]"
        >
          <!-- Left: Thumbnail Image + Word details -->
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
              <img 
                v-if="item.selectedImage || item.targetWord.images?.[0]" 
                :src="item.selectedImage || item.targetWord.images[0]" 
                :alt="item.targetWord.englishWord"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-xl">🖼️</div>
            </div>

            <div>
              <div class="flex items-center gap-2">
                <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', item.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400']">
                  {{ item.isCorrect ? 'Correcta ✓' : 'Incorrecta ✗' }}
                </span>
                <span class="text-xs text-slate-400">Pregunta {{ item.questionNumber }}</span>
              </div>
              <h4 class="text-lg font-bold font-fredoka text-white capitalize mt-1">
                {{ item.targetWord.englishWord }}
              </h4>
              <p class="text-xs text-slate-400">
                Significado: {{ item.targetWord.spanishMeaning }}
              </p>
            </div>
          </div>

          <!-- Right: User selected answer & Audio Button -->
          <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <div v-if="!item.isCorrect" class="text-right text-xs">
              <span class="text-slate-400 block">Tu respuesta:</span>
              <span class="text-rose-300 font-semibold capitalize">{{ item.selectedOption?.englishWord || 'No respondida' }}</span>
            </div>

            <!-- Audio button so Amalia can listen and review! -->
            <AudioButton 
              :text="item.targetWord.englishWord" 
              size="sm" 
              variant="primary"
              label="Escuchar"
            />
          </div>

        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Home, RotateCcw } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { playFanfareSound } from '../services/audio'
import AudioButton from '../components/AudioButton.vue'

const result = ref({
  categoryName: 'Examen',
  categoryIcon: '⭐',
  score: 0,
  total: 0,
  answers: []
})

const correctCount = computed(() => result.value.answers.filter(a => a.isCorrect).length)
const wrongCount = computed(() => result.value.answers.filter(a => !a.isCorrect).length)

const triggerCelebration = () => {
  try {
    playFanfareSound()
    // Launch confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  } catch (e) {
    console.error('Confetti error:', e)
  }
}

const getEmojiForScore = (score, total) => {
  if (total === 0) return '🏆'
  const percentage = (score / total) * 100
  if (percentage === 100) return '🎉'
  if (percentage >= 80) return '🌟'
  if (percentage >= 50) return '👍'
  return '💪'
}

const getTitleForScore = (score, total) => {
  if (total === 0) return '¡Test Completado!'
  const percentage = (score / total) * 100
  if (percentage === 100) return '¡Puntuación Perfecta!'
  if (percentage >= 80) return '¡Excelente Trabajo!'
  if (percentage >= 50) return '¡Muy Buen Intento!'
  return '¡Sigue Practicando!'
}

const getSubtitleForScore = (score, total) => {
  if (total === 0) return 'Has terminado la prueba.'
  const percentage = (score / total) * 100
  if (percentage === 100) return '¡Respondiste todas las preguntas de forma correcta! Eres una campeona. 🥇'
  if (percentage >= 80) return `¡Felicitaciones! Sacaste ${score} de ${total}. Estás aprendiendo súper rápido.`
  if (percentage >= 50) return `Lograste ${score} de ${total} respuestas correctas. Revisa las palabras abajo para mejorar.`
  return `Obtuviste ${score} de ${total}. No te preocupes, puedes volver a repasar la lección.`
}

onMounted(() => {
  const stored = sessionStorage.getItem('lastQuizResult')
  if (stored) {
    try {
      result.value = JSON.parse(stored)
      const pct = (result.value.score / (result.value.total || 1)) * 100
      if (pct >= 80) {
        triggerCelebration()
      }
    } catch (e) {
      console.error('Error parsing stored quiz result:', e)
    }
  }
})
</script>
