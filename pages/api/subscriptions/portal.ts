import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { getSubscriptionOrdersByEmail } from '../../../lib/orderRepository'
import { getCustomerOrderNumber } from '../../../lib/orders'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null
const portalConfigurationId = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID

function getOrigin(req: NextApiRequest) {
  const forwardedProto = req.headers['x-forwarded-proto']
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'http'
  const host = req.headers.host || 'localhost:3000'

  return `${protocol}://${host}`
}

function cleanOrderNumber(value: unknown) {
  return String(value || '').trim().toUpperCase()
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

  const email = String(req.body?.email || '').trim().toLowerCase()
  const orderNumber = cleanOrderNumber(req.body?.orderNumber)

  if (!email || !orderNumber) {
    res.status(400).json({ message: 'Email and order number are required.' })
    return
  }

  try {
    const orders = (await getSubscriptionOrdersByEmail(email)) || []
    const order = orders.find((candidate) => {
      return (
        candidate.stripeSubscriptionId &&
        candidate.customerEmail.toLowerCase() === email &&
        getCustomerOrderNumber(candidate) === orderNumber
      )
    })

    if (!order?.stripeSubscriptionId) {
      res.status(404).json({
        message: 'We could not find an active subscription for that email and order number.',
      })
      return
    }

    const subscription = await stripe.subscriptions.retrieve(order.stripeSubscriptionId)
    if (subscription.status === 'canceled') {
      res.status(400).json({ message: 'This subscription has already been canceled.' })
      return
    }

    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

    if (!customerId) {
      res.status(400).json({ message: 'This subscription does not have a Stripe customer.' })
      return
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      ...(portalConfigurationId ? { configuration: portalConfigurationId } : {}),
      return_url: `${getOrigin(req)}/subscriptions?status=returned`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to open subscription portal.'
    res.status(500).json({ message })
  }
}
