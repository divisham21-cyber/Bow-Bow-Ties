import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { useMemo, useState } from 'react'
import {
  CategoryContent,
  CatalogProduct,
  ProductCategoryId,
  PurchaseType,
  catalogCategories,
  defaultCategoryContent,
  formatPrice,
} from '../lib/catalog'
import { standardShipping } from '../lib/commerceConfig'
import { getCatalogProductsForStorefront, getCategoryContentForStorefront } from '../lib/catalogRepository'

interface CartItem {
  id: string
  productId: string
  productName: string
  image: string
  variantId: string
  variantName: string
  purchaseType: PurchaseType
  planId?: string
  planName?: string
  priceCents: number
  quantity: number
}

interface ProductSelection {
  variantId: string
  purchaseType: PurchaseType
  planId?: string
}

type CategoryFilter = 'all' | ProductCategoryId
type FulfillmentMethod = 'ship' | 'pickup'

const primaryButtonClass =
  'rounded-lg border border-sky-200 bg-sky-100 px-4 py-2 font-semibold text-slate-900 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400'
const secondaryButtonClass =
  'rounded-lg border border-amber-300 bg-amber-300 px-4 py-2 font-semibold text-slate-950 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-400'

function getDefaultSelection(product: CatalogProduct): ProductSelection {
  return {
    variantId: product.variants[0]?.id || '',
    purchaseType: 'one-time',
    planId: product.subscriptionPlans?.[0]?.id,
  }
}

function getCartItem(product: CatalogProduct, selection: ProductSelection): CartItem {
  const variant = product.variants.find((item) => item.id === selection.variantId) || product.variants[0]
  const plan = product.subscriptionPlans?.find((item) => item.id === selection.planId)
  const isSubscription = selection.purchaseType === 'subscription' && product.subscriptionEnabled && plan

  return {
    id: `${product.id}:${variant.id}:${selection.purchaseType}:${plan?.id || 'single'}`,
    productId: product.id,
    productName: product.name,
    image: product.images[0],
    variantId: variant.id,
    variantName: variant.name,
    purchaseType: isSubscription ? 'subscription' : 'one-time',
    planId: isSubscription ? plan.id : undefined,
    planName: isSubscription ? plan.label : undefined,
    priceCents: isSubscription ? plan.priceCents || variant.priceCents * plan.intervalCount : variant.priceCents,
    quantity: 1,
  }
}

interface ProductsProps {
  initialProducts: CatalogProduct[]
  categoryContent: CategoryContent[]
}

const allProductsIntro = {
  eyebrow: 'Shop the catalog',
  title: 'Handcrafted accessories and treats with a purpose',
  summary: 'Browse bow ties, bandanas, treats, beads, and totes made in small batches.',
  body: 'Choose a category to see more detail about each product type, or shop the full catalog here. Standard shipping and local pickup options are available during checkout.',
}

export default function Products({ initialProducts, categoryContent }: ProductsProps) {
  const activeProducts = useMemo(
    () => initialProducts.filter((product) => product.active),
    [initialProducts]
  )
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selections, setSelections] = useState<Record<string, ProductSelection>>(() =>
    Object.fromEntries(activeProducts.map((product) => [product.id, getDefaultSelection(product)]))
  )
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  const [categoryIntroExpanded, setCategoryIntroExpanded] = useState(false)
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('ship')
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)

  const selectedCategoryIntro =
    selectedCategory === 'all'
      ? allProductsIntro
      : categoryContent.find((content) => content.categoryId === selectedCategory) ||
        defaultCategoryContent.find((content) => content.categoryId === selectedCategory) ||
        allProductsIntro
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return activeProducts
    return activeProducts.filter((product) => product.categoryId === selectedCategory)
  }, [selectedCategory])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)

  function updateSelection(productId: string, nextSelection: Partial<ProductSelection>) {
    setSelections((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        ...nextSelection,
      },
    }))
  }

  function toggleDescription(productId: string) {
    setExpandedDescriptions((current) => ({
      ...current,
      [productId]: !current[productId],
    }))
  }

  function addToCart(product: CatalogProduct) {
    const item = getCartItem(product, selections[product.id] || getDefaultSelection(product))
    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)
      if (!existing) return [...current, item]

      return current.map((cartItem) =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      )
    })
    setCheckoutMessage(`${product.name} was added to cart.`)
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) {
      setCartItems((current) => current.filter((item) => item.id !== itemId))
      return
    }

    setCartItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    )
  }

  async function startCheckout(items: CartItem[], method: FulfillmentMethod = fulfillmentMethod) {
    setCheckoutMessage('Opening secure checkout...')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, fulfillmentMethod: method }),
      })
      const result = await response.json()

      if (result.url) {
        window.location.href = result.url
        return
      }

      setCheckoutMessage(result.message || 'Checkout is not ready yet.')
    } catch {
      setCheckoutMessage('Checkout is not ready yet. Please try again in a moment.')
    }
  }

  return (
    <>
      <Head>
        <title>Shop Pet Accessories - Bow-Bow-Ties</title>
        <meta
          name="description"
          content="Shop handcrafted pet bow ties, bandanas, Bow Bow Treats, and Tabitha Beads directly from Bow-Bow-Ties."
        />
      </Head>

      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:h-24">
              <div className="flex justify-between items-center">
                <Link href="/" className="logo-container">
                  <img
                    src="/bow_bow_ties.jpg"
                    alt="Bow-Bow-Ties Logo"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <h1 className="text-3xl font-bold gradient-text">Bow-Bow-Ties</h1>
                </Link>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3 lg:mt-0 lg:gap-x-8">
                <Link href="/products" className="text-sky-600 font-bold text-base lg:text-lg">
                  Shop
                </Link>
                <a href="/#about" className="text-slate-700 hover:text-sky-600 transition-colors text-base lg:text-lg font-bold">
                  About
                </a>
                <a href="/#impact" className="text-slate-700 hover:text-sky-600 transition-colors text-base lg:text-lg font-bold">
                  Impact
                </a>
                <Link href="/calendar" className="text-slate-700 hover:text-sky-600 transition-colors text-base lg:text-lg font-bold">
                  Calendar
                </Link>
              </nav>

              <div className="flex items-center justify-center space-x-3 mt-3 lg:mt-0 lg:space-x-4">
                <a
                  href="https://www.instagram.com/bow_bow_ties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Follow us on Instagram"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 p-0.5">
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="instagram-gradient-products" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#833ab4" />
                            <stop offset="50%" stopColor="#fd1d1d" />
                            <stop offset="100%" stopColor="#fcb045" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#instagram-gradient-products)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                  </div>
                </a>
                <a
                  href="https://www.facebook.com/p/Bow-Bow-Ties-100071472273808/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Follow us on Facebook"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                </a>
                <a
                  href="https://buymeacoffee.com/bowbowties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Buy Me a Coffee"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden">
                    <img
                      src="/images/donate.jpeg"
                      alt="Buy Me a Coffee"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-sky-100 bg-sky-50">
            <img
              src="/bowbowtiebanner.jpeg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-sky-50/90" />
            <div className="absolute inset-0 bg-white/35" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
              <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Handmade pet accessories</p>
                  <h2 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">Shop Bow-Bow-Ties</h2>
                  <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
                    Browse handcrafted pet accessories, choose sizes and subscription options, then finish with secure checkout.
                  </p>
                  <div className="mt-5 inline-flex max-w-full rounded-lg border border-sky-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                    Standard shipping is {formatPrice(standardShipping.priceCents)}. Local pickup is available at checkout.
                  </div>
                </div>

                <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Cart summary</p>
                      <p className="text-2xl font-bold text-slate-950">{cartCount} item{cartCount === 1 ? '' : 's'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-500">Item subtotal</p>
                      <p className="text-2xl font-bold text-slate-900">{formatPrice(cartTotal)}</p>
                      <p className="text-xs text-slate-500">Before shipping and tax</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-2">
                    <label className={`cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold transition-colors ${fulfillmentMethod === 'ship' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                      <input
                        type="radio"
                        name="hero-fulfillment-method"
                        checked={fulfillmentMethod === 'ship'}
                        onChange={() => setFulfillmentMethod('ship')}
                        className="sr-only"
                      />
                      Ship
                    </label>
                    <label className={`cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold transition-colors ${fulfillmentMethod === 'pickup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                      <input
                        type="radio"
                        name="hero-fulfillment-method"
                        checked={fulfillmentMethod === 'pickup'}
                        onChange={() => setFulfillmentMethod('pickup')}
                        className="sr-only"
                      />
                      Pick Up
                    </label>
                  </div>
                  <button
                    type="button"
                    className={`${primaryButtonClass} w-full mt-4`}
                    disabled={cartItems.length === 0}
                    onClick={() => startCheckout(cartItems)}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {checkoutMessage && (
                <div className="mb-6 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-slate-800">
                  {checkoutMessage}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setCategoryIntroExpanded(false)
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedCategory === 'all'
                      ? 'border-sky-200 bg-sky-100 text-slate-900'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  All
                </button>
                {catalogCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCategoryIntroExpanded(false)
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedCategory === category.id
                        ? 'border-sky-200 bg-sky-100 text-slate-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                <div>
                  <section className="mb-6 rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                      {selectedCategoryIntro.eyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">{selectedCategoryIntro.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                      {selectedCategoryIntro.summary}
                    </p>
                    <div
                      className="mt-3 max-w-3xl text-sm leading-6 text-slate-600"
                      style={
                        categoryIntroExpanded
                          ? undefined
                          : {
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }
                      }
                    >
                      {selectedCategoryIntro.body}
                    </div>
                    {selectedCategoryIntro.body.length > 120 && (
                      <button
                        type="button"
                        onClick={() => setCategoryIntroExpanded((current) => !current)}
                        className="mt-3 text-sm font-bold text-sky-700 hover:text-sky-900"
                      >
                        {categoryIntroExpanded ? 'Show less' : 'More'}
                      </button>
                    )}
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                      const selection = selections[product.id] || getDefaultSelection(product)
                      const selectedVariant =
                        product.variants.find((variant) => variant.id === selection.variantId) || product.variants[0]
                      const selectedPlan = product.subscriptionPlans?.find((plan) => plan.id === selection.planId)
                      const displayPrice =
                        selection.purchaseType === 'subscription' && selectedPlan
                          ? selectedPlan.priceCents || selectedVariant.priceCents * selectedPlan.intervalCount
                          : selectedVariant.priceCents
                      const isDescriptionExpanded = Boolean(expandedDescriptions[product.id])
                      const hasAdditionalDescription =
                        product.description.trim() !== product.shortDescription.trim()
                      const shouldCollapseDescription = product.description.length > 180
                      const heroImage = product.images[0]

                      return (
                        <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="aspect-square bg-slate-100 overflow-hidden">
                          <img
                            src={heroImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-bold text-slate-950">{product.name}</h3>
                            {product.featured && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{product.shortDescription}</p>
                          {hasAdditionalDescription && (
                            <div className="mt-3">
                              <p
                                className="whitespace-pre-line text-sm leading-6 text-slate-700"
                                style={
                                  shouldCollapseDescription && !isDescriptionExpanded
                                    ? {
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }
                                    : undefined
                                }
                              >
                                {product.description}
                              </p>
                              {shouldCollapseDescription && (
                                <button
                                  type="button"
                                  onClick={() => toggleDescription(product.id)}
                                  className="mt-2 text-sm font-bold text-slate-700 hover:text-slate-950"
                                >
                                  {isDescriptionExpanded ? 'See less' : 'See more'}
                                </button>
                              )}
                            </div>
                          )}

                          <label className="mt-5 text-sm font-semibold text-slate-800" htmlFor={`${product.id}-variant`}>
                            Size or option
                          </label>
                          <select
                            id={`${product.id}-variant`}
                            value={selection.variantId}
                            onChange={(event) => updateSelection(product.id, { variantId: event.target.value })}
                            className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                          >
                            {product.variants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variant.name} - {formatPrice(variant.priceCents)}
                              </option>
                            ))}
                          </select>

                          {product.subscriptionEnabled && product.subscriptionPlans?.length ? (
                            <div className="mt-4 space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <input
                                  type="radio"
                                  name={`${product.id}-purchase-type`}
                                  checked={selection.purchaseType === 'one-time'}
                                  onChange={() => updateSelection(product.id, { purchaseType: 'one-time' })}
                                />
                                One-time purchase
                              </label>
                              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <input
                                  type="radio"
                                  name={`${product.id}-purchase-type`}
                                  checked={selection.purchaseType === 'subscription'}
                                  onChange={() =>
                                    updateSelection(product.id, {
                                      purchaseType: 'subscription',
                                      planId: product.subscriptionPlans?.[0]?.id,
                                    })
                                  }
                                />
                                Subscribe
                              </label>
                              {selection.purchaseType === 'subscription' && (
                                <select
                                  value={selection.planId}
                                  onChange={(event) => updateSelection(product.id, { planId: event.target.value })}
                                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                >
                                  {product.subscriptionPlans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                      {plan.label} - {formatPrice(plan.priceCents || selectedVariant.priceCents * plan.intervalCount)}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          ) : (
                            <p className="mt-4 text-sm font-semibold text-slate-500">One-time purchase</p>
                          )}

                          <div className="mt-auto pt-5">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-slate-900">{formatPrice(displayPrice)}</span>
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {selection.purchaseType === 'subscription' ? 'Subscription' : 'One-time'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              <button type="button" className={secondaryButtonClass} onClick={() => addToCart(product)}>
                                Add to Cart
                              </button>
                              <button
                                type="button"
                                className={primaryButtonClass}
                                onClick={() => startCheckout([getCartItem(product, selection)], fulfillmentMethod)}
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                  </div>
                </div>

                <aside className="lg:sticky lg:top-6 h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-950">Cart</h3>
                    <span className="text-sm font-semibold text-slate-500">{cartCount} item{cartCount === 1 ? '' : 's'}</span>
                  </div>

                  {cartItems.length === 0 ? (
                    <p className="mt-5 text-sm text-slate-600">Cart is Empty</p>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-[64px_1fr] gap-3 border-b border-slate-100 pb-4">
                          <div className="h-16 w-16 overflow-hidden rounded-md bg-slate-100">
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="flex justify-between gap-2">
                              <p className="font-semibold text-slate-950">{item.productName}</p>
                              <button
                                type="button"
                                className="text-sm font-semibold text-slate-500 hover:text-red-600"
                                onClick={() => updateQuantity(item.id, 0)}
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-sm text-slate-600">
                              {item.variantName}
                              {item.planName ? `, ${item.planName}` : ''}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                aria-label={`Quantity for ${item.productName}`}
                              />
                              <span className="font-bold text-slate-900">
                                {formatPrice(item.priceCents * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-2 text-lg font-bold">
                        <span>Item subtotal</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="space-y-2 rounded-md bg-slate-50 p-3">
                        <p className="text-sm font-semibold text-slate-700">Fulfillment</p>
                        <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
                          <span>Ship with Standard shipping</span>
                          <input
                            type="radio"
                            name="fulfillment-method"
                            checked={fulfillmentMethod === 'ship'}
                            onChange={() => setFulfillmentMethod('ship')}
                          />
                        </label>
                        <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
                          <span>Pick up order</span>
                          <input
                            type="radio"
                            name="fulfillment-method"
                            checked={fulfillmentMethod === 'pickup'}
                            onChange={() => setFulfillmentMethod('pickup')}
                          />
                        </label>
                        <p className="text-xs text-slate-500">
                          {fulfillmentMethod === 'ship'
                            ? `Standard shipping is ${formatPrice(standardShipping.priceCents)} plus applicable tax.`
                            : 'Pickup has no shipping charge. We will coordinate pickup after payment.'}
                        </p>
                      </div>
                      <button type="button" className={`${primaryButtonClass} w-full`} onClick={() => startCheckout(cartItems)}>
                        Checkout
                      </button>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 text-white py-12 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h5 className="text-xl font-bold mb-4">Bow-Bow-Ties</h5>
                <p className="text-gray-400">Handcrafted pet accessories with purpose.</p>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Quick Links</h6>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/products" className="hover:text-white transition-colors">Shop</Link></li>
                  <li><Link href="/admin/catalog" className="hover:text-white transition-colors">Catalog Admin</Link></li>
                  <li><Link href="/admin/orders" className="hover:text-white transition-colors">Orders Admin</Link></li>
                  <li><a href="/#about" className="hover:text-white transition-colors">About</a></li>
                  <li><Link href="/calendar" className="hover:text-white transition-colors">Calendar</Link></li>
                  <li><a href="/#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Contact</h6>
                <ul className="space-y-2 text-gray-400">
                  <li>contact@bowbowties.us</li>
                  <li>Bothell, Washington</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2026 Bow-Bow-Ties. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ProductsProps> = async () => {
  const initialProducts = await getCatalogProductsForStorefront()
  const categoryContent = await getCategoryContentForStorefront()

  return {
    props: {
      initialProducts: JSON.parse(JSON.stringify(initialProducts)),
      categoryContent: JSON.parse(JSON.stringify(categoryContent)),
    },
  }
}
