// Database service combining Firebase Firestore (Primary Cloud) + IndexedDB (Local Cache).

import { 
  fetchFirebaseCategories, 
  saveFirebaseCategory, 
  deleteFirebaseCategory,
  fetchFirebaseWordsByCategory,
  saveFirebaseWord,
  deleteFirebaseWord,
  uploadImageToImgbb
} from './firebase'

const DB_NAME = 'InglesAmaliaDB'
const DB_VERSION = 1
let dbInstance = null

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance)

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      if (!db.objectStoreNames.contains('categories')) {
        const catStore = db.createObjectStore('categories', { keyPath: 'id' })
        catStore.createIndex('order', 'order', { unique: false })
      }

      if (!db.objectStoreNames.contains('words')) {
        const wordStore = db.createObjectStore('words', { keyPath: 'id' })
        wordStore.createIndex('categoryId', 'categoryId', { unique: false })
      }

      if (!db.objectStoreNames.contains('quizzes')) {
        const quizStore = db.createObjectStore('quizzes', { keyPath: 'id', autoIncrement: true })
        quizStore.createIndex('date', 'date', { unique: false })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = event.target.result
      resolve(dbInstance)
    }

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error)
      reject(event.target.error)
    }
  })
}

const runTransaction = async (storeName, mode, callback) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const request = callback(store)

    tx.oncomplete = () => resolve(request.result)
    tx.onerror = () => reject(tx.error)
  })
}

// --- CATEGORIES API (FIREBASE PRIMARY + LOCAL FALLBACK) ---

export const getCategories = async () => {
  try {
    const fbCategories = await fetchFirebaseCategories()
    if (fbCategories && fbCategories.length > 0) {
      // Cache in local IndexedDB
      for (const cat of fbCategories) {
        await runTransaction('categories', 'readwrite', (store) => store.put(cat))
      }
      return fbCategories
    }
  } catch (e) {
    console.warn('Unable to load from Firebase Firestore, falling back to local storage:', e)
  }

  // Local fallback
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('categories', 'readonly')
    const store = tx.objectStore('categories')
    const req = store.getAll()
    req.onsuccess = () => {
      const results = req.result || []
      results.sort((a, b) => (a.order || 0) - (b.order || 0))
      resolve(results)
    }
    req.onerror = () => reject(req.error)
  })
}

export const getCategoryById = async (id) => {
  const categories = await getCategories()
  return categories.find(c => c.id === id) || null
}

export const saveCategory = async (category) => {
  const data = {
    ...category,
    updatedAt: new Date().toISOString()
  }
  
  // 1. Save directly to Firebase Firestore
  try {
    await saveFirebaseCategory(data)
  } catch (err) {
    console.error('Error saving category to Firebase:', err)
  }

  // 2. Save local cache
  await runTransaction('categories', 'readwrite', (store) => store.put(data))
  return data
}

export const deleteCategory = async (id) => {
  const words = await getWordsByCategory(id)
  for (const w of words) {
    await deleteWord(w.id)
  }

  try {
    await deleteFirebaseCategory(id)
  } catch (err) {
    console.error('Error deleting category from Firebase:', err)
  }

  await runTransaction('categories', 'readwrite', (store) => store.delete(id))
}

// --- WORDS API (FIREBASE PRIMARY + IMGBB UPLOAD + LOCAL FALLBACK) ---

export const getWordsByCategory = async (categoryId) => {
  try {
    const fbWords = await fetchFirebaseWordsByCategory(categoryId)
    if (fbWords && fbWords.length > 0) {
      for (const w of fbWords) {
        await runTransaction('words', 'readwrite', (store) => store.put(w))
      }
      return fbWords
    }
  } catch (e) {
    console.warn('Unable to load words from Firebase Firestore, using local fallback:', e)
  }

  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readonly')
    const store = tx.objectStore('words')
    const index = store.index('categoryId')
    const req = index.getAll(categoryId)
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export const getAllWords = async () => {
  return runTransaction('words', 'readonly', (store) => store.getAll())
}

export const saveWord = async (word) => {
  // If images contain base64 string uploads, upload them to imgbb cloud!
  const processedImages = []
  if (word.images && Array.isArray(word.images)) {
    for (const img of word.images) {
      if (typeof img === 'string' && img.startsWith('data:image')) {
        const cloudUrl = await uploadImageToImgbb(img)
        processedImages.push(cloudUrl)
      } else {
        processedImages.push(img)
      }
    }
  }

  const data = {
    ...word,
    images: processedImages,
    updatedAt: new Date().toISOString()
  }

  // 1. Save directly to Firebase Firestore Cloud
  try {
    await saveFirebaseWord(data)
  } catch (err) {
    console.error('Error saving word to Firebase Firestore:', err)
  }

  // 2. Save local IndexedDB cache
  await runTransaction('words', 'readwrite', (store) => store.put(data))

  return data
}

export const deleteWord = async (id) => {
  try {
    await deleteFirebaseWord(id)
  } catch (err) {
    console.error('Error deleting word from Firebase:', err)
  }
  await runTransaction('words', 'readwrite', (store) => store.delete(id))
}

// --- QUIZ RESULTS HISTORY ---

export const saveQuizResult = async (quizData) => {
  const data = {
    ...quizData,
    date: new Date().toISOString()
  }
  return runTransaction('quizzes', 'readwrite', (store) => store.add(data))
}

export const getQuizHistory = async () => {
  return runTransaction('quizzes', 'readonly', (store) => store.getAll())
}
