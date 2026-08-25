// Database service using IndexedDB (Local) + Firebase Firestore & ImgBB Cloud Sync.

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

      // Store: Categories
      if (!db.objectStoreNames.contains('categories')) {
        const catStore = db.createObjectStore('categories', { keyPath: 'id' })
        catStore.createIndex('order', 'order', { unique: false })
      }

      // Store: Words (linked to categoryId)
      if (!db.objectStoreNames.contains('words')) {
        const wordStore = db.createObjectStore('words', { keyPath: 'id' })
        wordStore.createIndex('categoryId', 'categoryId', { unique: false })
      }

      // Store: Quiz History
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

// Generic helper for transaction execution
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

// --- CATEGORIES API (LOCAL + FIREBASE SYNC) ---

export const getCategories = async () => {
  try {
    // Attempt Firebase sync first
    const fbCategories = await fetchFirebaseCategories()
    if (fbCategories && fbCategories.length > 0) {
      // Update local storage cache
      for (const cat of fbCategories) {
        await runTransaction('categories', 'readwrite', (store) => store.put(cat))
      }
      return fbCategories
    }
  } catch (e) {
    console.warn('Firebase offline, loading from local cache:', e)
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
  const localCat = await runTransaction('categories', 'readonly', (store) => store.get(id))
  if (localCat) return localCat
  const categories = await getCategories()
  return categories.find(c => c.id === id) || null
}

export const saveCategory = async (category) => {
  const data = {
    ...category,
    updatedAt: new Date().toISOString()
  }
  
  // 1. Save local
  await runTransaction('categories', 'readwrite', (store) => store.put(data))

  // 2. Sync to Firebase
  saveFirebaseCategory(data).catch(err => console.error('Firebase sync error:', err))

  return data
}

export const deleteCategory = async (id) => {
  // Delete words
  const words = await getWordsByCategory(id)
  for (const w of words) {
    await deleteWord(w.id)
  }

  // 1. Delete local
  await runTransaction('categories', 'readwrite', (store) => store.delete(id))

  // 2. Delete Firebase
  deleteFirebaseCategory(id).catch(err => console.error('Firebase delete error:', err))
}

// --- WORDS API (LOCAL + FIREBASE + IMGBB CLOUD UPLOAD) ---

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
    console.warn('Firebase offline, using local words:', e)
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

  // 1. Save local IndexedDB
  await runTransaction('words', 'readwrite', (store) => store.put(data))

  // 2. Sync to Firebase Firestore
  saveFirebaseWord(data).catch(err => console.error('Firebase save word error:', err))

  return data
}

export const deleteWord = async (id) => {
  await runTransaction('words', 'readwrite', (store) => store.delete(id))
  deleteFirebaseWord(id).catch(err => console.error('Firebase delete word error:', err))
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
