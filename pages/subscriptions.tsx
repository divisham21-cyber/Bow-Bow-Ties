import Head from 'next/head'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function SubscriptionsPage() {
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function openPortal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setStatusMessage('Opening your subscription settings...')

    try {
      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, orderNumber }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to open subscription settings.')
      }

      window.location.href = result.url
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open subscription settings.'
      setStatusMessage(message)
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Manage Subscription - Bow-Bow-Ties</title>
        <meta
          name="description"
          content="Manage or cancel your Bow-Bow-Ties dog treat subscription."
        />
      </Head>

      <main className="min-h-screen bg-sky-50">
        <header className="border-b border-sky-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/bow_bow_ties.png"
                alt="Bow-Bow-Ties Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-xl font-bold gradient-text">Bow-Bow-Ties</p>
                <p className="text-sm text-slate-600">For Pets We Love. For Animals in Need.</p>
              </div>
            </Link>
            <nav className="flex flex-wrap gap-3">
              <Link href="/products" className="rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-sky-400">
                Shop
              </Link>
              <a href="mailto:contact@bowbowties.us" className="rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-sky-400">
                Contact
              </a>
            </nav>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Dog Treat Subscriptions</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
                Manage Your Subscription
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
                Need to pause future treat deliveries? Open your secure subscription settings to review your plan or cancel future renewals. Cancellations stop the next charge and do not refund completed orders.
              </p>
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-slate-800">
                Use the email from checkout and your Bow-Bow-Ties order number. The order number starts with BBT and appears on your confirmation page and order email.
              </div>
            </div>
          </div>

          <form onSubmit={openPortal} className="rounded-lg border border-sky-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Open Subscription Settings</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="mt-2 h-11 w-full rounded-md border border-sky-200 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Order Number</span>
                <input
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                  required
                  className="mt-2 h-11 w-full rounded-md border border-sky-200 bg-white px-3 text-sm uppercase focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="BBT-20260912-1234"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-lg border border-teal-700 bg-teal-700 px-4 py-3 text-center font-bold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Opening...' : 'Manage Subscription'}
            </button>

            {statusMessage && (
              <p className="mt-4 rounded-md bg-sky-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {statusMessage}
              </p>
            )}

            <p className="mt-5 text-sm leading-6 text-slate-600">
              If you cannot find your order number, email{' '}
              <a href="mailto:contact@bowbowties.us" className="font-bold text-sky-700 underline">
                contact@bowbowties.us
              </a>{' '}
              and we can help.
            </p>
          </form>
        </section>
      </main>
    </>
  )
}
