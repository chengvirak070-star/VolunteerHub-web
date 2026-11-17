/**
 * Makes a photo small enough to upload: scales it down to at most `maxSize` px on the
 * longest side and saves it as JPEG. Big phone photos (5–10 MB) become ~100–300 KB.
 *
 * Throws an Error with a friendly message if the browser can't read the file
 * (for example .heic photos from iPhones on Windows).
 */
export async function shrinkImage(file, maxSize = 1080, quality = 0.85) {
  if (!file.type.startsWith('image/')) {
    throw new Error('This file is not a photo. Please choose a JPG, PNG or WebP image.')
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error(
      'This photo format can’t be opened (for example HEIC from an iPhone). Please choose a JPG or PNG photo.',
    )
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  // Small JPG/PNG/WebP files can be uploaded as they are.
  if (scale === 1 && file.size < 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    bitmap.close?.()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // transparent PNG areas become white instead of black
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('Could not prepare this photo. Please try another one.')
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}
