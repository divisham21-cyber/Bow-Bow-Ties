import { CatalogProduct, ProductCategoryId, ProductVariant, SubscriptionPlan, catalogProducts } from './catalog'
import { getSupabaseAdmin } from './supabaseAdmin'

interface CatalogProductRow {
  id: string
  slug: string
  name: string
  category_id: ProductCategoryId
  short_description: string
  description: string
  hero_image_url: string
  subscription_enabled: boolean
  subscription_plans: SubscriptionPlan[] | null
  featured: boolean
  active: boolean
  sort_order: number
  catalog_product_variants?: CatalogVariantRow[]
}

interface CatalogVariantRow {
  product_id: string
  variant_id: string
  name: string
  price_cents: number
  inventory_label: string | null
  sort_order: number
}

function rowToProduct(row: CatalogProductRow): CatalogProduct {
  const variants = [...(row.catalog_product_variants || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(
      (variant): ProductVariant => ({
        id: variant.variant_id,
        name: variant.name,
        priceCents: variant.price_cents,
        inventoryLabel: variant.inventory_label || undefined,
      })
    )

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    shortDescription: row.short_description,
    description: row.description,
    images: row.hero_image_url ? [row.hero_image_url] : [],
    variants,
    subscriptionEnabled: row.subscription_enabled,
    subscriptionPlans: row.subscription_plans || undefined,
    featured: row.featured,
    active: row.active,
  }
}

function productToRow(product: CatalogProduct, sortOrder: number) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category_id: product.categoryId,
    short_description: product.shortDescription,
    description: product.description,
    hero_image_url: product.images[0] || '',
    subscription_enabled: product.subscriptionEnabled,
    subscription_plans: product.subscriptionPlans || null,
    featured: Boolean(product.featured),
    active: product.active,
    sort_order: sortOrder,
  }
}

function productVariantsToRows(product: CatalogProduct) {
  return product.variants.map((variant, sortOrder) => ({
    product_id: product.id,
    variant_id: variant.id,
    name: variant.name,
    price_cents: variant.priceCents,
    inventory_label: variant.inventoryLabel || null,
    sort_order: sortOrder,
  }))
}

export async function getCatalogProductsFromDb(includeInactive = false) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  let query = supabase
    .from('catalog_products')
    .select('*, catalog_product_variants(*)')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (!includeInactive) query = query.eq('active', true)

  const { data, error } = await query
  if (error) throw error

  return (data || []).map((row) => rowToProduct(row as CatalogProductRow))
}

export async function getCatalogProductsForStorefront() {
  const products = await getCatalogProductsFromDb(false)
  return products && products.length ? products : catalogProducts.filter((product) => product.active)
}

export async function getCatalogProductsForAdmin() {
  const products = await getCatalogProductsFromDb(true)
  return products && products.length ? products : catalogProducts
}

export async function saveCatalogProductsToDb(products: CatalogProduct[]) {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase is not configured.')

  const productRows = products.map(productToRow)
  const { error: productsError } = await supabase
    .from('catalog_products')
    .upsert(productRows, { onConflict: 'id' })

  if (productsError) throw productsError

  const productIds = products.map((product) => product.id)
  const { error: deleteError } = await supabase
    .from('catalog_product_variants')
    .delete()
    .in('product_id', productIds)

  if (deleteError) throw deleteError

  const variantRows = products.flatMap(productVariantsToRows)
  if (!variantRows.length) return

  const { error: variantsError } = await supabase
    .from('catalog_product_variants')
    .insert(variantRows)

  if (variantsError) throw variantsError
}
