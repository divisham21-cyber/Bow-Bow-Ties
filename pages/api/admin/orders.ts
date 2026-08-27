import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { isAdminAuthenticated } from '../../../lib/adminAuth'
import { createOrderFromCheckoutSession } from '../../../lib/orders'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ message: 'Method not allowed.' })
    return
  }

  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ message: 'Admin login required.' })
    return
  }

  if (!stripe) {
    res.status(500).json({ message: 'Stripe is not configured.' })
    return
  }

  try {
    const sessions: Stripe.Checkout.Session[] = []
    let startingAfter: string | undefined

    while (sessions.length < 100) {
      const page = await stripe.checkout.sessions.list({
        limit: Math.min(100 - sessions.length, 50),
        starting_after: startingAfter,
        expand: ['data.payment_intent', 'data.subscription'],
      })

      sessions.push(...page.data)
      if (!page.has_more || !page.data.length) break

      startingAfter = page.data[page.data.length - 1].id
    }

    const orders = sessions
      .filter((session) => session.status === 'complete' && session.payment_status === 'paid')
      .map(createOrderFromCheckoutSession)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

    res.status(200).json({ orders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load Stripe orders.'
    res.status(500).json({ message })
  }
}
