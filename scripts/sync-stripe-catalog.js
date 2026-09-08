const fs = require('fs')
const path = require('path')
const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')
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
const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY || env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!stripeSecretKey || (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_'))) {
  console.error('Expected STRIPE_SECRET_KEY with a Stripe secret key.')
  process.exit(1)
}

if (stripeSecretKey.startsWith('sk_live_') && !allowLiveSync) {
  console.error('Live sync requires STRIPE_SYNC_ALLOW_LIVE=true.')
  process.exit(1)
}

const stripe = new Stripe(stripeSecretKey)
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

const bowBowTreatSubscriptionPlans = [
  { id: 'monthly', label: 'Monthly treat box', interval: 'month', intervalCount: 1, priceCents: 999 },
  { id: 'quarterly', label: 'Quarterly variety pack', interval: 'month', intervalCount: 3, priceCents: 2999 },
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

function createDisplayProductName(title, attributes) {
  const attributeText = attributes.map((attribute) => attribute.value).join(' - ')

  return attributeText || createProductName(title, attributes)
}

function createShortDescription(categoryId, attributes) {
  const attributeText = attributes.map((attribute) => attribute.value).join(' / ')

  if (categoryId === 'bow-bow-treats') return `${attributeText} 5 oz. natural dog treats.`
  if (categoryId === 'tabitha-beads') return `${attributeText} handcrafted wooden bead necklace.`
  if (categoryId === 'tote-bags') return `${attributeText} pet-themed tote bag.`
  if (categoryId === 'bandanas') return `${attributeText} handmade pet accessory.`

  return `${attributeText} handmade pet bow tie.`
}

function getCatalogPriceCents(categoryId, variantName) {
  const normalizedVariant = variantName.toLowerCase()

  if (categoryId === 'bow-ties') {
    return normalizedVariant === 'big' || normalizedVariant === 'large' ? 1199 : 999
  }

  if (categoryId === 'bandanas') return 1499
  if (categoryId === 'bow-bow-treats') return 1099
  if (categoryId === 'tabitha-beads') return normalizedVariant === 'big' ? 1499 : 999

  return 1299
}

function buildEtsyCatalogProducts() {
  return etsyCatalogSeed.flatMap((listing, listingIndex) =>
    combinations(getProductVariations(listing)).map((attributes, optionIndex) => {
      const categoryId = categoryForListing(listing.title, attributes.map((attribute) => attribute.value))
      const sizeVariation = getSizeVariation(listing, categoryId)
      const name = createDisplayProductName(listing.title, attributes)
      const catalogIdName = createProductName(listing.title, attributes)
      const shortDescription = createShortDescription(categoryId, attributes)
      const description = shortDescription
      const slug = slugify(catalogIdName)
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
  const images = product.images?.length ? product.images.slice(0, 1) : undefined

  if (existing) {
    await stripe.products.update(existing.id, {
      name: product.name,
      description: product.description,
      active: true,
      ...(images ? { images } : {}),
    })

    return { product: existing, created: false }
  }

  const created = await stripe.products.create({
    name: product.name,
    description: product.description,
    ...(images ? { images } : {}),
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
  const amount = plan.priceCents || variant.priceCents * plan.intervalCount
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

function rowToProduct(row) {
  const variants = [...(row.catalog_product_variants || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((variant) => ({
      id: variant.variant_id,
      name: variant.name,
      priceCents: variant.price_cents,
    }))

  return {
    id: row.id,
    name: row.name,
    description: row.short_description || row.description,
    images: row.hero_image_url ? [row.hero_image_url] : [],
    variants,
    plans: row.subscription_enabled ? row.subscription_plans || [] : [],
  }
}

async function loadSupabaseCatalogProducts() {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('catalog_products')
    .select('id, name, short_description, description, hero_image_url, subscription_enabled, subscription_plans, sort_order, catalog_product_variants(product_id, variant_id, name, price_cents, sort_order)')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error

  return (data || []).map(rowToProduct).filter((product) => product.variants.length)
}

async function loadProducts() {
  const dbProducts = await loadSupabaseCatalogProducts()
  if (dbProducts?.length) {
    return { products: dbProducts, source: 'supabase' }
  }

  return { products: buildEtsyCatalogProducts(), source: 'etsy-seed' }
}

async function main() {
  const summary = []
  const { products, source } = await loadProducts()

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
    source,
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
