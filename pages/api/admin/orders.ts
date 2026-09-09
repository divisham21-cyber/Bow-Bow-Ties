import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { isAdminAuthenticated } from '../../../lib/adminAuth'
import { OrderSummary } from '../../../lib/orders'
import { getOrdersFromDb, saveOrderToDb } from '../../../lib/orderRepository'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'PUT', 'POST'].includes(req.method || '')) {
    res.setHeader('Allow', 'GET, PUT, POST')
    res.status(405).json({ message: 'Method not allowed.' })
    return
  }

  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ message: 'Admin login required.' })
    return
  }

  try {
    if (req.method === 'POST') {
      const action = req.body?.action as 'refund' | 'cancel' | undefined
      const order = req.body?.order as OrderSummary | undefined

      if (!action || !order?.stripeSessionId) {
        res.status(400).json({ message: 'Order action and order payload are required.' })
        return
      }

      if (!stripe) {
        res.status(500).json({ message: 'Stripe is not configured.' })
        return
      }

      if (action === 'refund') {
        if (!order.stripePaymentIntentId) {
          res.status(400).json({ message: 'This order does not have a Stripe payment intent to refund.' })
          return
        }

        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          metadata: {
            orderId: order.id,
            stripeSessionId: order.stripeSessionId,
            source: 'bow-bow-ties-admin',
          },
        })
        const nextOrder: OrderSummary = { ...order, status: 'refunded' }
        const saved = await saveOrderToDb(nextOrder, { preserveAdminState: false })

        if (!saved) {
          res.status(500).json({ message: 'Refund created in Stripe, but Supabase is not configured to save the order status.' })
          return
        }

        res.status(200).json({ ok: true, order: nextOrder, stripeActionId: refund.id })
        return
      }

      if (action === 'cancel') {
        let stripeActionId: string | null = null
        let message = 'Order marked canceled.'

        if (order.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.cancel(order.stripeSubscriptionId)
          stripeActionId = subscription.id
          message = 'Subscription canceled in Stripe and order marked canceled.'
        } else if (order.stripePaymentIntentId) {
          message = 'Order marked canceled. Paid one-time orders are not refunded unless you use Refund payment.'
        }

        const nextOrder: OrderSummary = { ...order, status: 'canceled' }
        const saved = await saveOrderToDb(nextOrder, { preserveAdminState: false })

        if (!saved) {
          res.status(500).json({ message: 'Supabase is not configured.' })
          return
        }

        res.status(200).json({ ok: true, order: nextOrder, stripeActionId, message })
        return
      }
    }

    if (req.method === 'PUT') {
      const order = req.body?.order as OrderSummary | undefined
      if (!order?.stripeSessionId) {
        res.status(400).json({ message: 'Order payload is required.' })
        return
      }

      const saved = await saveOrderToDb(order, { preserveAdminState: false })
      if (!saved) {
        res.status(500).json({ message: 'Supabase is not configured.' })
        return
      }

      res.status(200).json({ ok: true, order })
      return
    }

    const dbOrders = (await getOrdersFromDb()) || []
    const orders = dbOrders.sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    )

    res.status(200).json({
      orders,
      source: 'supabase',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load Stripe orders.'
    res.status(500).json({ message })
  }
}
