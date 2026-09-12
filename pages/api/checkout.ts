import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import {
  CatalogProduct,
  getOneTimePriceLookupKey,
  getSubscriptionPriceLookupKey,
} from '../../lib/catalog'
import { getRecurringShippingPriceLookupKey, pickupLocation } from '../../lib/commerceConfig'
import { getCatalogProductsForStorefront } from '../../lib/catalogRepository'

interface CheckoutItemInput {
  productId: string
  variantId: string
  purchaseType: 'one-time' | 'subscription'
  planId?: string
  quantity: number
}

interface CheckoutRequestBody {
  items?: CheckoutItemInput[]
  fulfillmentMethod?: 'ship' | 'pickup'
}

interface ValidatedCheckoutItem {
  productId: string
  productName: string
  variantId: string
  variantName: string
  purchaseType: 'one-time' | 'subscription'
  planId?: string
  planName?: string
  interval?: string
  intervalCount?: number
  unitAmountCents: number
  quantity: number
  lookupKey: string
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null
const standardShippingRateId = process.env.STRIPE_STANDARD_SHIPPING_RATE_ID

function getOrigin(req: NextApiRequest) {
  const forwardedProto = req.headers['x-forwarded-proto']
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'http'
  const host = req.headers.host || 'localhost:3000'

  return `${protocol}://${host}`
}

function validateItems(products: CatalogProduct[], items: CheckoutItemInput[] = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty.')
  }

  if (items.length > 20) {
    throw new Error('Please checkout with 20 cart lines or fewer.')
  }

  return items.map((item): ValidatedCheckoutItem => {
    const product = products.find((candidate) => candidate.id === item.productId && candidate.active)
    if (!product) throw new Error('One of the products is no longer available.')

    const variant = product.variants.find((candidate) => candidate.id === item.variantId)
    if (!variant) throw new Error(`${product.name} has an unavailable option.`)

    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`${product.name} has an invalid quantity.`)
    }

    if (item.purchaseType === 'subscription') {
      if (!product.subscriptionEnabled) {
        throw new Error(`${product.name} is not available as a subscription.`)
      }

      const plan = product.subscriptionPlans?.find((candidate) => candidate.id === item.planId)
      if (!plan) throw new Error(`${product.name} has an unavailable subscription plan.`)

      return {
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantName: variant.name,
        purchaseType: 'subscription',
        planId: plan.id,
        planName: plan.label,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
        unitAmountCents: plan.priceCents || variant.priceCents * plan.intervalCount,
        quantity,
        lookupKey: getSubscriptionPriceLookupKey(product.id, variant.id, plan.id),
      }
    }

    return {
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      purchaseType: 'one-time',
      unitAmountCents: variant.priceCents,
      quantity,
      lookupKey: getOneTimePriceLookupKey(product.id, variant.id),
    }
  })
}

async function getPriceId(lookupKey: string) {
  if (!stripe) throw new Error('Stripe is not configured.')

  const prices = await stripe.prices.list({
    active: true,
    lookup_keys: [lookupKey],
    limit: 1,
  })

  const price = prices.data[0]
  if (!price) throw new Error(`Stripe price is missing for ${lookupKey}.`)

  return price.id
}

async function createPickupTaxCustomer() {
  if (!stripe) throw new Error('Stripe is not configured.')

  const customer = await stripe.customers.create({
    address: {
      city: pickupLocation.city,
      country: pickupLocation.country,
      postal_code: pickupLocation.postalCode,
      state: pickupLocation.state,
    },
    description: 'Bow-Bow-Ties local pickup tax location',
    metadata: {
      source: 'bow-bow-ties-website',
      fulfillmentMethod: 'pickup',
      pickupLocation: pickupLocation.label,
      pickupPostalCode: pickupLocation.postalCode,
    },
  })

  return customer.id
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  if (!stripe) {
    res.status(500).json({ message: 'Stripe is not configured on the server.' })
    return
  }

  try {
    const body = req.body as CheckoutRequestBody
    const fulfillmentMethod = body.fulfillmentMethod === 'pickup' ? 'pickup' : 'ship'

    if (fulfillmentMethod === 'ship' && !standardShippingRateId) {
      res.status(500).json({ message: 'Stripe standard shipping rate is not configured on the server.' })
      return
    }

    const availableProducts = await getCatalogProductsForStorefront()
    const items = validateItems(availableProducts, body.items)
    const subscriptionItems = items.filter((item) => item.purchaseType === 'subscription')
    const subscriptionIntervals = new Set(
      subscriptionItems.map((item) => `${item.interval}:${item.intervalCount}`)
    )

    if (subscriptionIntervals.size > 1) {
      res.status(400).json({
        message: 'Please checkout monthly and quarterly subscriptions separately.',
      })
      return
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = await Promise.all(
      items.map(async (item) => ({
        price: await getPriceId(item.lookupKey),
        quantity: item.quantity,
      }))
    )
    const origin = getOrigin(req)
    const mode = subscriptionItems.length > 0 ? 'subscription' : 'payment'
    const cartMetadata = JSON.stringify(
      items.map((item) => ({
        p: item.productId,
        v: item.variantId,
        t: item.purchaseType === 'subscription' ? 's' : 'o',
        plan: item.planId,
        q: item.quantity,
      }))
    )
    const cartMetadataChunks = cartMetadata.match(/.{1,450}/g) || []

    if (mode === 'subscription' && fulfillmentMethod === 'ship') {
      const firstSubscription = subscriptionItems[0]
      if (!firstSubscription?.intervalCount) {
        res.status(400).json({ message: 'Subscription shipping interval is missing.' })
        return
      }

      lineItems.push({
        price: await getPriceId(getRecurringShippingPriceLookupKey(firstSubscription.intervalCount)),
        quantity: 1,
      })
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        source: 'bow-bow-ties-website',
        fulfillmentMethod,
        cartParts: String(cartMetadataChunks.length),
        ...Object.fromEntries(cartMetadataChunks.map((chunk, index) => [`cart_${index}`, chunk])),
      },
    }

    if (fulfillmentMethod === 'pickup') {
      sessionParams.customer = await createPickupTaxCustomer()
    }

    if (mode === 'payment') {
      if (fulfillmentMethod === 'ship') {
        sessionParams.shipping_address_collection = {
          allowed_countries: ['US'],
        }
        sessionParams.shipping_options = [
          {
            shipping_rate: standardShippingRateId,
          },
        ]
      }
    }

    if (mode === 'subscription' && fulfillmentMethod === 'ship') {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US'],
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    res.status(200).json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start checkout.'
    res.status(400).json({ message })
  }
}
