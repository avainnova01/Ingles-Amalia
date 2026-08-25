import { getCategories, saveCategory, saveWord } from './db'

export const seedInitialDataIfEmpty = async () => {
  const existing = await getCategories()
  if (existing && existing.length > 0) {
    return // Already seeded or has user data
  }

  console.log('Seeding initial categories and words for Amalia...')

  // Category 1: Partes de la casa
  const catHouse = {
    id: 'cat_house_parts',
    name: 'Partes de la casa',
    englishName: 'Parts of the House',
    icon: '🏠',
    color: 'from-amber-400 to-orange-500',
    order: 1
  }

  // Category 2: Animales
  const catAnimals = {
    id: 'cat_animals',
    name: 'Animales',
    englishName: 'Animals',
    icon: '🐶',
    color: 'from-emerald-400 to-teal-500',
    order: 2
  }

  // Category 3: Frutas y Alimentos
  const catFruits = {
    id: 'cat_fruits',
    name: 'Frutas y Comida',
    englishName: 'Fruits & Food',
    icon: '🍎',
    color: 'from-pink-400 to-rose-500',
    order: 3
  }

  await saveCategory(catHouse)
  await saveCategory(catAnimals)
  await saveCategory(catFruits)

  // --- WORDS FOR "PARTES DE LA CASA" (with MULTIPLE images per word as requested) ---
  const houseWords = [
    {
      id: 'w_bedroom',
      categoryId: catHouse.id,
      englishWord: 'bedroom',
      spanishMeaning: 'Habitación / Dormitorio',
      // Multiple images so Amalia learns the concept!
      images: [
        'https://images.unsplash.com/photo-1540518614846-7ede433c517a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_livingroom',
      categoryId: catHouse.id,
      englishWord: 'living room',
      spanishMeaning: 'Sala de estar',
      images: [
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_kitchen',
      categoryId: catHouse.id,
      englishWord: 'kitchen',
      spanishMeaning: 'Cocina',
      images: [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_diningroom',
      categoryId: catHouse.id,
      englishWord: 'dining room',
      spanishMeaning: 'Comedor',
      images: [
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_bathroom',
      categoryId: catHouse.id,
      englishWord: 'bathroom',
      spanishMeaning: 'Baño',
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80'
      ]
    }
  ]

  // --- WORDS FOR "ANIMALES" ---
  const animalWords = [
    {
      id: 'w_dog',
      categoryId: catAnimals.id,
      englishWord: 'dog',
      spanishMeaning: 'Perro',
      images: [
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_cat',
      categoryId: catAnimals.id,
      englishWord: 'cat',
      spanishMeaning: 'Gato',
      images: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_rabbit',
      categoryId: catAnimals.id,
      englishWord: 'rabbit',
      spanishMeaning: 'Conejo',
      images: [
        'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_lion',
      categoryId: catAnimals.id,
      englishWord: 'lion',
      spanishMeaning: 'León',
      images: [
        'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=600&q=80'
      ]
    }
  ]

  // --- WORDS FOR "FRUTAS Y COMIDA" ---
  const fruitWords = [
    {
      id: 'w_apple',
      categoryId: catFruits.id,
      englishWord: 'apple',
      spanishMeaning: 'Manzana',
      images: [
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_banana',
      categoryId: catFruits.id,
      englishWord: 'banana',
      spanishMeaning: 'Banano',
      images: [
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'w_orange',
      categoryId: catFruits.id,
      englishWord: 'orange',
      spanishMeaning: 'Naranja',
      images: [
        'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80'
      ]
    }
  ]

  for (const w of [...houseWords, ...animalWords, ...fruitWords]) {
    await saveWord(w)
  }

  console.log('Seeding completed successfully!')
}
