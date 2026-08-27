import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  CatalogProduct,
  ProductCategoryId,
  PurchaseType,
  catalogCategories,
  catalogProducts,
  formatPrice,
} from '../lib/catalog'
import { standardShipping } from '../lib/commerceConfig'

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

const activeProducts = catalogProducts.filter((product) => product.active)
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
    priceCents: isSubscription ? variant.priceCents * plan.intervalCount : variant.priceCents,
    quantity: 1,
  }
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selections, setSelections] = useState<Record<string, ProductSelection>>(() =>
    Object.fromEntries(activeProducts.map((product) => [product.id, getDefaultSelection(product)]))
  )
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  const [selectedImages, setSelectedImages] = useState<Record<string, string>>({})
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('ship')
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)

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
                <Link href="/" className="text-slate-700 hover:text-sky-600 transition-colors text-base lg:text-lg font-bold">
                  Home
                </Link>
                <Link href="/products" className="text-sky-600 font-bold text-base lg:text-lg">
                  Products
                </Link>
                <a href="/#about" className="text-slate-700 hover:text-sky-600 transition-colors text-base lg:text-lg font-bold">
                  About
                </a>
                <Link href="/calendar" className="text-slate-700 hover:text-sky-600 transition-colors text-base lg:text-lg font-bold">
                  Calendar
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main>
          <section className="border-b border-slate-200 bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Handmade pet accessories</p>
                  <h2 className="text-4xl font-bold text-slate-950 mt-3">Shop Bow-Bow-Ties</h2>
                  <p className="text-lg text-slate-700 mt-4 max-w-3xl">
                    Browse handcrafted pet accessories, choose sizes and subscription options, then finish with secure checkout.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    Standard shipping is {formatPrice(standardShipping.priceCents)}, or choose local pickup at checkout.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Cart</p>
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
                  onClick={() => setSelectedCategory('all')}
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
                    onClick={() => setSelectedCategory(category.id)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const selection = selections[product.id] || getDefaultSelection(product)
                    const selectedVariant =
                      product.variants.find((variant) => variant.id === selection.variantId) || product.variants[0]
                    const selectedPlan = product.subscriptionPlans?.find((plan) => plan.id === selection.planId)
                    const displayPrice =
                      selection.purchaseType === 'subscription' && selectedPlan
                        ? selectedVariant.priceCents * selectedPlan.intervalCount
                        : selectedVariant.priceCents
                    const isDescriptionExpanded = Boolean(expandedDescriptions[product.id])
                    const shouldCollapseDescription = product.description.length > 180
                    const heroImage = selectedImages[product.id] || product.images[0]

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

                          {product.images.length > 1 && (
                            <div className="flex gap-2 mt-4">
                              {product.images.slice(0, 5).map((image) => (
                                <button
                                  key={image}
                                  type="button"
                                  onClick={() =>
                                    setSelectedImages((current) => ({
                                      ...current,
                                      [product.id]: image,
                                    }))
                                  }
                                  className={`h-12 w-12 overflow-hidden rounded border bg-slate-100 ${
                                    heroImage === image ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200'
                                  }`}
                                  aria-label={`Show image for ${product.name}`}
                                >
                                  <img src={image} alt="" className="h-full w-full object-cover" />
                                </button>
                              ))}
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
                                      {plan.label} - {formatPrice(selectedVariant.priceCents * plan.intervalCount)}
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

                <aside className="lg:sticky lg:top-6 h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-950">Cart</h3>
                    <span className="text-sm font-semibold text-slate-500">{cartCount} item{cartCount === 1 ? '' : 's'}</span>
                  </div>

                  {cartItems.length === 0 ? (
                    <p className="mt-5 text-sm text-slate-600">Your cart is ready for bow ties, bandanas, treats, and beads.</p>
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
                  <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
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
                  <li>bowbowties21@gmail.com</li>
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
