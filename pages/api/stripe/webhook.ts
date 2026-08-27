import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { sendOrderEmails } from '../../../lib/email'
import { createOrderFromCheckoutSession } from '../../../lib/orders'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

async function readRawBody(req: NextApiRequest) {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  if (!stripe || !webhookSecret) {
    res.status(500).json({ message: 'Stripe webhook is not configured.' })
    return
  }

  const signature = req.headers['stripe-signature']
  if (!signature || Array.isArray(signature)) {
    res.status(400).json({ message: 'Missing Stripe signature.' })
    return
  }

  try {
    const rawBody = await readRawBody(req)
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        {
          const session = event.data.object as Stripe.Checkout.Session
          const order = createOrderFromCheckoutSession(session)
          console.log(`Stripe webhook processed order: ${order.id}`)
          await sendOrderEmails(order)
        }
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log(`Stripe webhook received subscription event: ${event.type}`)
        break
      default:
        console.log(`Stripe webhook ignored: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook verification failed.'
    res.status(400).json({ message })
  }
}
