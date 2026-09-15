// Database service with Stale-While-Revalidate strategy for Instant ⚡ Performance.

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

// --- CATEGORIES API (INSTANT CACHE + BACKGROUND FIREBASE SYNC) ---

export const getCategories = async () => {
  // 1. Return local IndexedDB cache instantly (< 5ms)
  const localList = await getLocalCategories()

  // 2. Trigger background sync with Firebase Cloud (Mirroring: put updated/new & prune deleted)
  fetchFirebaseCategories().then(async (fbList) => {
    if (fbList) {
      const fbIds = new Set(fbList.map(c => c.id))
      const currentLocal = await getLocalCategories()
      
      // Delete local categories that no longer exist in Firebase
      for (const locCat of currentLocal) {
        if (!fbIds.has(locCat.id)) {
          await runTransaction('categories', 'readwrite', (store) => store.delete(locCat.id))
        }
      }

      // Upsert current Firebase categories to local cache
      for (const cat of fbList) {
        await runTransaction('categories', 'readwrite', (store) => store.put(cat))
      }
    }
  }).catch(err => console.warn('Background Firebase sync:', err))

  // If local list is empty, wait for Firebase
  if (localList.length === 0) {
    try {
      const fbCategories = await fetchFirebaseCategories()
      if (fbCategories && fbCategories.length > 0) {
        for (const cat of fbCategories) {
          await runTransaction('categories', 'readwrite', (store) => store.put(cat))
        }
        return fbCategories
      }
    } catch (e) {
      console.warn('Firebase offline:', e)
    }
  }

  return localList
}

export const getCategoryById = async (id) => {
  const categories = await getCategories()
  return categories.find(c => c.id === id) || null
}

export const saveCategory = async (category) => {
  const data = {
    ...category,
    order: category.order || Date.now(),
    updatedAt: new Date().toISOString()
  }
  
  // 1. Instant local write
  await runTransaction('categories', 'readwrite', (store) => store.put(data))

  // 2. Cloud save
  await saveFirebaseCategory(data).catch(err => console.error('Firebase save error:', err))

  return data
}

export const deleteCategory = async (id) => {
  // 1. Delete associated local words
  const words = await getLocalWordsByCategory(id)
  for (const w of words) {
    await runTransaction('words', 'readwrite', (store) => store.delete(w.id))
  }

  // 2. Delete local category
  await runTransaction('categories', 'readwrite', (store) => store.delete(id))

  // 3. Delete from Firebase Firestore (both category and all its words)
  await deleteFirebaseCategory(id)
}

// --- WORDS API (INSTANT CACHE + BACKGROUND FIREBASE SYNC) ---

export const getWordsByCategory = async (categoryId) => {
  // 1. Return local cache instantly (< 5ms)
  const localWords = await getLocalWordsByCategory(categoryId)

  // 2. Background sync (Mirroring: put updated/new & prune deleted)
  fetchFirebaseWordsByCategory(categoryId).then(async (fbWords) => {
    if (fbWords) {
      const fbIds = new Set(fbWords.map(w => w.id))
      const currentLocal = await getLocalWordsByCategory(categoryId)

      // Delete local words that no longer exist in Firebase
      for (const locWord of currentLocal) {
        if (!fbIds.has(locWord.id)) {
          await runTransaction('words', 'readwrite', (store) => store.delete(locWord.id))
        }
      }

      // Upsert current Firebase words
      for (const w of fbWords) {
        await runTransaction('words', 'readwrite', (store) => store.put(w))
      }
    }
  }).catch(err => console.warn('Background Firebase words sync:', err))

  if (localWords.length === 0) {
    try {
      const fbWords = await fetchFirebaseWordsByCategory(categoryId)
      if (fbWords && fbWords.length > 0) {
        for (const w of fbWords) {
          await runTransaction('words', 'readwrite', (store) => store.put(w))
        }
        return fbWords
      }
    } catch (e) {
      console.warn('Firebase offline:', e)
    }
  }

  return localWords
}

export const getAllWords = async () => {
  return runTransaction('words', 'readonly', (store) => store.getAll())
}

export const saveWord = async (word) => {
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

  // 1. Instant local write
  await runTransaction('words', 'readwrite', (store) => store.put(data))

  // 2. Non-blocking background cloud save
  saveFirebaseWord(data).catch(err => console.error('Firebase save word error:', err))

  return data
}

export const deleteWord = async (id) => {
  await runTransaction('words', 'readwrite', (store) => store.delete(id))
  await deleteFirebaseWord(id)
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
