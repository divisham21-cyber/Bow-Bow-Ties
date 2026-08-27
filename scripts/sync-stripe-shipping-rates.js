const fs = require('fs')
const path = require('path')
const Stripe = require('stripe')

const envPath = path.join(__dirname, '..', '.env.local')

function readEnv(filePath) {
  const env = {}

  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const index = trimmed.indexOf('=')
    if (index === -1) continue

    env[trimmed.slice(0, index)] = trimmed.slice(index + 1)
  }

  return env
}

const env = readEnv(envPath)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY
const allowLiveSync = process.env.STRIPE_SYNC_ALLOW_LIVE === 'true'

if (!stripeSecretKey || (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_'))) {
  console.error('Expected STRIPE_SECRET_KEY with a Stripe secret key.')
  process.exit(1)
}

if (stripeSecretKey.startsWith('sk_live_') && !allowLiveSync) {
  console.error('Live sync requires STRIPE_SYNC_ALLOW_LIVE=true.')
  process.exit(1)
}

const stripe = new Stripe(stripeSecretKey)

const shippingRates = [
  {
    envKey: 'STRIPE_STANDARD_SHIPPING_RATE_ID',
    displayName: 'Standard shipping',
    fixedAmountCents: 499,
    minDays: 3,
    maxDays: 7,
  },
]

const recurringShippingPrices = [
  {
    lookupKey: 'bbt_standard-shipping_1_month_subscription',
    nickname: 'Standard shipping - monthly subscription',
    unitAmount: 499,
    interval: 'month',
    intervalCount: 1,
  },
  {
    lookupKey: 'bbt_standard-shipping_3_month_subscription',
    nickname: 'Standard shipping - quarterly subscription',
    unitAmount: 1497,
    interval: 'month',
    intervalCount: 3,
  },
]

async function findShippingRate(displayName) {
  const rates = await stripe.shippingRates.list({
    active: true,
    limit: 100,
  })

  return rates.data.find(
    (rate) => rate.display_name === displayName && rate.metadata?.source === 'bow-bow-ties-website'
  )
}

async function upsertShippingRate(config) {
  const existing = await findShippingRate(config.displayName)

  if (
    existing &&
    existing.fixed_amount?.amount === config.fixedAmountCents &&
    existing.fixed_amount?.currency === 'usd'
  ) {
    return { envKey: config.envKey, id: existing.id, created: false }
  }

  const created = await stripe.shippingRates.create({
    display_name: config.displayName,
    type: 'fixed_amount',
    fixed_amount: {
      amount: config.fixedAmountCents,
      currency: 'usd',
    },
    delivery_estimate: {
      minimum: {
        unit: 'business_day',
        value: config.minDays,
      },
      maximum: {
        unit: 'business_day',
        value: config.maxDays,
      },
    },
    metadata: {
      source: 'bow-bow-ties-website',
    },
  })

  return { envKey: config.envKey, id: created.id, created: true }
}

async function getShippingProduct() {
  const products = await stripe.products.search({
    query: "metadata['catalog_id']:'standard-shipping'",
    limit: 1,
  })

  if (products.data[0]) return products.data[0]

  return stripe.products.create({
    name: 'Standard shipping',
    description: 'Standard Bow-Bow-Ties shipping charge.',
    metadata: {
      catalog_id: 'standard-shipping',
      source: 'bow-bow-ties-website',
    },
  })
}

async function searchPrice(lookupKey) {
  const result = await stripe.prices.search({
    query: `lookup_key:'${lookupKey}'`,
    limit: 1,
  })

  return result.data[0]
}

function priceMatches(existing, config) {
  return (
    existing &&
    existing.unit_amount === config.unitAmount &&
    existing.currency === 'usd' &&
    existing.recurring?.interval === config.interval &&
    existing.recurring?.interval_count === config.intervalCount
  )
}

async function upsertRecurringShippingPrice(shippingProduct, config) {
  const existing = await searchPrice(config.lookupKey)

  if (priceMatches(existing, config)) {
    return { lookupKey: config.lookupKey, id: existing.id, created: false }
  }

  const created = await stripe.prices.create({
    product: shippingProduct.id,
    currency: 'usd',
    unit_amount: config.unitAmount,
    nickname: config.nickname,
    lookup_key: config.lookupKey,
    transfer_lookup_key: true,
    recurring: {
      interval: config.interval,
      interval_count: config.intervalCount,
    },
    metadata: {
      catalog_id: 'standard-shipping',
      purchase_type: 'subscription-shipping',
    },
  })

  return { lookupKey: config.lookupKey, id: created.id, created: true }
}

async function main() {
  const summary = {
    shippingRates: [],
    recurringShippingPrices: [],
  }

  for (const rate of shippingRates) {
    summary.shippingRates.push(await upsertShippingRate(rate))
  }

  const shippingProduct = await getShippingProduct()
  for (const price of recurringShippingPrices) {
    summary.recurringShippingPrices.push(await upsertRecurringShippingPrice(shippingProduct, price))
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
