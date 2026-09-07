import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminAuthenticated } from '../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

const bucketName = 'product-images'

function getExtension(contentType: string) {
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  if (contentType === 'image/gif') return 'gif'
  return 'jpg'
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) throw new Error('Expected a base64 image data URL.')

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ message: 'Method not allowed.' })
    return
  }

  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ message: 'Admin login required.' })
    return
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    res.status(500).json({ message: 'Supabase is not configured.' })
    return
  }

  try {
    const productId = String(req.body?.productId || 'product')
    const dataUrl = String(req.body?.dataUrl || '')
    const { contentType, buffer } = parseDataUrl(dataUrl)

    if (buffer.byteLength > 4 * 1024 * 1024) {
      res.status(400).json({ message: 'Image must be 4 MB or smaller.' })
      return
    }

    const extension = getExtension(contentType)
    const safeProductId = productId.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    const path = `${safeProductId}/${Date.now()}.${extension}`

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      })

    if (error) throw error

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
    res.status(200).json({ publicUrl: data.publicUrl, path })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image.'
    res.status(500).json({ message })
  }
}

