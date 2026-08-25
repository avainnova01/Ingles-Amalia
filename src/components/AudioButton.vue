<template>
  <button 
    @click.stop="handleClick" 
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg cursor-pointer',
      sizeClasses,
      variantClasses,
      isSpeaking ? 'ring-4 ring-pink-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''
    ]"
    :title="`Escuchar pronunciación de '${text}'`"
    type="button"
  >
    <Volume2 :class="[iconSizeClasses, isSpeaking ? 'animate-bounce text-pink-300' : '']" />
    <span v-if="showLabel" class="font-fredoka tracking-wide">
      {{ isSpeaking ? 'Escuchando...' : (label || 'Pronunciar') }}
    </span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { Volume2 } from 'lucide-vue-next'
import { speakEnglish } from '../services/audio'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    default: 0.85
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg', 'xl'
  },
  variant: {
    type: String,
    default: 'primary' // 'primary', 'secondary', 'icon-only', 'gradient'
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  label: {
    type: String,
    default: ''
  }
})

const isSpeaking = ref(false)

const handleClick = () => {
  if (!props.text) return
  isSpeaking.value = true
  speakEnglish(props.text, props.rate)
  
  setTimeout(() => {
    isSpeaking.value = false
  }, 1200)
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
  xl: 'px-8 py-5 text-xl'
}[props.size] || 'px-4 py-2.5 text-sm'

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}[props.size] || 'w-5 h-5'

const variantClasses = {
  primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-indigo-500/25',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-slate-900/50',
  gradient: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 text-white shadow-pink-500/30',
  'icon-only': 'p-3 bg-purple-600/80 hover:bg-purple-500 text-white rounded-full shadow-purple-900/50'
}[props.variant] || 'bg-violet-600 text-white'
</script>
