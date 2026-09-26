import { getSupabaseAdmin } from './supabaseAdmin'

export interface GalleryPhoto {
  id: string
  title: string
  imageUrl: string
  active: boolean
  sortOrder: number
}

interface GalleryPhotoRow {
  id: string
  title: string | null
  image_url: string
  active: boolean
  sort_order: number
}

function isMissingGalleryTableError(error: { code?: string; message?: string }) {
  return error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('gallery_photos')
}

function rowToPhoto(row: GalleryPhotoRow): GalleryPhoto {
  return {
    id: row.id,
    title: row.title || '',
    imageUrl: row.image_url,
    active: row.active,
    sortOrder: row.sort_order,
  }
}

function photoToRow(photo: GalleryPhoto, index: number) {
  return {
    id: photo.id,
    title: photo.title.trim() || null,
    image_url: photo.imageUrl,
    active: photo.active,
    sort_order: index,
  }
}

export async function getGalleryPhotosFromDb(includeInactive = false) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  let query = supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (!includeInactive) query = query.eq('active', true)

  const { data, error } = await query
  if (error) {
    if (isMissingGalleryTableError(error)) return []
    throw error
  }

  return (data || []).map((row) => rowToPhoto(row as GalleryPhotoRow))
}

export async function saveGalleryPhotosToDb(photos: GalleryPhoto[]) {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase is not configured.')

  const rows = photos.map(photoToRow)
  const ids = rows.map((row) => row.id)

  if (ids.length) {
    const { error: deleteError } = await supabase
      .from('gallery_photos')
      .delete()
      .not('id', 'in', `(${ids.map((id) => `"${id}"`).join(',')})`)

    if (deleteError) {
      if (isMissingGalleryTableError(deleteError)) return false
      throw deleteError
    }
  }

  if (!rows.length) {
    const { error } = await supabase.from('gallery_photos').delete().neq('id', '')
    if (error) {
      if (isMissingGalleryTableError(error)) return false
      throw error
    }
    return true
  }

  const { error } = await supabase.from('gallery_photos').upsert(rows, { onConflict: 'id' })
  if (error) {
    if (isMissingGalleryTableError(error)) return false
    throw error
  }

  return true
}
