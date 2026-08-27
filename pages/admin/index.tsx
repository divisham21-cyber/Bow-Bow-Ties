import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { requireAdminPage } from '../../lib/adminAuth'

const adminTools = [
  {
    href: '/admin/catalog',
    title: 'Catalog',
    description: 'Create products, edit category details, manage photos, validate Stripe lookup keys.',
  },
  {
    href: '/admin/orders',
    title: 'Orders',
    description: 'Review paid orders, add tracking, mark fulfillment, preview buyer shipping emails.',
  },
]

export default function AdminHome() {
  return (
    <>
      <Head>
        <title>Admin - Bow-Bow-Ties</title>
      </Head>
      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <img src="/bow_bow_ties.jpg" alt="Bow-Bow-Ties Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Admin</h1>
                <p className="text-sm text-gray-600">Placeholder tools until auth and database are connected</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/products" className="btn-primary">
                Storefront
              </Link>
              <a href="/api/admin/logout" className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:border-primary-500">
                Logout
              </a>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {adminTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="text-xl font-bold text-gray-950">{tool.title}</h2>
                <p className="mt-3 text-gray-600">{tool.description}</p>
                <span className="mt-5 inline-block text-sm font-bold text-primary-700">Open</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminPage(context)
