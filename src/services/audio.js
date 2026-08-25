// Audio service handling Web Speech API TTS and Web Audio API playful sound effects.

let synth = typeof window !== 'undefined' ? window.speechSynthesis : null
let voices = []
let englishVoice = null

// Initialize available voices
const initVoices = () => {
  if (!synth) return
  voices = synth.getVoices()
  // Prioritize high quality English voices (US or UK)
  englishVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB') && v.name.includes('Natural')) ||
                 voices.find(v => v.lang === 'en-US') ||
                 voices.find(v => v.lang.startsWith('en')) ||
                 voices[0]
}

if (synth) {
  initVoices()
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = initVoices
  }
}

/**
 * Speaks an English text using Web Speech API
 * @param {string} text - Word or phrase to speak
 * @param {number} rate - Speed of speech (0.8 = ideal for kids learning)
 */
export const speakEnglish = (text, rate = 0.85) => {
  if (!synth) {
    console.warn('Web Speech API is not supported in this browser.')
    return
  }

  // Cancel any ongoing speech
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate
  utterance.pitch = 1.05 // Friendly kid tone

  if (englishVoice) {
    utterance.voice = englishVoice
  }

  synth.speak(utterance)
}

/**
 * Plays a cheerful Web Audio synthesizer sound for correct answer
 */
export const playCorrectSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime + startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + startTime)
      osc.stop(ctx.currentTime + startTime + duration)
    }

    // Arpeggio C-E-G-C (high happy sound)
    playNote(523.25, 0, 0.15)     // C5
    playNote(659.25, 0.1, 0.15)   // E5
    playNote(783.99, 0.2, 0.15)   // G5
    playNote(1046.50, 0.3, 0.3)   // C6
  } catch (e) {
    console.error('Audio synth error:', e)
  }
}

/**
 * Plays a soft bounce sound for incorrect answer
 */
export const playWrongSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(250, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.3)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch (e) {
    console.error('Audio synth error:', e)
  }
}

/**
 * Plays a fan-fare cheer sound when quiz is completed with high score
 */
export const playFanfareSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.30, d: 0.15 },
      { f: 1046.50, t: 0.45, d: 0.50 }
    ]

    notes.forEach(n => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t)
      gain.gain.setValueAtTime(0.2, ctx.currentTime + n.t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + n.t)
      osc.stop(ctx.currentTime + n.t + n.d)
    })
  } catch (e) {
    console.error('Audio synth error:', e)
  }
}
