import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Stripe from 'stripe'
import { formatPrice } from '../../lib/catalog'
import { getCatalogProductsForAdmin } from '../../lib/catalogRepository'
import { saveOrderToDb } from '../../lib/orderRepository'
import {
  OrderSummary,
  createOrderFromCheckoutSession,
  formatShippingAddress,
  getOrderTotalLabel,
} from '../../lib/orders'

interface CheckoutSuccessProps {
  order: OrderSummary | null
  errorMessage?: string
}

export default function CheckoutSuccess({ order, errorMessage }: CheckoutSuccessProps) {
  const isPickup = order?.fulfillmentMethod === 'pickup'

  return (
    <>
      <Head>
        <title>Order Confirmed - Bow-Bow-Ties</title>
      </Head>
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/bow_bow_ties.jpg"
                  alt="Bow-Bow-Ties Logo"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Order confirmed</p>
                  <h1 className="mt-1 text-3xl font-bold text-slate-950">Thank you for your order</h1>
                </div>
              </div>
              <Link href="/products" className="btn-primary inline-block text-center">
                Continue Shopping
              </Link>
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
                    <p className="mt-3 text-sm text-slate-500">Order: {order.stripeSessionId}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Placed {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-100 p-4">
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
                          className="rounded-lg border border-slate-200 p-4"
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
                    <section className="rounded-lg border border-slate-200 p-4">
                      <h2 className="font-bold text-slate-950">
                        {isPickup ? 'Pickup Details' : 'Shipping Details'}
                      </h2>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                        {isPickup
                          ? 'No shipping charge was added. We will coordinate pickup details when your order is ready.'
                          : formatShippingAddress(order.shippingAddress) || 'Shipping address will be confirmed from checkout.'}
                      </p>
                    </section>

                    <section className="rounded-lg border border-slate-200 p-4">
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

                <div className="mt-8 rounded-lg border border-primary-100 bg-primary-50 p-5 text-sm text-primary-950">
                  <h2 className="font-bold">What happens next</h2>
                  <p className="mt-2 leading-6">
                    We will prepare your Bow-Bow-Ties order. {isPickup ? 'For pickup orders, we will contact you with pickup details.' : 'For shipped orders, tracking details will be shared after fulfillment.'}
                  </p>
                  <p className="mt-3">
                    Questions? Email <a href="mailto:contact@bowbowties.us" className="font-bold underline">contact@bowbowties.us</a>.
                  </p>
                </div>
              </>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
      },
    }
  } catch {
    return {
      props: {
        order: null,
        errorMessage: 'Your payment was completed, but order details could not be loaded on this page yet. Please contact Bow-Bow-Ties if you need help.',
      },
    }
  }
}
