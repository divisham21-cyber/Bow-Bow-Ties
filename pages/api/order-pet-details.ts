import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { getCatalogProductsForAdmin } from '../../lib/catalogRepository'
import { saveOrderToDb } from '../../lib/orderRepository'
import { createOrderFromCheckoutSession, PetDetails } from '../../lib/orders'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

function cleanValue(value: unknown, maxLength: number) {
  return String(value || '').trim().slice(0, maxLength)
}

function normalizeInstagramHandle(value: unknown) {
  const handle = cleanValue(value, 60).replace(/^@+/, '')
  return handle ? `@${handle}` : ''
}

function getPetDetails(body: NextApiRequest['body']): PetDetails {
  return {
    petName: cleanValue(body?.petName, 80),
    specialDate: cleanValue(body?.specialDate, 40),
    instagramHandle: normalizeInstagramHandle(body?.instagramHandle),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ message: 'Method not allowed.' })
    return
  }

  if (!stripe) {
    res.status(500).json({ message: 'Stripe is not configured.' })
    return
  }

  try {
    const sessionId = cleanValue(req.body?.sessionId, 120)
    if (!sessionId.startsWith('cs_')) {
      res.status(400).json({ message: 'Order session is required.' })
      return
    }

    const petDetails = getPetDetails(req.body)
    if (!petDetails.petName && !petDetails.specialDate && !petDetails.instagramHandle) {
      res.status(400).json({ message: 'Add at least one pet detail before saving.' })
      return
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription'],
    })

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      res.status(400).json({ message: 'Pet details can only be saved after a paid order.' })
      return
    }

    const products = await getCatalogProductsForAdmin()
    const order = createOrderFromCheckoutSession(session, products)
    order.petDetails = petDetails

    await saveOrderToDb(order)
    res.status(200).json({ ok: true, petDetails })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save pet details.'
    res.status(500).json({ message })
  }
}
