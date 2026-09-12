import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { FormEvent, useEffect, useState } from 'react'
import Stripe from 'stripe'
import { formatPrice } from '../../lib/catalog'
import { getCatalogProductsForAdmin } from '../../lib/catalogRepository'
import { saveOrderToDb } from '../../lib/orderRepository'
import {
  OrderSummary,
  createOrderFromCheckoutSession,
  formatShippingAddress,
  getCustomerOrderNumber,
  getOrderTotalLabel,
} from '../../lib/orders'

interface CheckoutSuccessProps {
  order: OrderSummary | null
  errorMessage?: string
  sessionId?: string
}

export default function CheckoutSuccess({ order, errorMessage, sessionId }: CheckoutSuccessProps) {
  const isPickup = order?.fulfillmentMethod === 'pickup'
  const customerOrderNumber = order ? getCustomerOrderNumber(order) : ''
  const [petName, setPetName] = useState(order?.petDetails?.petName || '')
  const [specialDate, setSpecialDate] = useState(order?.petDetails?.specialDate || '')
  const [instagramHandle, setInstagramHandle] = useState(order?.petDetails?.instagramHandle || '')
  const [petDetailsStatus, setPetDetailsStatus] = useState('')
  const [isSavingPetDetails, setIsSavingPetDetails] = useState(false)

  useEffect(() => {
    if (order) {
      window.localStorage.removeItem('bow-bow-ties-cart')
    }
  }, [order])

  function updateSpecialDate(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    setSpecialDate(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits)
  }

  async function savePetDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sessionId) return

    if (!petName.trim()) {
      setPetDetailsStatus('Please add your pet name before saving.')
      return
    }

    if (specialDate.trim() && !/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(specialDate.trim())) {
      setPetDetailsStatus('Birthday or Gotcha Day should be in MM/DD format.')
      return
    }

    setIsSavingPetDetails(true)
    setPetDetailsStatus('Saving pet details...')

    try {
      const response = await fetch('/api/order-pet-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          petName,
          specialDate,
          instagramHandle,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save pet details.')
      }

      setPetDetailsStatus('Pet details saved. Thank you!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save pet details.'
      setPetDetailsStatus(message)
    } finally {
      setIsSavingPetDetails(false)
    }
  }

  return (
    <>
      <Head>
        <title>Order Confirmed - Bow-Bow-Ties</title>
      </Head>
      <main className="min-h-screen bg-sky-50 px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="rounded-lg border border-sky-100 bg-sky-50 p-5 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-300 text-3xl shadow-sm" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Order confirmed</p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-950">Thank you for your order</h1>
                  </div>
                </div>
                <Link href="/products" className="rounded-lg border border-teal-700 bg-teal-700 px-4 py-2 text-center font-semibold text-white shadow-sm transition-colors hover:bg-teal-800">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {errorMessage || !order ? (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {errorMessage || 'Your payment was completed, but we could not load the order details yet.'}
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-5 md:grid-cols-[1fr_280px]">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">{order.customerName}</h2>
                    <p className="mt-1 text-slate-700">{order.customerEmail || 'Email not provided'}</p>
                    {order.customerPhone && (
                      <p className="mt-1 text-sm text-slate-600">Phone: {order.customerPhone}</p>
                    )}
                    <p className="mt-3 text-sm font-semibold text-slate-700">Order: {customerOrderNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Placed {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-600">Order total</p>
                    <p className="mt-1 text-3xl font-bold text-slate-950">{getOrderTotalLabel(order)}</p>
                    <p className="mt-3 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700">
                      {isPickup ? 'Local pickup' : 'Shipping order'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                  <section>
                    <h2 className="text-lg font-bold text-slate-950">Order Details</h2>
                    <div className="mt-4 space-y-3">
                      {order.lineItems.map((item) => (
                        <div
                          key={`${item.productId}-${item.variantId}-${item.planId || 'single'}`}
                          className="rounded-lg border border-sky-100 bg-sky-50/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-950">{item.productName}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                {item.variantName}
                                {item.planName ? `, ${item.planName}` : ''}
                              </p>
                              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                                {item.purchaseType === 'subscription' ? 'Subscription' : 'One-time purchase'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-950">x {item.quantity}</p>
                              <p className="mt-1 text-sm font-semibold text-primary-700">
                                {formatPrice(item.totalAmountCents)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <aside className="space-y-5">
                    <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
                      <h2 className="font-bold text-slate-950">
                        {isPickup ? 'Pickup Details' : 'Shipping Details'}
                      </h2>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                        {isPickup
                          ? 'No shipping charge was added. We will coordinate pickup details when your order is ready.'
                          : formatShippingAddress(order.shippingAddress) || 'Shipping address will be confirmed from checkout.'}
                      </p>
                    </section>

                    <section className="rounded-lg border border-amber-100 bg-amber-50 p-4 shadow-sm">
                      <h2 className="font-bold text-slate-950">Summary</h2>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between gap-3">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotalCents)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Shipping</span>
                          <span>{formatPrice(order.shippingCents)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Tax</span>
                          <span>{formatPrice(order.taxCents)}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 font-bold text-slate-950">
                          <span>Total</span>
                          <span>{getOrderTotalLabel(order)}</span>
                        </div>
                      </div>
                    </section>
                  </aside>
                </div>

                <div className="mt-8 rounded-lg border border-sky-100 bg-sky-50 p-5 text-sm text-slate-800 shadow-sm">
                  <h2 className="font-bold">What happens next</h2>
                  <p className="mt-2 leading-6">
                    We will prepare your Bow-Bow-Ties order. {isPickup ? 'For pickup orders, we will contact you with pickup details.' : 'For shipped orders, tracking details will be shared after fulfillment.'}
                  </p>
                  <p className="mt-3">
                    Questions? Email <a href="mailto:contact@bowbowties.us" className="font-bold underline">contact@bowbowties.us</a>.
                  </p>
                </div>

                <form
                  onSubmit={savePetDetails}
                  className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm"
                >
                  <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                      <span className="bg-gradient-to-r from-amber-700 via-rose-600 to-sky-700 bg-clip-text text-transparent">
                        Join the Pack
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-white text-xl shadow-sm sm:h-11 sm:w-11 sm:text-2xl" aria-hidden="true">
                        🐾
                      </span>
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Get first dibs on new treats and accessories, behind-the-scenes stories from Divisha, and a little something special for your pup&apos;s big day.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <label>
                      <span className="text-sm font-semibold text-slate-700">Pet Name</span>
                      <input
                        value={petName}
                        onChange={(event) => setPetName(event.target.value)}
                        maxLength={80}
                        className="mt-2 h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                        placeholder="Tabitha"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold text-slate-700">Birthday or Gotcha Day</span>
                      <input
                        value={specialDate}
                        onChange={(event) => updateSpecialDate(event.target.value)}
                        maxLength={5}
                        inputMode="numeric"
                        className="mt-2 h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                        placeholder="MM/DD"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold text-slate-700">Instagram Handle</span>
                      <input
                        value={instagramHandle}
                        onChange={(event) => setInstagramHandle(event.target.value)}
                        maxLength={60}
                        className="mt-2 h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                        placeholder="@bowbowbestie"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      disabled={isSavingPetDetails}
                      className="rounded-lg border border-amber-500 bg-amber-400 px-4 py-2 font-semibold text-slate-950 shadow-sm transition-colors hover:border-amber-600 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingPetDetails ? 'Saving...' : 'Save Pet Details'}
                    </button>
                    {petDetailsStatus && (
                      <p className="text-sm font-semibold text-slate-700">{petDetailsStatus}</p>
                    )}
                  </div>
                </form>
              </>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/products"
                className="rounded-lg border border-primary-600 bg-primary-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Back to Shop
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-primary-600 bg-white px-4 py-2 text-center font-semibold text-primary-700 transition-colors hover:bg-primary-50"
              >
                Back Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<CheckoutSuccessProps> = async (context) => {
  const sessionId = typeof context.query.session_id === 'string' ? context.query.session_id : ''
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!sessionId || !stripeSecretKey) {
    return {
      props: {
        order: null,
        sessionId,
        errorMessage: 'Order details are not available yet. Please check your email receipt or contact Bow-Bow-Ties.',
      },
    }
  }

  try {
    const stripe = new Stripe(stripeSecretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription'],
    })
    const products = await getCatalogProductsForAdmin()
    const order = createOrderFromCheckoutSession(session, products)
    await saveOrderToDb(order)

    return {
      props: {
        order: JSON.parse(JSON.stringify(order)),
        sessionId,
      },
    }
  } catch {
    return {
      props: {
        order: null,
        sessionId,
        errorMessage: 'Your payment was completed, but order details could not be loaded on this page yet. Please contact Bow-Bow-Ties if you need help.',
      },
    }
  }
}
