import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminAuthenticated } from '../../../lib/adminAuth'
import {
  getCatalogProductsForAdmin,
  getCategoryContentForStorefront,
  saveCatalogProductsToDb,
  saveCategoryContentToDb,
} from '../../../lib/catalogRepository'
import { CatalogProduct, CategoryContent } from '../../../lib/catalog'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ message: 'Admin login required.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const products = await getCatalogProductsForAdmin()
      const categoryContent = await getCategoryContentForStorefront()
      res.status(200).json({ products, categoryContent })
      return
    }

    if (req.method === 'PUT') {
      const products = req.body?.products as CatalogProduct[] | undefined
      const categoryContent = req.body?.categoryContent as CategoryContent[] | undefined
      if (!Array.isArray(products)) {
        res.status(400).json({ message: 'Products payload is required.' })
        return
      }

      await saveCatalogProductsToDb(products)
      let categoryContentSaved: boolean | undefined
      if (Array.isArray(categoryContent)) {
        categoryContentSaved = await saveCategoryContentToDb(categoryContent)
      }

      res.status(200).json({ ok: true, products, categoryContent, categoryContentSaved })
      return
    }

    res.setHeader('Allow', 'GET, PUT')
    res.status(405).json({ message: 'Method not allowed.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to manage catalog.'
    res.status(500).json({ message })
  }
}
