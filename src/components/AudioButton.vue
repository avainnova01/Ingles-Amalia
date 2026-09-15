<template>
  <button 
    @click.stop="handleClick" 
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-sm cursor-pointer',
      sizeClasses,
      variantClasses,
      isSpeaking ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-white scale-105' : ''
    ]"
    :title="`Escuchar pronunciación de '${text}'`"
    type="button"
  >
    <Volume2 :class="[iconSizeClasses, isSpeaking ? 'animate-bounce text-amber-300' : '']" />
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
  primary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/25',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm',
  gradient: 'bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 hover:opacity-95 text-white shadow-sky-500/25',
  'icon-only': 'p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 rounded-full shadow-sm'
}[props.variant] || 'bg-sky-500 text-white'
</script>
