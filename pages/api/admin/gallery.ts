import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminAuthenticated } from '../../../lib/adminAuth'
import { GalleryPhoto, getGalleryPhotosFromDb, saveGalleryPhotosToDb } from '../../../lib/gallery'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ message: 'Admin login required.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const photos = await getGalleryPhotosFromDb(true)
      res.status(200).json({ photos })
      return
    }

    if (req.method === 'PUT') {
      const photos = req.body?.photos as GalleryPhoto[] | undefined
      if (!Array.isArray(photos)) {
        res.status(400).json({ message: 'Photos payload is required.' })
        return
      }

      const saved = await saveGalleryPhotosToDb(photos)
      res.status(200).json({ ok: true, photos, saved })
      return
    }

    res.setHeader('Allow', 'GET, PUT')
    res.status(405).json({ message: 'Method not allowed.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to manage gallery.'
    res.status(500).json({ message })
  }
}
