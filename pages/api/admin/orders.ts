import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { isAdminAuthenticated } from '../../../lib/adminAuth'
import { createOrderFromCheckoutSession, OrderSummary } from '../../../lib/orders'
import { getOrdersFromDb, saveOrderToDb } from '../../../lib/orderRepository'
import { getCatalogProductsForAdmin } from '../../../lib/catalogRepository'

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

    const sessions: Stripe.Checkout.Session[] = []
    let startingAfter: string | undefined

    if (stripe) {
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
    }

    const products = await getCatalogProductsForAdmin()
    const stripeOrders = sessions
      .filter((session) => session.status === 'complete' && session.payment_status === 'paid')
      .map((session) => createOrderFromCheckoutSession(session, products))
    const dbOrdersBySessionId = new Map(dbOrders.map((order) => [order.stripeSessionId, order]))
    const mergedStripeOrders = stripeOrders.map((stripeOrder) => {
      const dbOrder = dbOrdersBySessionId.get(stripeOrder.stripeSessionId)
      if (!dbOrder) return stripeOrder

      return {
        ...stripeOrder,
        status: dbOrder.status,
        fulfillment: dbOrder.fulfillment,
      }
    })
    const stripeSessionIds = new Set(stripeOrders.map((order) => order.stripeSessionId))
    const savedOnlyOrders = dbOrders.filter((order) => !stripeSessionIds.has(order.stripeSessionId))
    const orders = [...mergedStripeOrders, ...savedOnlyOrders].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    )

    for (const order of mergedStripeOrders) {
      if (!dbOrdersBySessionId.has(order.stripeSessionId)) {
        await saveOrderToDb(order)
      }
    }

    res.status(200).json({ orders, source: stripe ? 'stripe+supabase' : 'supabase' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load Stripe orders.'
    res.status(500).json({ message })
  }
}
