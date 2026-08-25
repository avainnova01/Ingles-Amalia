<template>
  <div class="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    
    <!-- Admin Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 glass-panel p-6 rounded-3xl border border-slate-700/80">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
          <Settings class="w-3.5 h-3.5" />
          <span>Módulo Administrativo</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold font-fredoka text-white">
          Gestión de Vocabulario e Imágenes
        </h2>
        <p class="text-sm text-slate-400">
          Crea grupos, añade palabras en inglés y sincroniza directamente con tu proyecto Firebase Cloud.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Cloud Sync Button -->
        <button 
          @click="handleForceSync" 
          :disabled="isSyncing"
          class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-fredoka font-semibold text-xs transition flex items-center gap-2 disabled:opacity-50"
        >
          <Cloud :class="['w-4 h-4 text-emerald-400', isSyncing ? 'animate-spin' : '']" />
          <span>{{ isSyncing ? 'Sincronizando...' : '☁️ Forzar Sincronización Firebase' }}</span>
        </button>

        <button 
          @click="openCategoryModal()" 
          class="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-fredoka font-semibold text-sm shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <Plus class="w-5 h-5" />
          <span>+ Nueva Categoría</span>
        </button>
      </div>
    </div>

    <!-- Firebase Connection Banner -->
    <div v-if="syncMessage" :class="['mb-6 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between', syncSuccess ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border-rose-500/50 text-rose-200']">
      <div class="flex items-center gap-2">
        <span>{{ syncSuccess ? '🟢' : '⚠️' }}</span>
        <span>{{ syncMessage }}</span>
      </div>
      <button @click="syncMessage = ''" class="text-slate-400 hover:text-white">✕</button>
    </div>

    <!-- Main Layout: Left = Categories List, Right = Words & Multi-Image Uploads for Selected Category -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Column: Category Selector Sidebar (4 Cols) -->
      <div class="lg:col-span-4 space-y-4">
        <h3 class="text-lg font-bold font-fredoka text-slate-200 flex items-center gap-2 px-1">
          <FolderLayout class="w-5 h-5 text-pink-400" />
          <span>Grupos / Categorías</span>
        </h3>

        <!-- Loading -->
        <div v-if="loadingCategories" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-20 bg-slate-800/50 animate-pulse rounded-2xl border border-slate-800"></div>
        </div>

        <!-- Category Cards List -->
        <div v-else-if="categories.length > 0" class="space-y-3">
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectCategory(cat)"
            :class="[
              'p-4 rounded-2xl transition-all cursor-pointer border flex items-center justify-between group',
              selectedCategory?.id === cat.id 
                ? 'bg-slate-800 border-pink-500/80 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/40' 
                : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
            ]"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl">
                {{ cat.icon || '📁' }}
              </div>
              <div>
                <h4 class="font-bold font-fredoka text-white group-hover:text-pink-300 transition-colors">
                  {{ cat.name }}
                </h4>
                <p class="text-xs text-indigo-300">
                  {{ cat.englishName }} • {{ wordCounts[cat.id] || 0 }} palabras
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <button 
                @click.stop="openCategoryModal(cat)"
                class="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                title="Editar Categoría"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button 
                @click.stop="confirmDeleteCategory(cat)"
                class="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition"
                title="Eliminar Categoría"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="glass-card p-6 rounded-2xl text-center text-slate-400 text-sm">
          No hay categorías creadas. Haz clic arriba en "+ Nueva Categoría".
        </div>

      </div>

      <!-- Right Column: Words & Multi-Image Manager (8 Cols) -->
      <div class="lg:col-span-8">
        
        <div v-if="selectedCategory" class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80">
          
          <!-- Category Header info -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <span class="text-4xl">{{ selectedCategory.icon || '📂' }}</span>
              <div>
                <h3 class="text-2xl font-bold font-fredoka text-white">
                  {{ selectedCategory.name }}
                </h3>
                <p class="text-xs text-indigo-300">
                  {{ selectedCategory.englishName }} • Listado de palabras asociadas
                </p>
              </div>
            </div>

            <button 
              @click="openWordModal()" 
              class="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-fredoka text-xs font-semibold shadow-md shadow-pink-600/20 transition flex items-center gap-2"
            >
              <Plus class="w-4 h-4" />
              <span>+ Agregar Palabra a {{ selectedCategory.name }}</span>
            </button>
          </div>

          <!-- Words List for selected Category -->
          <div v-if="loadingWords" class="space-y-4">
            <div v-for="i in 3" :key="i" class="h-28 bg-slate-800/40 animate-pulse rounded-2xl"></div>
          </div>

          <div v-else-if="words.length > 0" class="space-y-4">
            <div 
              v-for="word in words" 
              :key="word.id"
              class="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition"
            >
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                
                <!-- Word Title & Audio preview -->
                <div class="flex items-center gap-3">
                  <AudioButton 
                    :text="word.englishWord" 
                    size="sm" 
                    variant="primary"
                    :showLabel="false"
                  />
                  <div>
                    <h4 class="text-xl font-bold font-fredoka text-white capitalize">
                      {{ word.englishWord }}
                    </h4>
                    <p class="text-xs text-slate-400">
                      Español: {{ word.spanishMeaning }}
                    </p>
                  </div>
                </div>

                <!-- Word Actions -->
                <div class="flex items-center gap-2">
                  <button 
                    @click="openWordModal(word)"
                    class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                    <span>Editar / Fotos</span>
                  </button>

                  <button 
                    @click="confirmDeleteWord(word)"
                    class="p-1.5 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 transition"
                    title="Eliminar Palabra"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

              </div>

              <!-- Multi-Image Thumbnails Gallery & Main Image Selector -->
              <div>
                <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                  <span>Imágenes (Toca ⭐ para elegir la imagen principal de estudio):</span>
                  <span v-if="word.images?.length > 1" class="text-amber-400">📸 {{ word.images.length }} fotos (Variación en tests)</span>
                </div>

                <div v-if="word.images && word.images.length > 0" class="flex flex-wrap gap-3">
                  <div 
                    v-for="(imgUrl, imgIdx) in word.images" 
                    :key="imgIdx"
                    :class="[
                      'relative group/img w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border-2 transition flex-shrink-0',
                      imgIdx === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 opacity-80 hover:opacity-100'
                    ]"
                  >
                    <img :src="imgUrl" :alt="word.englishWord" class="w-full h-full object-cover" />

                    <!-- Main Image ⭐ Badge -->
                    <span 
                      v-if="imgIdx === 0" 
                      class="absolute top-1 left-1 bg-amber-500 text-slate-950 px-1 py-0.5 rounded font-bold text-[9px] flex items-center gap-0.5 shadow-md"
                    >
                      <Star class="w-2.5 h-2.5 fill-slate-950" /> Principal
                    </span>

                    <!-- Make Main Button (if not already main) -->
                    <button 
                      v-else
                      @click="setAsMainImage(word, imgIdx)"
                      class="absolute top-1 left-1 p-1 rounded-md bg-slate-900/90 text-amber-300 opacity-0 group-hover/img:opacity-100 transition hover:scale-110"
                      title="Hacer esta la imagen principal de estudio"
                    >
                      <Star class="w-3.5 h-3.5 fill-amber-300" />
                    </button>

                    <!-- Delete Photo Button -->
                    <button 
                      @click="removeImageFromWord(word, imgIdx)"
                      class="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white opacity-0 group-hover/img:opacity-100 transition hover:scale-110"
                      title="Eliminar foto"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div v-else class="text-xs text-slate-500 italic">
                  Sin imágenes asignadas aún. Haz clic en "Editar / Fotos" para subir imágenes.
                </div>
              </div>

            </div>
          </div>

          <!-- Empty Words State -->
          <div v-else class="text-center py-12">
            <span class="text-5xl block mb-3">📝</span>
            <h4 class="text-lg font-bold font-fredoka text-white mb-1">No hay palabras en este grupo</h4>
            <p class="text-xs text-slate-400 mb-4">Agrega palabras como "bedroom", "kitchen", etc., y asígnales sus imágenes.</p>
            <button 
              @click="openWordModal()" 
              class="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-fredoka text-xs font-semibold"
            >
              + Crear Primera Palabra
            </button>
          </div>

        </div>

        <!-- No category selected prompt -->
        <div v-else class="glass-card p-12 rounded-3xl text-center text-slate-400">
          <span class="text-5xl block mb-3">👈</span>
          <h3 class="text-lg font-bold font-fredoka text-white">Selecciona una categoría de la izquierda</h3>
          <p class="text-xs text-slate-400">Para administrar sus palabras e imágenes asociadas.</p>
        </div>

      </div>

    </div>

    <!-- MODAL 1: CREATE / EDIT CATEGORY -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
        <button @click="showCategoryModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-xl font-bold font-fredoka text-white mb-4">
          {{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h3>

        <form @submit.prevent="handleSaveCategory" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Nombre en Español (ej: Partes de la casa)</label>
            <input 
              v-model="categoryForm.name" 
              required 
              type="text"
              placeholder="Ej: Partes de la casa"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Nombre en Inglés (ej: Parts of the House)</label>
            <input 
              v-model="categoryForm.englishName" 
              required 
              type="text"
              placeholder="Ej: Parts of the House"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Emoji / Icono Representativo</label>
            <input 
              v-model="categoryForm.icon" 
              type="text"
              placeholder="🏠, 🐶, 🍎..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4">
            <button 
              type="button" 
              @click="showCategoryModal = false" 
              class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 rounded-xl bg-pink-600 text-white font-fredoka text-xs font-semibold hover:bg-pink-500"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: CREATE / EDIT WORD & MULTI-IMAGE UPLOAD -->
    <div v-if="showWordModal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div class="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative my-8">
        <button @click="showWordModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-xl font-bold font-fredoka text-white mb-2">
          {{ editingWord ? 'Editar Palabra e Imágenes' : 'Nueva Palabra' }}
        </h3>
        <p class="text-xs text-indigo-300 mb-6">Categoría: {{ selectedCategory.name }}</p>

        <form @submit.prevent="handleSaveWord" class="space-y-4">
          
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Palabra en Inglés (ej: bedroom)</label>
            <div class="flex items-center gap-2">
              <input 
                v-model="wordForm.englishWord" 
                required 
                type="text"
                placeholder="Ej: bedroom"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
              />
              <AudioButton 
                v-if="wordForm.englishWord"
                :text="wordForm.englishWord" 
                size="sm" 
                variant="primary"
                :showLabel="false"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Traducción en Español (ej: Dormitorio / Habitación)</label>
            <input 
              v-model="wordForm.spanishMeaning" 
              required 
              type="text"
              placeholder="Ej: Habitacion / Dormitorio"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          <!-- MULTI-IMAGE UPLOAD AREA -->
          <div class="border-t border-slate-800 pt-4">
            <label class="block text-xs font-semibold text-slate-200 mb-2">
              📸 Imágenes (La 1ª foto es la principal de estudio):
            </label>

            <div class="border-2 border-dashed border-slate-700 hover:border-pink-500/80 rounded-2xl p-4 text-center bg-slate-950/60 transition cursor-pointer relative mb-3">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                @change="handleFileUpload" 
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <Upload class="w-8 h-8 mx-auto text-pink-400 mb-2" />
              <p class="text-xs font-semibold text-slate-200">
                Haz clic o arrastra fotos desde tu computador
              </p>
              <p class="text-[10px] text-slate-400 mt-1">
                Soporta JPG, PNG, WEBP. Puedes seleccionar múltiples fotos.
              </p>
            </div>

            <div class="flex items-center gap-2 mb-4">
              <input 
                v-model="newImageUrl" 
                type="text"
                placeholder="O pega el enlace URL de una imagen..."
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
              <button 
                type="button"
                @click="addImageUrl" 
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
              >
                + Añadir URL
              </button>
            </div>

            <div v-if="wordForm.images.length > 0" class="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              <div 
                v-for="(img, index) in wordForm.images" 
                :key="index"
                :class="[
                  'flex items-center justify-between gap-2 p-2 rounded-lg text-xs border transition',
                  index === 0 ? 'bg-amber-950/40 border-amber-500/60' : 'bg-slate-900 border-slate-800'
                ]"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <img :src="img" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                  <span class="truncate text-slate-300 text-[11px] max-w-[180px]">
                    {{ index === 0 ? '⭐ Imagen Principal de Estudio' : `Foto ${index + 1}` }}
                  </span>
                </div>

                <div class="flex items-center gap-1">
                  <button 
                    v-if="index !== 0"
                    type="button"
                    @click="makeFormImageMain(index)"
                    class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700"
                  >
                    ⭐ Principal
                  </button>

                  <button 
                    type="button" 
                    @click="removeFormImage(index)" 
                    class="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              type="button" 
              @click="showWordModal = false" 
              class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 rounded-xl bg-pink-600 text-white font-fredoka text-xs font-semibold hover:bg-pink-500"
            >
              Guardar Palabra
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Settings, Plus, Layout as FolderLayout, Edit2, Trash2, X, Upload, Star, Cloud } from 'lucide-vue-next'
import { getCategories, saveCategory, deleteCategory, getWordsByCategory, saveWord, deleteWord } from '../services/db'
import { syncAllLocalToFirebase, seedInitialDataIfEmpty } from '../services/seedData'
import AudioButton from '../components/AudioButton.vue'

const categories = ref([])
const wordCounts = ref({})
const words = ref([])
const selectedCategory = ref(null)

const loadingCategories = ref(true)
const loadingWords = ref(false)
const isSyncing = ref(false)
const syncMessage = ref('')
const syncSuccess = ref(true)

// Modals state
const showCategoryModal = ref(false)
const editingCategory = ref(null)
const categoryForm = ref({
  id: '',
  name: '',
  englishName: '',
  icon: '📁',
  color: 'from-pink-500 to-rose-500'
})

const showWordModal = ref(false)
const editingWord = ref(null)
const wordForm = ref({
  id: '',
  categoryId: '',
  englishWord: '',
  spanishMeaning: '',
  images: []
})
const newImageUrl = ref('')

const handleForceSync = async () => {
  isSyncing.value = true
  syncMessage.value = ''
  try {
    // Seed and sync all categories and words directly to Firebase
    await seedInitialDataIfEmpty()
    const res = await syncAllLocalToFirebase()
    syncSuccess.value = true
    syncMessage.value = `¡Sincronización Exitosa! Se enviaron ${res.categoriesSynced} categorías y ${res.wordsSynced} palabras a Firebase Firestore Cloud.`
    await loadCategories()
  } catch (err) {
    console.error('Firebase sync error:', err)
    syncSuccess.value = false
    syncMessage.value = `Error de Firebase: ${err.message || 'Verifica las reglas de seguridad en Firebase Console.'}`
  } finally {
    isSyncing.value = false
  }
}

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const list = await getCategories()
    categories.value = list

    const counts = {}
    for (const cat of list) {
      const wList = await getWordsByCategory(cat.id)
      counts[cat.id] = wList.length
    }
    wordCounts.value = counts

    if (list.length > 0 && !selectedCategory.value) {
      selectCategory(list[0])
    }
  } catch (e) {
    console.error('Error loading admin categories:', e)
  } finally {
    loadingCategories.value = false
  }
}

const selectCategory = async (cat) => {
  selectedCategory.value = cat
  loadingWords.value = true
  try {
    words.value = await getWordsByCategory(cat.id)
  } catch (e) {
    console.error('Error loading words for category:', e)
  } finally {
    loadingWords.value = false
  }
}

// Category CRUD
const openCategoryModal = (cat = null) => {
  editingCategory.value = cat
  if (cat) {
    categoryForm.value = { ...cat }
  } else {
    categoryForm.value = {
      id: `cat_${Date.now()}`,
      name: '',
      englishName: '',
      icon: '🏠',
      color: 'from-pink-500 to-rose-500'
    }
  }
  showCategoryModal.value = true
}

const handleSaveCategory = async () => {
  try {
    await saveCategory(categoryForm.value)
    showCategoryModal.value = false
    await loadCategories()
    syncSuccess.value = true
    syncMessage.value = `Categoría "${categoryForm.value.name}" guardada y enviada a Firebase Firestore.`
  } catch (err) {
    console.error('Error saving category:', err)
    syncSuccess.value = false
    syncMessage.value = `Error guardando en Firebase: ${err.message}`
  }
}

const confirmDeleteCategory = async (cat) => {
  if (confirm(`¿Estás seguro de eliminar la categoría "${cat.name}" y todas sus palabras?`)) {
    await deleteCategory(cat.id)
    if (selectedCategory.value?.id === cat.id) {
      selectedCategory.value = null
      words.value = []
    }
    await loadCategories()
  }
}

// Word CRUD & Multi-Image Upload
const openWordModal = (word = null) => {
  if (!selectedCategory.value) return

  editingWord.value = word
  newImageUrl.value = ''

  if (word) {
    wordForm.value = {
      ...word,
      images: Array.isArray(word.images) ? [...word.images] : []
    }
  } else {
    wordForm.value = {
      id: `w_${Date.now()}`,
      categoryId: selectedCategory.value.id,
      englishWord: '',
      spanishMeaning: '',
      images: []
    }
  }
  showWordModal.value = true
}

const handleFileUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      wordForm.value.images.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const addImageUrl = () => {
  if (newImageUrl.value.trim()) {
    wordForm.value.images.push(newImageUrl.value.trim())
    newImageUrl.value = ''
  }
}

const makeFormImageMain = (idx) => {
  const selected = wordForm.value.images.splice(idx, 1)[0]
  wordForm.value.images.unshift(selected)
}

const removeFormImage = (idx) => {
  wordForm.value.images.splice(idx, 1)
}

const setAsMainImage = async (word, imgIdx) => {
  const updatedImages = [...word.images]
  const selected = updatedImages.splice(imgIdx, 1)[0]
  updatedImages.unshift(selected)

  const updatedWord = { ...word, images: updatedImages }
  await saveWord(updatedWord)
  await selectCategory(selectedCategory.value)
}

const handleSaveWord = async () => {
  try {
    wordForm.value.categoryId = selectedCategory.value.id
    await saveWord(wordForm.value)
    showWordModal.value = false
    await selectCategory(selectedCategory.value)
    await loadCategories()
    syncSuccess.value = true
    syncMessage.value = `Palabra "${wordForm.value.englishWord}" guardada y sincronizada con Firebase Firestore.`
  } catch (err) {
    console.error('Error saving word:', err)
    syncSuccess.value = false
    syncMessage.value = `Error al guardar en Firebase: ${err.message}`
  }
}

const removeImageFromWord = async (word, imgIdx) => {
  const updatedImages = [...word.images]
  updatedImages.splice(imgIdx, 1)
  const updatedWord = { ...word, images: updatedImages }
  await saveWord(updatedWord)
  await selectCategory(selectedCategory.value)
}

const confirmDeleteWord = async (word) => {
  if (confirm(`¿Eliminar la palabra "${word.englishWord}"?`)) {
    await deleteWord(word.id)
    await selectCategory(selectedCategory.value)
    await loadCategories()
  }
}

onMounted(() => {
  loadCategories()
})
</script>
