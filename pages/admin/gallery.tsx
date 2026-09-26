import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { ChangeEvent, useEffect, useState } from 'react'
import { requireAdminPage } from '../../lib/adminAuth'
import { GalleryPhoto } from '../../lib/gallery'

const maxUploadBytes = 8 * 1024 * 1024
const maxOptimizedImageBytes = 6 * 1024 * 1024
const maxUploadDimension = 1800
const allowedUploadTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read image file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to prepare image for upload.'))
    image.src = dataUrl
  })
}

function canvasToDataUrl(canvas: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to optimize image for upload.'))
          return
        }

        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Unable to read optimized image.'))
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.86
    )
  })
}

async function prepareImageUpload(file: File) {
  const originalDataUrl = await readFileAsDataUrl(file)
  if (file.type === 'image/gif') return originalDataUrl

  const image = await loadImage(originalDataUrl)
  const scale = Math.min(1, maxUploadDimension / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return originalDataUrl

  context.drawImage(image, 0, 0, width, height)
  return canvasToDataUrl(canvas)
}

function createGalleryPhoto(imageUrl: string, sortOrder: number): GalleryPhoto {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `gallery-${Date.now()}-${sortOrder}`,
    title: '',
    imageUrl,
    active: true,
    sortOrder,
  }
}

export default function AdminGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [statusMessage, setStatusMessage] = useState('Loading gallery...')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadGallery() {
      try {
        const response = await fetch('/api/admin/gallery')
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Unable to load gallery.')
        if (ignore) return

        setPhotos(result.photos || [])
        setStatusMessage('Loaded gallery.')
      } catch (error) {
        if (ignore) return
        setStatusMessage(error instanceof Error ? error.message : 'Unable to load gallery.')
      }
    }

    loadGallery()
    return () => {
      ignore = true
    }
  }, [])

  function updatePhoto(id: string, patch: Partial<GalleryPhoto>) {
    setPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo))
    )
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id).map((photo, index) => ({ ...photo, sortOrder: index })))
    setStatusMessage('Photo removed. Save when ready.')
  }

  async function saveGallery() {
    setIsSaving(true)
    setStatusMessage('Saving gallery...')

    try {
      const normalizedPhotos = photos.map((photo, index) => ({ ...photo, sortOrder: index }))
      const response = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: normalizedPhotos }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to save gallery.')

      setPhotos(normalizedPhotos)
      setStatusMessage(result.saved === false ? 'Gallery table is not ready. Run supabase/gallery.sql first.' : 'Gallery saved.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to save gallery.')
    } finally {
      setIsSaving(false)
    }
  }

  async function uploadGalleryPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 10)
    if (!selectedFiles.length) return

    const invalidFile = selectedFiles.find((file) => !allowedUploadTypes.has(file.type))
    if (invalidFile) {
      setStatusMessage('Please upload JPG, PNG, WebP, or GIF images. HEIC photos need to be converted first.')
      event.target.value = ''
      return
    }

    const tooLargeFile = selectedFiles.find((file) => file.size > maxUploadBytes)
    if (tooLargeFile) {
      setStatusMessage('Each image must be 8 MB or smaller. Try smaller or compressed photos.')
      event.target.value = ''
      return
    }

    setIsUploading(true)
    setStatusMessage(`Uploading ${selectedFiles.length} photo${selectedFiles.length === 1 ? '' : 's'}...`)

    try {
      const uploadedPhotos: GalleryPhoto[] = []
      for (const file of selectedFiles) {
        const dataUrl = await prepareImageUpload(file)
        if (dataUrl.length > maxOptimizedImageBytes * 1.4) {
          throw new Error(`${file.name} is still too large after optimization. Try cropping or compressing it.`)
        }

        const response = await fetch('/api/admin/upload-gallery-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Unable to upload image.')

        uploadedPhotos.push(createGalleryPhoto(result.publicUrl, photos.length + uploadedPhotos.length))
      }

      setPhotos((current) => [...current, ...uploadedPhotos].map((photo, index) => ({ ...photo, sortOrder: index })))
      setStatusMessage(`Uploaded ${uploadedPhotos.length} photo${uploadedPhotos.length === 1 ? '' : 's'}. Add titles and save when ready.`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to upload photos.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <>
      <Head>
        <title>Gallery Admin - Bow-Bow-Ties</title>
      </Head>

      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <img src="/bow_bow_ties.png" alt="Bow-Bow-Ties Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Gallery Admin</h1>
                <p className="text-sm text-gray-600">Upload photos and manage customer-facing gallery titles</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-3">
              <Link href="/admin" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Admin
              </Link>
              <Link href="/gallery" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                View Gallery
              </Link>
              <a href="/api/admin/logout" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Logout
              </a>
              <label className="btn-primary cursor-pointer">
                {isUploading ? 'Uploading...' : 'Upload Photos'}
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={uploadGalleryPhotos}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
              <button type="button" onClick={saveGallery} disabled={isSaving || isUploading} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </nav>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {statusMessage && (
            <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-900">
              {statusMessage}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo, index) => (
              <article key={photo.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                  <img src={photo.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Title</span>
                    <input
                      value={photo.title}
                      onChange={(event) => updatePhoto(photo.id, { title: event.target.value })}
                      placeholder="Optional title"
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={photo.active}
                      onChange={(event) => updatePhoto(photo.id, { active: event.target.checked })}
                    />
                    <span className="text-sm font-semibold text-gray-700">Show on gallery</span>
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Photo {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!photos.length ? (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <h2 className="text-xl font-bold text-gray-950">No gallery photos yet</h2>
              <p className="mt-3 text-gray-600">Upload up to 10 photos at a time, add optional titles, then save.</p>
            </div>
          ) : null}
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminPage(context)
