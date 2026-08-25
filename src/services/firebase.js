import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)

// --- IMGBB UPLOADER (Free Cloud Image Hosting) ---
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || ''

/**
 * Uploads a base64 image or File to imgbb cloud storage
 * @param {File|string} imageInput - File object or base64 string
 * @returns {Promise<string>} Direct image URL
 */
export const uploadImageToImgbb = async (imageInput) => {
  if (!IMGBB_API_KEY) {
    console.warn('Falta VITE_IMGBB_API_KEY. Usando fallback local.')
    return imageInput
  }

  try {
    let base64Data = ''
    if (typeof imageInput === 'string' && imageInput.startsWith('data:image')) {
      base64Data = imageInput.split(',')[1]
    } else if (imageInput instanceof File) {
      base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(imageInput)
      })
    } else {
      return imageInput // Return as is if already a web URL
    }

    const formData = new FormData()
    formData.append('key', IMGBB_API_KEY)
    formData.append('image', base64Data)

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    if (result.success && result.data && result.data.url) {
      return result.data.url
    }
    return imageInput
  } catch (err) {
    console.error('Error uploading to imgbb:', err)
    return imageInput
  }
}

// --- FIRESTORE CATEGORIES SERVICES ---

export const fetchFirebaseCategories = async () => {
  try {
    const colRef = collection(db, 'categories')
    const q = query(colRef, orderBy('order', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Error fetching Firebase categories:', err)
    return []
  }
}

export const saveFirebaseCategory = async (category) => {
  try {
    const docRef = doc(db, 'categories', category.id)
    await setDoc(docRef, {
      ...category,
      updatedAt: new Date().toISOString()
    }, { merge: true })
  } catch (err) {
    console.error('Error saving Firebase category:', err)
  }
}

export const deleteFirebaseCategory = async (id) => {
  try {
    await deleteDoc(doc(db, 'categories', id))
  } catch (err) {
    console.error('Error deleting Firebase category:', err)
  }
}

// --- FIRESTORE WORDS SERVICES ---

export const fetchFirebaseWordsByCategory = async (categoryId) => {
  try {
    const colRef = collection(db, 'words')
    const q = query(colRef, where('categoryId', '==', categoryId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Error fetching Firebase words:', err)
    return []
  }
}

export const saveFirebaseWord = async (word) => {
  try {
    const docRef = doc(db, 'words', word.id)
    await setDoc(docRef, {
      ...word,
      updatedAt: new Date().toISOString()
    }, { merge: true })
  } catch (err) {
    console.error('Error saving Firebase word:', err)
  }
}

export const deleteFirebaseWord = async (id) => {
  try {
    await deleteDoc(doc(db, 'words', id))
  } catch (err) {
    console.error('Error deleting Firebase word:', err)
  }
}
