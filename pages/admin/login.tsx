import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useMemo, useState } from 'react'

function getSafeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value
  if (!next || !next.startsWith('/admin') || next.startsWith('/admin/login')) return '/admin'

  return next
}

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const next = useMemo(() => getSafeNext(router.query.next), [router.query.next])

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await response.json()

      if (!response.ok) {
        setMessage(result.message || 'Unable to sign in.')
        return
      }

      router.push(next)
    } catch {
      setMessage('Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login - Bow-Bow-Ties</title>
      </Head>

      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/bow_bow_ties.jpg" alt="Bow-Bow-Ties Logo" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Admin Login</h1>
              <p className="text-sm text-slate-600">Enter the shop admin password.</p>
            </div>
          </div>

          <form onSubmit={submitLogin} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
              autoComplete="current-password"
              required
            />

            {message && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-sky-200 bg-sky-100 px-4 py-2 font-semibold text-slate-900 shadow-sm transition-colors hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <Link href="/products" className="mt-5 inline-block text-sm font-semibold text-slate-600 hover:text-slate-950">
            Back to storefront
          </Link>
        </section>
      </main>
    </>
  )
}

