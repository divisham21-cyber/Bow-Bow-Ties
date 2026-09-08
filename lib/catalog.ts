import etsyCatalogSeed from './etsyCatalogSeed.json'

export type ProductCategoryId =
  | 'bow-ties'
  | 'bandanas'
  | 'bow-bow-treats'
  | 'tabitha-beads'
  | 'tote-bags'

export type PurchaseType = 'one-time' | 'subscription'

export interface ProductCategory {
  id: ProductCategoryId
  name: string
  description: string
}

export interface CategoryContent {
  categoryId: ProductCategoryId
  eyebrow: string
  title: string
  summary: string
  body: string
}

export interface ProductVariant {
  id: string
  name: string
  priceCents: number
  inventoryLabel?: string
}

export interface SubscriptionPlan {
  id: string
  label: string
  interval: 'month'
  intervalCount: number
  priceCents?: number
}

export interface CatalogProduct {
  id: string
  slug: string
  name: string
  categoryId: ProductCategoryId
  shortDescription: string
  description: string
  images: string[]
  variants: ProductVariant[]
  subscriptionEnabled: boolean
  subscriptionPlans?: SubscriptionPlan[]
  featured?: boolean
  active: boolean
}

interface EtsyCatalogVariation {
  name: string
  values: string[]
}

interface EtsyCatalogListing {
  title: string
  description: string
  price: string
  quantity: number
  images: string[]
  variations: EtsyCatalogVariation[]
  sku?: string | null
}

export const catalogCategories: ProductCategory[] = [
  {
    id: 'bow-ties',
    name: 'Bow Ties',
    description: 'Handmade accessories for collars, photos, events, and everyday walks.',
  },
  {
    id: 'bandanas',
    name: 'Bandanas',
    description: 'Soft seasonal prints for pets who prefer an easy tie-on style.',
  },
  {
    id: 'bow-bow-treats',
    name: 'Bow Bow Treats',
    description: 'Giftable treat bundles and care packages for pet celebrations.',
  },
  {
    id: 'tabitha-beads',
    name: 'Tabitha Beads',
    description: 'Handcrafted wooden bead necklaces in playful, pet-inspired themes.',
  },
  {
    id: 'tote-bags',
    name: 'Tote Bags',
    description: 'Pet-themed tote bags that support the Bow-Bow-Ties mission.',
  },
]

export const defaultCategoryContent: CategoryContent[] = [
  {
    categoryId: 'bow-ties',
    eyebrow: 'Handmade bow ties',
    title: 'Bow ties for everyday charm, photos, and celebrations',
    summary: 'Soft, lightweight bow ties made for collars, portraits, parties, and daily walks.',
    body: 'Each bow tie is handmade in small batches with playful prints and comfortable sizing. Choose Small or Big based on your pet, then add a polished pop of personality for birthdays, holidays, adoption days, family photos, or an ordinary walk that deserves a little flair.',
  },
  {
    categoryId: 'bandanas',
    eyebrow: 'Tie-on style',
    title: 'Bandanas and scarves for pets and their humans',
    summary: 'Easy tie-on accessories with soft seasonal patterns and a relaxed, giftable feel.',
    body: 'Our bandanas are designed for flexible everyday styling: tie one on your pet, wear one yourself, or create a matching look. They are simple to adjust, easy to pack for outings, and made for customers who want pet accessories that feel cheerful without being fussy.',
  },
  {
    categoryId: 'bow-bow-treats',
    eyebrow: 'Small batch treats',
    title: 'Oven-baked Bow Bow Treats',
    summary: 'Crunchy 5 oz. dog treats in simple flavors, available as one-time orders or subscriptions.',
    body: 'Bow Bow Treats are made for easy gifting, restocking, and happy routines. Pick a flavor for a single order, or subscribe monthly or quarterly so your dog has a fresh treat delivery on schedule.',
  },
  {
    categoryId: 'tabitha-beads',
    eyebrow: 'Tabitha Beads',
    title: 'Handcrafted wooden bead necklaces with meaning',
    summary: 'Adjustable wooden bead accessories in playful themes for pets and people.',
    body: 'Tabitha Beads honor the collection story with colorful wooden bead designs, themed charms, and a handmade finish. They can be worn as pet necklaces or human accessories, with Small and Big options for the right fit.',
  },
  {
    categoryId: 'tote-bags',
    eyebrow: 'Reusable totes',
    title: 'Pet-themed totes for errands, events, and gifts',
    summary: 'Reusable canvas-style totes with pet-inspired designs and everyday utility.',
    body: 'These totes are practical for markets, books, pet supplies, and event days. They keep the Bow-Bow-Ties mission visible while giving customers a useful accessory they can carry often.',
  },
]

const bowBowTreatSubscriptionPlans: SubscriptionPlan[] = [
  { id: 'monthly', label: 'Monthly treat box', interval: 'month', intervalCount: 1, priceCents: 999 },
  { id: 'quarterly', label: 'Quarterly variety pack', interval: 'month', intervalCount: 3, priceCents: 2999 },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/"/g, ' inch ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanBaseTitle(title: string) {
  return title
    .replace(/\s*-\s*50%.*$/i, '')
    .replace(/\s*50% donated\.?$/i, '')
    .replace(/\.$/, '')
    .trim()
}

function categoryForListing(title: string, attributes: string[]) {
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

function combinations(variations: EtsyCatalogVariation[]) {
  if (!variations.length) return [[]] as Array<Array<{ name: string; value: string }>>

  return variations.reduce<Array<Array<{ name: string; value: string }>>>(
    (sets, variation) =>
      sets.flatMap((set) => variation.values.map((value) => [...set, { name: variation.name, value }])),
    [[]]
  )
}

function isSizeVariation(variation: EtsyCatalogVariation) {
  return variation.name.toLowerCase().includes('size')
}

function getProductVariations(listing: EtsyCatalogListing) {
  return listing.variations.filter((variation) => !isSizeVariation(variation))
}

function getSizeVariation(listing: EtsyCatalogListing, categoryId: ProductCategoryId) {
  if (categoryId === 'tabitha-beads') {
    return {
      name: 'Size',
      values: ['Small', 'Big'],
    }
  }

  return listing.variations.find((variation) => isSizeVariation(variation))
}

function getCatalogPriceCents(categoryId: ProductCategoryId, variantName: string) {
  const normalizedVariant = variantName.toLowerCase()

  if (categoryId === 'bow-ties') {
    return normalizedVariant === 'big' || normalizedVariant === 'large' ? 1199 : 999
  }

  if (categoryId === 'bandanas') return 1499
  if (categoryId === 'bow-bow-treats') return 1099
  if (categoryId === 'tabitha-beads') return normalizedVariant === 'big' ? 1499 : 999

  return 1299
}

function createShortDescription(categoryId: ProductCategoryId, attributes: Array<{ name: string; value: string }>) {
  const attributeText = attributes.map((attribute) => attribute.value).join(' / ')

  if (categoryId === 'bow-bow-treats') return `${attributeText} 5 oz. natural dog treats.`
  if (categoryId === 'tabitha-beads') return `${attributeText} handcrafted wooden bead necklace.`
  if (categoryId === 'tote-bags') return `${attributeText} pet-themed tote bag.`
  if (categoryId === 'bandanas') return `${attributeText} handmade pet accessory.`

  return `${attributeText} handmade pet bow tie.`
}

function createProductName(title: string, attributes: Array<{ name: string; value: string }>) {
  const baseTitle = cleanBaseTitle(title)
  const attributeText = attributes.map((attribute) => attribute.value).join(' - ')

  return attributeText ? `${baseTitle} - ${attributeText}` : baseTitle
}

function createDisplayProductName(
  title: string,
  attributes: Array<{ name: string; value: string }>,
  categoryId: ProductCategoryId
) {
  const attributeText = attributes.map((attribute) => attribute.value).join(' - ')

  if (attributeText) return attributeText

  return createProductName(title, attributes)
}

function prioritizeImages(images: string[], optionIndex: number) {
  if (images.length < 2) return images

  const heroImage = images[optionIndex % images.length]
  return [heroImage]
}

function buildEtsyCatalogProducts() {
  const listings = etsyCatalogSeed as EtsyCatalogListing[]

  return listings.flatMap((listing, listingIndex) =>
    combinations(getProductVariations(listing)).map((attributes, optionIndex) => {
      const categoryId = categoryForListing(listing.title, attributes.map((attribute) => attribute.value))
      const sizeVariation = getSizeVariation(listing, categoryId)
      const name = createDisplayProductName(listing.title, attributes, categoryId)
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
            inventoryLabel: listing.quantity ? `${listing.quantity} listed on Etsy` : undefined,
          }))
        : [
            {
              id: 'standard',
              name: 'Standard',
              priceCents: getCatalogPriceCents(categoryId, 'standard'),
              inventoryLabel: listing.quantity ? `${listing.quantity} listed on Etsy` : undefined,
            },
          ]

      return {
        id: slug || `etsy-product-${listingIndex + 1}-${optionIndex + 1}`,
        slug: slug || `etsy-product-${listingIndex + 1}-${optionIndex + 1}`,
        name,
        categoryId,
        shortDescription,
        description,
        images: prioritizeImages(listing.images, optionIndex),
        variants,
        subscriptionEnabled: isTreat,
        subscriptionPlans: isTreat ? bowBowTreatSubscriptionPlans : undefined,
        featured: optionIndex === 0 && listingIndex < 5,
        active: true,
      } satisfies CatalogProduct
    })
  )
}

export const catalogProducts: CatalogProduct[] = buildEtsyCatalogProducts()

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100)
}

export function getOneTimePriceLookupKey(productId: string, variantId: string) {
  return `bbt_${productId}_${variantId}_one_time`
}

export function getSubscriptionPriceLookupKey(productId: string, variantId: string, planId: string) {
  return `bbt_${productId}_${variantId}_${planId}_subscription`
}
