// Database service with Cloud-First Firebase Firestore synchronization & local IndexedDB offline fallback.

import { 
  fetchFirebaseCategories, 
  subscribeFirebaseCategories,
  saveFirebaseCategory, 
  deleteFirebaseCategory,
  fetchFirebaseWordsByCategory,
  saveFirebaseWord,
  deleteFirebaseWord,
  uploadImageToImgbb
} from './firebase'
import { compressImage } from './imageUtils'

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
    let request
    try {
      request = callback(store)
    } catch (err) {
      return reject(err)
    }

    tx.oncomplete = () => resolve(request ? request.result : undefined)
    tx.onerror = () => reject(tx.error)
  })
}

// Helper to get local data instantly
const getLocalCategories = async () => {
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

const getLocalWordsByCategory = async (categoryId) => {
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

// --- CATEGORIES API (CLOUD FIRST + OFFLINE FALLBACK) ---

export const getCategories = async () => {
  try {
    // 1. Fetch fresh list from Firebase Firestore Cloud
    const fbCategories = await fetchFirebaseCategories()
    if (fbCategories && fbCategories.length > 0) {
      // Sync local cache: clear old cache and save all current cloud categories
      try {
        await runTransaction('categories', 'readwrite', (store) => {
          store.clear()
          for (const cat of fbCategories) {
            store.put(cat)
          }
        })
      } catch (cacheErr) {
        console.warn('Could not update local cache:', cacheErr)
      }
      return fbCategories
    }
  } catch (e) {
    console.warn('Firebase fetch categories failed, using local cache:', e)
  }

  // 2. Offline fallback to local IndexedDB
  return await getLocalCategories()
}

export const subscribeCategories = (callback) => {
  return subscribeFirebaseCategories(async (cloudList) => {
    if (cloudList && cloudList.length > 0) {
      try {
        await runTransaction('categories', 'readwrite', (store) => {
          store.clear()
          for (const cat of cloudList) {
            store.put(cat)
          }
        })
      } catch (e) {
        console.warn('Error updating local cache on category snapshot:', e)
      }
    }
    callback(cloudList)
  })
}

export const getCategoryById = async (id) => {
  const categories = await getCategories()
  return categories.find(c => c.id === id) || null
}

export const saveCategory = async (category) => {
  const data = {
    ...category,
    order: category.order !== undefined ? category.order : Date.now(),
    updatedAt: new Date().toISOString()
  }
  
  // 1. Save to Cloud Firestore
  await saveFirebaseCategory(data)

  // 2. Save to local IndexedDB
  await runTransaction('categories', 'readwrite', (store) => store.put(data))

  return data
}

export const deleteCategory = async (id) => {
  const words = await getWordsByCategory(id)
  for (const w of words) {
    await deleteWord(w.id)
  }

  await deleteFirebaseCategory(id)
  await runTransaction('categories', 'readwrite', (store) => store.delete(id))
}

// --- WORDS API (CLOUD FIRST + OFFLINE FALLBACK) ---

export const getWordsByCategory = async (categoryId) => {
  try {
    const fbWords = await fetchFirebaseWordsByCategory(categoryId)
    if (fbWords && fbWords.length > 0) {
      for (const w of fbWords) {
        await runTransaction('words', 'readwrite', (store) => store.put(w))
      }
      return fbWords
    }
  } catch (err) {
    console.warn('Firebase words sync warning, falling back to local cache:', err)
  }

  return await getLocalWordsByCategory(categoryId)
}

export const getAllWords = async () => {
  return runTransaction('words', 'readonly', (store) => store.getAll())
}

export const saveWord = async (word, onProgress) => {
  const processedImages = []
  if (word.images && Array.isArray(word.images)) {
    const rawImagesToUpload = word.images.filter(img => typeof img === 'string' && img.startsWith('data:image'))
    const totalToUpload = rawImagesToUpload.length
    let uploadIndex = 0

    for (const img of word.images) {
      if (typeof img === 'string' && img.startsWith('data:image')) {
        uploadIndex++
        if (onProgress) {
          onProgress(`Subiendo imagen ${uploadIndex} de ${totalToUpload} a la nube... ☁️`)
        }
        // Ensure image is compressed before upload for maximum speed
        const optimizedImg = await compressImage(img)
        const cloudUrl = await uploadImageToImgbb(optimizedImg)
        processedImages.push(cloudUrl)
      } else {
        processedImages.push(img)
      }
    }
  }

  if (onProgress) {
    onProgress('Guardando en Firebase... 💾')
  }

  const data = {
    ...word,
    images: processedImages,
    updatedAt: new Date().toISOString()
  }

  // 1. Save to Firebase Cloud
  await saveFirebaseWord(data)

  // 2. Save locally
  await runTransaction('words', 'readwrite', (store) => store.put(data))

  return data
}

export const deleteWord = async (id) => {
  await deleteFirebaseWord(id)
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
