import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function CheckoutCancel() {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push('/products')
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <>
      <Head>
        <title>Checkout Canceled - Bow-Bow-Ties</title>
      </Head>
      <main className="min-h-screen bg-sky-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-lg border border-sky-100 bg-white p-8 text-center shadow-sm">
          <img
            src="/bow_bow_ties.jpg"
            alt="Bow-Bow-Ties Logo"
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />
          <h1 className="mt-6 text-3xl font-bold text-gray-950">Checkout was canceled</h1>
          <p className="mt-4 text-gray-700">
            No payment was completed. Your cart is saved, and we will take you back to the shop in a moment.
          </p>
          <Link href="/products" className="btn-primary mt-8 inline-block">
            Return to Shop
          </Link>
        </div>
      </main>
    </>
  )
}
