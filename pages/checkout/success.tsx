import Head from 'next/head'
import Link from 'next/link'

export default function CheckoutSuccess() {
  return (
    <>
      <Head>
        <title>Order Confirmed - Bow-Bow-Ties</title>
      </Head>
      <main className="min-h-screen bg-primary-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-lg border border-primary-100 bg-white p-8 text-center shadow-sm">
          <img
            src="/bow_bow_ties.jpg"
            alt="Bow-Bow-Ties Logo"
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />
          <h1 className="mt-6 text-3xl font-bold text-gray-950">Thank you for your order</h1>
          <p className="mt-4 text-gray-700">
            Your payment was completed successfully. We will prepare your Bow-Bow-Ties order and share fulfillment details when it is ready.
          </p>
          <div className="mt-6 rounded-lg bg-primary-50 p-4 text-left text-sm text-primary-900">
            <p className="font-semibold">What happens next</p>
            <p className="mt-2">
              A receipt is handled by our secure checkout. If your order is shipped, tracking information will be shared after fulfillment. If you selected pickup, we will coordinate pickup details.
            </p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/products" className="btn-primary inline-block">
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-primary-600 bg-white px-4 py-2 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
