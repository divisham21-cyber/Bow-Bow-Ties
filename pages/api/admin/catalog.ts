import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminAuthenticated } from '../../../lib/adminAuth'
import { getCatalogProductsForAdmin, saveCatalogProductsToDb } from '../../../lib/catalogRepository'
import { CatalogProduct } from '../../../lib/catalog'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ message: 'Admin login required.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const products = await getCatalogProductsForAdmin()
      res.status(200).json({ products })
      return
    }

    if (req.method === 'PUT') {
      const products = req.body?.products as CatalogProduct[] | undefined
      if (!Array.isArray(products)) {
        res.status(400).json({ message: 'Products payload is required.' })
        return
      }

      await saveCatalogProductsToDb(products)
      res.status(200).json({ ok: true, products })
      return
    }

    res.setHeader('Allow', 'GET, PUT')
    res.status(405).json({ message: 'Method not allowed.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to manage catalog.'
    res.status(500).json({ message })
  }
}

