/**
 * Utility to compress images in the browser before cloud upload.
 * Reduces 5MB-10MB camera photos to ~150KB with crisp visual quality,
 * dramatically speeding up cloud uploads and saving bandwidth.
 */
export const compressImage = (imageSource, maxWidth = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxWidth) / height)
          height = maxWidth
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Export as optimized JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedDataUrl)
    }

    img.onerror = () => {
      // If error occurs, fallback to original source
      resolve(imageSource)
    }

    if (imageSource instanceof File) {
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      reader.onerror = () => resolve(imageSource)
      reader.readAsDataURL(imageSource)
    } else {
      img.src = imageSource
    }
  })
}
