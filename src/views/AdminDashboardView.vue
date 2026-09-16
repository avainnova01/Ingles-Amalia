<template>
  <div class="min-h-[calc(100vh-80px)] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    
    <!-- Admin Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-2">
          <Settings class="w-3.5 h-3.5" />
          <span>Módulo Administrativo</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold font-fredoka text-slate-800">
          Gestión de Vocabulario e Imágenes
        </h2>
        <p class="text-xs sm:text-sm text-slate-500">
          Crea grupos, añade palabras en inglés y administra las imágenes principales de estudio.
        </p>
      </div>

      <button 
        @click="openCategoryModal()" 
        class="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-fredoka font-semibold text-sm shadow-md shadow-sky-500/20 transition flex items-center gap-2 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>+ Nueva Categoría</span>
      </button>
    </div>

    <!-- Firebase Connection Banner -->
    <div v-if="syncMessage" :class="['mb-6 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between', syncSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800']">
      <div class="flex items-center gap-2">
        <span>{{ syncSuccess ? '🟢' : '⚠️' }}</span>
        <span>{{ syncMessage }}</span>
      </div>
      <button @click="syncMessage = ''" class="text-slate-400 hover:text-slate-700">✕</button>
    </div>

    <!-- Main Layout: Left = Categories List, Right = Words & Multi-Image Uploads for Selected Category -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: Category Selector Sidebar (4 Cols) -->
      <div class="lg:col-span-4 space-y-3">
        <h3 class="text-base font-bold font-fredoka text-slate-800 flex items-center gap-2 px-1">
          <FolderLayout class="w-4 h-4 text-sky-500" />
          <span>Grupos / Categorías</span>
        </h3>

        <!-- Loading -->
        <div v-if="loadingCategories" class="space-y-2">
          <div v-for="i in 3" :key="i" class="h-16 bg-slate-200/60 animate-pulse rounded-2xl border border-slate-200"></div>
        </div>

        <!-- Category Cards List -->
        <div v-else-if="categories.length > 0" class="space-y-2.5">
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectCategory(cat)"
            :class="[
              'p-3.5 rounded-2xl transition-all cursor-pointer border flex items-center justify-between group shadow-xs',
              selectedCategory?.id === cat.id 
                ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-400/20 shadow-sm' 
                : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/80'
            ]"
          >
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                {{ cat.icon || '📁' }}
              </div>
              <div>
                <h4 class="font-bold font-fredoka text-slate-800 group-hover:text-sky-600 transition-colors text-sm">
                  {{ cat.name }}
                </h4>
                <p class="text-xs text-slate-500">
                  {{ cat.englishName }} • {{ wordCounts[cat.id] || 0 }} palabras
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 opacity-75 group-hover:opacity-100">
              <button 
                @click.stop="openCategoryModal(cat)"
                class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                title="Editar Categoría"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button 
                @click.stop="confirmDeleteCategory(cat)"
                class="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                title="Eliminar Categoría"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
          No hay categorías creadas. Haz clic arriba en "+ Nueva Categoría".
        </div>

      </div>

      <!-- Right Column: Words & Multi-Image Manager (8 Cols) -->
      <div class="lg:col-span-8">
        
        <div v-if="selectedCategory" class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
          
          <!-- Category Header info -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ selectedCategory.icon || '📂' }}</span>
              <div>
                <h3 class="text-xl sm:text-2xl font-bold font-fredoka text-slate-800">
                  {{ selectedCategory.name }}
                </h3>
                <p class="text-xs text-slate-500">
                  {{ selectedCategory.englishName }} • Listado de palabras asociadas
                </p>
              </div>
            </div>

            <button 
              @click="openWordModal()" 
              class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-fredoka text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+ Agregar Palabra</span>
            </button>
          </div>

          <!-- Words List for selected Category -->
          <div v-if="loadingWords" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-24 bg-slate-100 animate-pulse rounded-2xl"></div>
          </div>

          <div v-else-if="words.length > 0" class="space-y-3.5">
            <div 
              v-for="word in words" 
              :key="word.id"
              class="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition"
            >
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                
                <!-- Word Title & Audio preview -->
                <div class="flex items-center gap-3">
                  <AudioButton 
                    :text="word.englishWord" 
                    size="sm" 
                    variant="primary"
                    :showLabel="false"
                  />
                  <div>
                    <h4 class="text-lg font-bold font-fredoka text-slate-800 capitalize leading-tight">
                      {{ word.englishWord }}
                    </h4>
                    <p class="text-xs text-slate-500">
                      Español: {{ word.spanishMeaning }}
                    </p>
                  </div>
                </div>

                <!-- Word Actions -->
                <div class="flex items-center gap-2">
                  <button 
                    @click="openWordModal(word)"
                    class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                    <span>Editar / Fotos</span>
                  </button>

                  <button 
                    @click="confirmDeleteWord(word)"
                    class="p-1.5 hover:bg-rose-100 rounded-xl text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Eliminar Palabra"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

              </div>

              <!-- Multi-Image Thumbnails Gallery & Main Image Selector -->
              <div>
                <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span>Imágenes (Toca ⭐ para elegir la imagen principal de estudio):</span>
                  <span v-if="word.images?.length > 1" class="text-amber-600">📸 {{ word.images.length }} fotos</span>
                </div>

                <div v-if="word.images && word.images.length > 0" class="flex flex-wrap gap-2.5">
                  <div 
                    v-for="(imgUrl, imgIdx) in word.images" 
                    :key="imgIdx"
                    :class="[
                      'relative group/img w-18 h-18 rounded-xl overflow-hidden bg-white border-2 transition flex-shrink-0 shadow-xs',
                      imgIdx === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-200 hover:border-slate-300'
                    ]"
                  >
                    <img :src="imgUrl" :alt="word.englishWord" class="w-full h-full object-cover" />

                    <!-- Main Image ⭐ Badge -->
                    <span 
                      v-if="imgIdx === 0" 
                      class="absolute top-1 left-1 bg-amber-500 text-white px-1 py-0.5 rounded font-bold text-[9px] flex items-center gap-0.5 shadow-sm"
                    >
                      <Star class="w-2.5 h-2.5 fill-white" /> Principal
                    </span>

                    <!-- Make Main Button (if not already main) -->
                    <button 
                      v-else
                      @click="setAsMainImage(word, imgIdx)"
                      class="absolute top-1 left-1 p-1 rounded-md bg-white/90 text-amber-500 opacity-0 group-hover/img:opacity-100 transition hover:scale-110 shadow-sm cursor-pointer"
                      title="Hacer esta la imagen principal de estudio"
                    >
                      <Star class="w-3.5 h-3.5 fill-amber-400" />
                    </button>

                    <!-- Delete image from word -->
                    <button 
                      @click="removeImageFromWord(word, imgIdx)"
                      class="absolute bottom-1 right-1 p-1 rounded-md bg-white/90 text-rose-500 opacity-0 group-hover/img:opacity-100 transition hover:scale-110 shadow-sm cursor-pointer"
                      title="Quitar foto"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div v-else class="text-xs text-slate-400 italic">
                  Sin imágenes asignadas. Haz clic en "Editar / Fotos" para añadir imágenes.
                </div>
              </div>

            </div>
          </div>

          <!-- Empty Words State -->
          <div v-else class="text-center py-12">
            <span class="text-5xl block mb-3">📝</span>
            <h4 class="text-lg font-bold font-fredoka text-slate-800 mb-1">No hay palabras en este grupo</h4>
            <p class="text-xs text-slate-500 mb-4">Agrega palabras como "bedroom", "kitchen", etc., y asígnales sus imágenes.</p>
            <button 
              @click="openWordModal()" 
              class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-fredoka text-xs font-semibold shadow-sm cursor-pointer"
            >
              + Crear Primera Palabra
            </button>
          </div>

        </div>

        <!-- No category selected prompt -->
        <div v-else class="bg-white p-12 rounded-3xl text-center text-slate-500 border border-slate-200 shadow-sm">
          <span class="text-5xl block mb-3">👈</span>
          <h3 class="text-lg font-bold font-fredoka text-slate-800">Selecciona una categoría de la izquierda</h3>
          <p class="text-xs text-slate-500">Para administrar sus palabras e imágenes asociadas.</p>
        </div>

      </div>

    </div>

    <!-- MODAL 1: CREATE / EDIT CATEGORY -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl relative">
        <button @click="showCategoryModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 cursor-pointer">
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-xl font-bold font-fredoka text-slate-800 mb-4">
          {{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h3>

        <form @submit.prevent="handleSaveCategory" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre en Español (ej: Partes de la casa)</label>
            <input 
              v-model="categoryForm.name" 
              required 
              type="text"
              placeholder="Ej: Partes de la casa"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre en Inglés (ej: Parts of the House)</label>
            <input 
              v-model="categoryForm.englishName" 
              required 
              type="text"
              placeholder="Ej: Parts of the House"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Emoji / Icono Representativo</label>
            <input 
              v-model="categoryForm.icon" 
              type="text"
              placeholder="🏠, 🐶, 🍎..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-3">
            <button 
              type="button" 
              :disabled="isSavingCategory"
              @click="showCategoryModal = false" 
              class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="isSavingCategory"
              class="px-5 py-2 rounded-xl bg-sky-500 text-white font-fredoka text-xs font-semibold hover:bg-sky-600 shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 v-if="isSavingCategory" class="w-4 h-4 animate-spin" />
              <span>{{ isSavingCategory ? 'Guardando...' : 'Guardar Categoría' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: CREATE / EDIT WORD & MULTI-IMAGE UPLOAD -->
    <div v-if="showWordModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl relative my-8">
        <button 
          :disabled="isSavingWord"
          @click="showWordModal = false" 
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-xl font-bold font-fredoka text-slate-800 mb-1">
          {{ editingWord ? 'Editar Palabra e Imágenes' : 'Nueva Palabra' }}
        </h3>
        <p class="text-xs text-sky-600 mb-5 font-semibold">Categoría: {{ selectedCategory.name }}</p>

        <form @submit.prevent="handleSaveWord" class="space-y-4">
          
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Palabra en Inglés (ej: bedroom)</label>
            <div class="flex items-center gap-2">
              <input 
                v-model="wordForm.englishWord" 
                :disabled="isSavingWord"
                required 
                type="text"
                placeholder="Ej: bedroom"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
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
            <label class="block text-xs font-semibold text-slate-700 mb-1">Traducción en Español (ej: Dormitorio / Habitación)</label>
            <input 
              v-model="wordForm.spanishMeaning" 
              :disabled="isSavingWord"
              required 
              type="text"
              placeholder="Ej: Habitacion / Dormitorio"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
            />
          </div>

          <!-- MULTI-IMAGE UPLOAD AREA -->
          <div class="border-t border-slate-100 pt-4">
            <label class="block text-xs font-semibold text-slate-700 mb-2">
              📸 Imágenes (La 1ª foto es la principal de estudio):
            </label>

            <div 
              :class="[
                'border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-2xl p-4 text-center bg-slate-50/70 transition relative mb-3',
                isSavingWord ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
              ]"
            >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                :disabled="isSavingWord"
                @change="handleFileUpload" 
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <Upload class="w-7 h-7 mx-auto text-sky-500 mb-1.5" />
              <p class="text-xs font-semibold text-slate-700">
                Haz clic o arrastra fotos desde tu computador o celular
              </p>
              <p class="text-[10px] text-slate-400 mt-0.5">
                ⚡ Se optimizan y comprimen automáticamente para una subida ultra rápida.
              </p>
            </div>

            <div class="flex items-center gap-2 mb-3">
              <input 
                v-model="newImageUrl" 
                :disabled="isSavingWord"
                type="text"
                placeholder="O pega el enlace URL de una imagen..."
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
              />
              <button 
                type="button"
                :disabled="isSavingWord"
                @click="addImageUrl" 
                class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer flex-shrink-0 disabled:opacity-50"
              >
                + Añadir URL
              </button>
            </div>

            <div v-if="wordForm.images.length > 0" class="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              <div 
                v-for="(img, index) in wordForm.images" 
                :key="index"
                :class="[
                  'flex items-center justify-between gap-2 p-2 rounded-lg text-xs border transition bg-white',
                  index === 0 ? 'border-amber-400 shadow-xs' : 'border-slate-200'
                ]"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <img :src="img" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                  <span class="truncate text-slate-700 text-[11px] max-w-[180px]">
                    {{ index === 0 ? '⭐ Imagen Principal de Estudio' : `Foto ${index + 1}` }}
                  </span>
                </div>

                <div class="flex items-center gap-1">
                  <button 
                    v-if="index !== 0"
                    type="button"
                    :disabled="isSavingWord"
                    @click="makeFormImageMain(index)"
                    class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-amber-600 text-[10px] font-bold border border-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    ⭐ Principal
                  </button>

                  <button 
                    type="button" 
                    :disabled="isSavingWord"
                    @click="removeFormImage(index)" 
                    class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer disabled:opacity-50"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- Active Saving Progress Banner -->
          <div v-if="isSavingWord" class="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3 text-sky-800 text-xs font-semibold animate-pulse">
            <Loader2 class="w-5 h-5 animate-spin text-sky-600 flex-shrink-0" />
            <span>{{ savingWordProgress || 'Subiendo fotos y guardando en la nube...' }}</span>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              :disabled="isSavingWord"
              @click="showWordModal = false" 
              class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="isSavingWord"
              class="px-5 py-2 rounded-xl bg-sky-500 text-white font-fredoka text-xs font-semibold hover:bg-sky-600 shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 v-if="isSavingWord" class="w-4 h-4 animate-spin" />
              <span>{{ isSavingWord ? 'Guardando...' : 'Guardar Palabra' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Settings, Plus, Layout as FolderLayout, Edit2, Trash2, X, Upload, Star, Loader2 } from 'lucide-vue-next'
import { getCategories, saveCategory, deleteCategory, getWordsByCategory, saveWord, deleteWord, subscribeCategories } from '../services/db'
import { compressImage } from '../services/imageUtils'
import AudioButton from '../components/AudioButton.vue'

const categories = ref([])
const wordCounts = ref({})
const words = ref([])
const selectedCategory = ref(null)

const loadingCategories = ref(true)
const loadingWords = ref(false)
const syncMessage = ref('')
const syncSuccess = ref(true)

// Loading states for saves and uploads
const isSavingWord = ref(false)
const savingWordProgress = ref('')
const isSavingCategory = ref(false)

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
  isSavingCategory.value = true
  try {
    await saveCategory(categoryForm.value)
    showCategoryModal.value = false
    await loadCategories()
    syncSuccess.value = true
    syncMessage.value = `Categoría "${categoryForm.value.name}" guardada en la nube de Firebase.`
  } catch (err) {
    console.error('Error saving category:', err)
    syncSuccess.value = false
    syncMessage.value = `Error al guardar en Firebase: ${err.message}`
  } finally {
    isSavingCategory.value = false
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
      images: Array.isArray(word.images) ? [...word.images] : [],
      deleteUrls: word.deleteUrls ? { ...word.deleteUrls } : {}
    }
  } else {
    wordForm.value = {
      id: `w_${Date.now()}`,
      categoryId: selectedCategory.value.id,
      englishWord: '',
      spanishMeaning: '',
      images: [],
      deleteUrls: {}
    }
  }
  showWordModal.value = true
}

const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  for (const file of Array.from(files)) {
    // Automatically compress image to ~1000px and light size before adding
    const compressed = await compressImage(file)
    wordForm.value.images.push(compressed)
  }
  event.target.value = ''
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
  const imgUrl = wordForm.value.images[idx]
  const deleteUrl = wordForm.value.deleteUrls?.[imgUrl]

  if (deleteUrl) {
    const shouldOpen = confirm(
      '¿Deseas abrir la página de ImgBB en una pestaña para confirmar la eliminación definitiva de esta imagen del servidor?'
    )
    if (shouldOpen) {
      window.open(deleteUrl, '_blank')
    }
    delete wordForm.value.deleteUrls[imgUrl]
  }

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
  isSavingWord.value = true
  savingWordProgress.value = 'Iniciando subida... 🚀'
  try {
    wordForm.value.categoryId = selectedCategory.value.id
    await saveWord(wordForm.value, (msg) => {
      savingWordProgress.value = msg
    })
    showWordModal.value = false
    await selectCategory(selectedCategory.value)
    await loadCategories()
    syncSuccess.value = true
    syncMessage.value = `Palabra "${wordForm.value.englishWord}" guardada con éxito en Firebase.`
  } catch (err) {
    console.error('Error saving word:', err)
    syncSuccess.value = false
    syncMessage.value = `Error al guardar en Firebase: ${err.message}`
  } finally {
    isSavingWord.value = false
    savingWordProgress.value = ''
  }
}

const removeImageFromWord = async (word, imgIdx) => {
  const imgUrl = word.images[imgIdx]
  const deleteUrl = word.deleteUrls?.[imgUrl]

  if (deleteUrl) {
    const shouldOpen = confirm(
      '¿Deseas abrir la página de ImgBB en una pestaña para confirmar la eliminación definitiva de esta foto del servidor?'
    )
    if (shouldOpen) {
      window.open(deleteUrl, '_blank')
    }
  }

  const updatedImages = [...word.images]
  updatedImages.splice(imgIdx, 1)

  const updatedDeleteUrls = { ...(word.deleteUrls || {}) }
  if (imgUrl && updatedDeleteUrls[imgUrl]) {
    delete updatedDeleteUrls[imgUrl]
  }

  const updatedWord = { 
    ...word, 
    images: updatedImages,
    deleteUrls: updatedDeleteUrls 
  }
  await saveWord(updatedWord)
  await selectCategory(selectedCategory.value)
}

const confirmDeleteWord = async (word) => {
  if (confirm(`¿Eliminar la palabra "${word.englishWord}"?`)) {
    const deleteUrls = Object.values(word.deleteUrls || {})
    if (deleteUrls.length > 0) {
      const shouldOpen = confirm(
        `Esta palabra tiene ${deleteUrls.length} foto(s) en ImgBB. ¿Deseas abrir los enlaces para eliminarlas también de ImgBB?`
      )
      if (shouldOpen) {
        deleteUrls.forEach(url => window.open(url, '_blank'))
      }
    }

    await deleteWord(word.id)
    await selectCategory(selectedCategory.value)
    await loadCategories()
  }
}

let unsubscribe = null

onMounted(() => {
  loadCategories()

  unsubscribe = subscribeCategories(async (list) => {
    if (list && list.length > 0) {
      categories.value = list
      if (!selectedCategory.value) {
        selectCategory(list[0])
      }
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
