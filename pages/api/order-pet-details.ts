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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return 'Unable to save pet details.'
}

function getPetDetails(body: NextApiRequest['body']): PetDetails {
  return {
    petName: cleanValue(body?.petName, 80),
    specialDate: cleanValue(body?.specialDate, 5),
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
    if (!petDetails.petName) {
      res.status(400).json({ message: 'Please add your pet name before saving.' })
      return
    }

    if (petDetails.specialDate && !/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(petDetails.specialDate)) {
      res.status(400).json({ message: 'Birthday or Gotcha Day should be in MM/DD format.' })
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
    res.status(500).json({ message: getErrorMessage(error) })
  }
}
