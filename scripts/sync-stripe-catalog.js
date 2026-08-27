const fs = require('fs')
const path = require('path')
const Stripe = require('stripe')
const etsyCatalogSeed = require('../lib/etsyCatalogSeed.json')

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

const bowBowTreatSubscriptionPlans = [
  { id: 'monthly', label: 'Monthly treat box', interval: 'month', intervalCount: 1 },
  { id: 'quarterly', label: 'Quarterly treat box', interval: 'month', intervalCount: 3 },
]

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/"/g, ' inch ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanBaseTitle(title) {
  return title
    .replace(/\s*-\s*50%.*$/i, '')
    .replace(/\s*50% donated\.?$/i, '')
    .replace(/\.$/, '')
    .trim()
}

function categoryForListing(title, attributes) {
  const searchable = `${title} ${attributes.join(' ')}`.toLowerCase()
  const attributeText = attributes.join(' ').toLowerCase()

  if (searchable.includes('treat')) return 'bow-bow-treats'
  if (searchable.includes('bead') || searchable.includes('necklace')) return 'tabitha-beads'
  if (searchable.includes('tote')) return 'tote-bags'
  if (title.toLowerCase().includes('bow tie') && title.toLowerCase().includes('bandana')) {
    return attributeText.includes('bandana') || attributeText.includes('scarf') ? 'bandanas' : 'bow-ties'
  }
  if (searchable.includes('bandana') || searchable.includes('scarf')) return 'bandanas'

  return 'bow-ties'
}

function combinations(variations) {
  if (!variations.length) return [[]]

  return variations.reduce(
    (sets, variation) =>
      sets.flatMap((set) => variation.values.map((value) => [...set, { name: variation.name, value }])),
    [[]]
  )
}

function isSizeVariation(variation) {
  return variation.name.toLowerCase().includes('size')
}

function getProductVariations(listing) {
  return listing.variations.filter((variation) => !isSizeVariation(variation))
}

function getSizeVariation(listing, categoryId) {
  if (categoryId === 'tabitha-beads') {
    return {
      name: 'Size',
      values: ['Small', 'Big'],
    }
  }

  return listing.variations.find((variation) => isSizeVariation(variation))
}

function createProductName(title, attributes) {
  const baseTitle = cleanBaseTitle(title)
  const attributeText = attributes.map((attribute) => attribute.value).join(' - ')

  return attributeText ? `${baseTitle} - ${attributeText}` : baseTitle
}

function getCatalogPriceCents(categoryId, variantName) {
  const normalizedVariant = variantName.toLowerCase()

  if (categoryId === 'bow-ties') {
    return normalizedVariant === 'big' || normalizedVariant === 'large' ? 1199 : 999
  }

  if (categoryId === 'bandanas') return 1499
  if (categoryId === 'bow-bow-treats') return 999
  if (categoryId === 'tabitha-beads') return normalizedVariant === 'big' ? 1499 : 999

  return 1299
}

function buildEtsyCatalogProducts() {
  return etsyCatalogSeed.flatMap((listing, listingIndex) =>
    combinations(getProductVariations(listing)).map((attributes, optionIndex) => {
      const categoryId = categoryForListing(listing.title, attributes.map((attribute) => attribute.value))
      const sizeVariation = getSizeVariation(listing, categoryId)
      const name = createProductName(listing.title, attributes)
      const selectedOptions = attributes.map((attribute) => `${attribute.name}: ${attribute.value}`).join(', ')
      const description = selectedOptions
        ? `${listing.description}\n\nSelected options: ${selectedOptions}.`
        : listing.description
      const slug = slugify(name)
      const isTreat = categoryId === 'bow-bow-treats'
      const variants = sizeVariation
        ? sizeVariation.values.map((value) => ({
            id: slugify(value),
            name: value,
            priceCents: getCatalogPriceCents(categoryId, value),
          }))
        : [{ id: 'standard', name: 'Standard', priceCents: getCatalogPriceCents(categoryId, 'standard') }]

      return {
        id: slug || `etsy-product-${listingIndex + 1}-${optionIndex + 1}`,
        name,
        description,
        variants,
        plans: isTreat ? bowBowTreatSubscriptionPlans : [],
      }
    })
  )
}

const products = buildEtsyCatalogProducts()

function oneTimeLookupKey(productId, variantId) {
  return `bbt_${productId}_${variantId}_one_time`
}

function subscriptionLookupKey(productId, variantId, planId) {
  return `bbt_${productId}_${variantId}_${planId}_subscription`
}

async function searchProduct(catalogId) {
  const result = await stripe.products.search({
    query: `metadata['catalog_id']:'${catalogId}'`,
    limit: 1,
  })

  return result.data[0]
}

async function searchPrice(lookupKey) {
  const result = await stripe.prices.search({
    query: `lookup_key:'${lookupKey}'`,
    limit: 1,
  })

  return result.data[0]
}

async function upsertProduct(product) {
  const existing = await searchProduct(product.id)
  if (existing) {
    await stripe.products.update(existing.id, {
      name: product.name,
      description: product.description,
      active: true,
    })

    return { product: existing, created: false }
  }

  const created = await stripe.products.create({
    name: product.name,
    description: product.description,
    metadata: {
      catalog_id: product.id,
      source: 'bow-bow-ties-website',
    },
  })

  return { product: created, created: true }
}

function priceMatches(existing, amount, recurring) {
  if (!existing || existing.unit_amount !== amount || existing.currency !== 'usd') return false
  if (!recurring) return !existing.recurring

  return (
    existing.recurring?.interval === recurring.interval &&
    existing.recurring?.interval_count === recurring.interval_count
  )
}

async function upsertOneTimePrice(product, stripeProduct, variant) {
  const lookupKey = oneTimeLookupKey(product.id, variant.id)
  const existing = await searchPrice(lookupKey)

  if (priceMatches(existing, variant.priceCents)) {
    return { lookupKey, stripePriceId: existing.id, created: false }
  }

  const created = await stripe.prices.create({
    product: stripeProduct.id,
    currency: 'usd',
    unit_amount: variant.priceCents,
    nickname: `${product.name} - ${variant.name}`,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    metadata: {
      catalog_id: product.id,
      variant_id: variant.id,
      purchase_type: 'one-time',
    },
  })

  return { lookupKey, stripePriceId: created.id, created: true }
}

async function upsertRecurringPrice(product, stripeProduct, variant, plan) {
  const lookupKey = subscriptionLookupKey(product.id, variant.id, plan.id)
  const amount = variant.priceCents * plan.intervalCount
  const recurring = {
    interval: plan.interval,
    interval_count: plan.intervalCount,
  }
  const existing = await searchPrice(lookupKey)

  if (priceMatches(existing, amount, recurring)) {
    return { lookupKey, stripePriceId: existing.id, created: false }
  }

  const created = await stripe.prices.create({
    product: stripeProduct.id,
    currency: 'usd',
    unit_amount: amount,
    nickname: `${product.name} - ${variant.name} - ${plan.label}`,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    recurring,
    metadata: {
      catalog_id: product.id,
      variant_id: variant.id,
      plan_id: plan.id,
      purchase_type: 'subscription',
    },
  })

  return { lookupKey, stripePriceId: created.id, created: true }
}

async function main() {
  const summary = []

  for (const product of products) {
    const productResult = await upsertProduct(product)
    const priceResults = []

    for (const variant of product.variants) {
      priceResults.push(await upsertOneTimePrice(product, productResult.product, variant))

      for (const plan of product.plans) {
        priceResults.push(await upsertRecurringPrice(product, productResult.product, variant, plan))
      }
    }

    summary.push({
      catalogId: product.id,
      stripeProductId: productResult.product.id,
      productCreated: productResult.created,
      prices: priceResults,
    })
  }

  const createdProducts = summary.filter((item) => item.productCreated).length
  const createdPrices = summary.reduce(
    (total, item) => total + item.prices.filter((price) => price.created).length,
    0
  )

  console.log(JSON.stringify({
    products: summary.length,
    createdProducts,
    createdPrices,
    reusedProducts: summary.length - createdProducts,
    reusedPrices: summary.reduce((total, item) => total + item.prices.length, 0) - createdPrices,
  }, null, 2))

  if (process.env.STRIPE_SYNC_VERBOSE === 'true') {
    console.log(JSON.stringify(summary, null, 2))
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
