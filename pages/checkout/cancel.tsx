import Head from 'next/head'
import Link from 'next/link'

export default function CheckoutCancel() {
  return (
    <>
      <Head>
        <title>Checkout Canceled - Bow-Bow-Ties</title>
      </Head>
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <img
            src="/bow_bow_ties.jpg"
            alt="Bow-Bow-Ties Logo"
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />
          <h1 className="mt-6 text-3xl font-bold text-gray-950">Checkout was canceled</h1>
          <p className="mt-4 text-gray-700">
            No payment was completed. Customers can return to the shop and adjust their cart.
          </p>
          <Link href="/products" className="btn-primary mt-8 inline-block">
            Return to Products
          </Link>
        </div>
      </main>
    </>
  )
}
