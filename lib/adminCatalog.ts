import {
  CategoryContent,
  CatalogProduct,
  ProductCategoryId,
  ProductVariant,
  SubscriptionPlan,
  catalogProducts,
  defaultCategoryContent,
} from './catalog'

export interface CatalogDraftExport {
  version: 1
  exportedAt: string
  products: CatalogProduct[]
  categoryContent?: CategoryContent[]
}

export interface CatalogValidationResult {
  valid: boolean
  errors: string[]
}

export const defaultVariantsByCategory: Record<ProductCategoryId, ProductVariant[]> = {
  'bow-ties': [
    { id: 'small', name: 'Small', priceCents: 999 },
    { id: 'big', name: 'Big', priceCents: 1199 },
  ],
  bandanas: [{ id: 'standard', name: 'Standard', priceCents: 1499 }],
  'bow-bow-treats': [{ id: 'standard', name: 'Standard', priceCents: 1099 }],
  'tabitha-beads': [
    { id: 'small', name: 'Small', priceCents: 999 },
    { id: 'big', name: 'Big', priceCents: 1499 },
  ],
  'tote-bags': [{ id: 'standard', name: 'Standard', priceCents: 1299 }],
}

export const bowBowTreatSubscriptionPlans: SubscriptionPlan[] = [
  { id: 'monthly', label: 'Monthly treat box', interval: 'month', intervalCount: 1, priceCents: 999 },
  { id: 'quarterly', label: 'Quarterly variety pack', interval: 'month', intervalCount: 3, priceCents: 2999 },
]

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function dollarsToCents(value: string) {
  const normalized = value.replace(/[^0-9.]/g, '')
  const dollars = Number(normalized)

  if (!Number.isFinite(dollars)) return 0

  return Math.round(dollars * 100)
}

export function centsToDollars(priceCents: number) {
  return (priceCents / 100).toFixed(2)
}

export function createProductDraft(categoryId: ProductCategoryId = 'bow-ties'): CatalogProduct {
  const name = 'New catalog item'

  return {
    id: `draft-${Date.now()}`,
    slug: slugify(name),
    name,
    categoryId,
    shortDescription: '',
    description: '',
    images: [''],
    variants: defaultVariantsByCategory[categoryId],
    subscriptionEnabled: categoryId === 'bow-bow-treats',
    subscriptionPlans: categoryId === 'bow-bow-treats' ? bowBowTreatSubscriptionPlans : undefined,
    featured: false,
    active: false,
  }
}

export function normalizeProductForCategory(product: CatalogProduct, categoryId: ProductCategoryId) {
  const canSubscribe = categoryId === 'bow-bow-treats'

  return {
    ...product,
    categoryId,
    variants: defaultVariantsByCategory[categoryId],
    subscriptionEnabled: canSubscribe ? product.subscriptionEnabled : false,
    subscriptionPlans: canSubscribe && product.subscriptionEnabled ? bowBowTreatSubscriptionPlans : undefined,
  }
}

export function validateProduct(product: CatalogProduct, allProducts: CatalogProduct[]) {
  const errors: string[] = []
  const trimmedName = product.name.trim()
  const slug = product.slug.trim()
  const imageCount = product.images.filter(Boolean).length

  if (!trimmedName) errors.push('Product name is required.')
  if (!slug) errors.push('Slug is required.')
  if (!product.shortDescription.trim()) errors.push('Short description is required.')
  if (!product.description.trim()) errors.push('Full description is required.')
  if (imageCount < 1) errors.push('At least one image is required.')
  if (imageCount > 5) errors.push('A product can have at most 5 images.')
  if (product.subscriptionEnabled && product.categoryId !== 'bow-bow-treats') {
    errors.push('Subscriptions are only enabled for Dog Treats.')
  }

  if (product.subscriptionEnabled && product.categoryId === 'bow-bow-treats') {
    if (!product.subscriptionPlans?.length) {
      errors.push('Dog Treat subscriptions need at least one plan.')
    }

    product.subscriptionPlans?.forEach((plan) => {
      if (!plan.label.trim()) errors.push('Every subscription plan needs a label.')
      if (![1, 3].includes(plan.intervalCount)) {
        errors.push(`${plan.label || 'A subscription plan'} needs a monthly or quarterly cadence.`)
      }
      if (!Number.isInteger(plan.priceCents) || (plan.priceCents ?? 0) < 50) {
        errors.push(`${plan.label || 'A subscription plan'} needs a valid price.`)
      }
    })
  }

  product.variants.forEach((variant) => {
    if (!variant.name.trim()) errors.push('Every option needs a name.')
    if (!variant.id.trim()) errors.push('Every option needs an ID.')
    if (!Number.isInteger(variant.priceCents) || variant.priceCents < 50) {
      errors.push(`${variant.name || 'An option'} needs a valid price.`)
    }
  })

  const duplicateSlug = allProducts.some((candidate) => candidate.id !== product.id && candidate.slug === slug)
  if (duplicateSlug) errors.push('Another product already uses this slug.')

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function createCatalogExport(
  products: CatalogProduct[],
  categoryContent: CategoryContent[] = defaultCategoryContent
): CatalogDraftExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: products.map((product) => ({
      ...product,
      images: product.images.filter(Boolean).slice(0, 1),
      slug: product.slug || slugify(product.name),
    })),
    categoryContent,
  }
}

export function readCatalogExport(raw: string) {
  const parsed = JSON.parse(raw) as CatalogDraftExport

  if (parsed.version !== 1 || !Array.isArray(parsed.products)) {
    throw new Error('This catalog JSON is not a supported export.')
  }

  return parsed.products
}

export function getInitialAdminProducts() {
  return catalogProducts.map((product) => ({ ...product }))
}

export function getInitialCategoryContent() {
  return defaultCategoryContent.map((content) => ({ ...content }))
}
