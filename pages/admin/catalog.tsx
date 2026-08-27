import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import {
  CatalogProduct,
  ProductCategoryId,
  catalogCategories,
  formatPrice,
  getOneTimePriceLookupKey,
  getSubscriptionPriceLookupKey,
} from '../../lib/catalog'
import {
  bowBowTreatSubscriptionPlans,
  centsToDollars,
  createCatalogExport,
  createProductDraft,
  dollarsToCents,
  getInitialAdminProducts,
  normalizeProductForCategory,
  readCatalogExport,
  slugify,
  validateProduct,
} from '../../lib/adminCatalog'
import { requireAdminPage } from '../../lib/adminAuth'

type AdminFilter = 'all' | ProductCategoryId

const categoryNames = Object.fromEntries(
  catalogCategories.map((category) => [category.id, category.name])
) as Record<ProductCategoryId, string>
const storageKey = 'bow-bow-ties-admin-catalog-v3'

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>(() => getInitialAdminProducts())
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')
  const [filter, setFilter] = useState<AdminFilter>('all')
  const [statusMessage, setStatusMessage] = useState('Placeholder admin workspace. Changes live in this browser session until a database is connected.')

  const selectedProduct = products.find((product) => product.id === selectedProductId) || products[0]
  const visibleProducts = useMemo(() => {
    if (filter === 'all') return products
    return products.filter((product) => product.categoryId === filter)
  }, [filter, products])
  const validation = selectedProduct ? validateProduct(selectedProduct, products) : { valid: false, errors: [] }
  const activeCount = products.filter((product) => product.active).length
  const subscriptionCount = products.filter((product) => product.subscriptionEnabled).length

  useEffect(() => {
    const savedCatalog = window.localStorage.getItem(storageKey)
    if (!savedCatalog) return

    try {
      const importedProducts = readCatalogExport(savedCatalog)
      setProducts(importedProducts)
      setSelectedProductId(importedProducts[0]?.id || '')
      setStatusMessage('Restored catalog draft from this browser.')
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(createCatalogExport(products)))
  }, [products])

  function updateSelectedProduct(nextProduct: CatalogProduct) {
    setProducts((current) =>
      current.map((product) => (product.id === nextProduct.id ? nextProduct : product))
    )
  }

  function addProduct(categoryId: ProductCategoryId = 'bow-ties') {
    const draft = createProductDraft(categoryId)
    setProducts((current) => [draft, ...current])
    setSelectedProductId(draft.id)
    setStatusMessage('Created a new draft product.')
  }

  function duplicateProduct(product: CatalogProduct) {
    const duplicateName = `${product.name} Copy`
    const duplicate = {
      ...product,
      id: `draft-${Date.now()}`,
      name: duplicateName,
      slug: slugify(duplicateName),
      active: false,
      featured: false,
    }

    setProducts((current) => [duplicate, ...current])
    setSelectedProductId(duplicate.id)
    setStatusMessage('Duplicated product as an unpublished draft.')
  }

  function deactivateProduct(product: CatalogProduct) {
    updateSelectedProduct({ ...product, active: false, featured: false })
    setStatusMessage('Product deactivated. It stays in admin but will not show on the storefront.')
  }

  function updateCategory(product: CatalogProduct, categoryId: ProductCategoryId) {
    updateSelectedProduct(normalizeProductForCategory(product, categoryId))
  }

  function updateImage(index: number, value: string) {
    if (!selectedProduct) return

    const nextImages = [...selectedProduct.images]
    nextImages[index] = value
    updateSelectedProduct({ ...selectedProduct, images: nextImages.slice(0, 5) })
  }

  function addImageSlot() {
    if (!selectedProduct || selectedProduct.images.length >= 5) return

    updateSelectedProduct({ ...selectedProduct, images: [...selectedProduct.images, ''] })
  }

  function removeImageSlot(index: number) {
    if (!selectedProduct) return

    const nextImages = selectedProduct.images.filter((_, imageIndex) => imageIndex !== index)
    updateSelectedProduct({ ...selectedProduct, images: nextImages.length ? nextImages : [''] })
  }

  function updateVariantPrice(variantId: string, value: string) {
    if (!selectedProduct) return

    updateSelectedProduct({
      ...selectedProduct,
      variants: selectedProduct.variants.map((variant) =>
        variant.id === variantId ? { ...variant, priceCents: dollarsToCents(value) } : variant
      ),
    })
  }

  function toggleSubscription(enabled: boolean) {
    if (!selectedProduct || selectedProduct.categoryId !== 'bow-bow-treats') return

    updateSelectedProduct({
      ...selectedProduct,
      subscriptionEnabled: enabled,
      subscriptionPlans: enabled ? bowBowTreatSubscriptionPlans : undefined,
    })
  }

  function exportCatalog() {
    downloadJson('bow-bow-ties-catalog-draft.json', createCatalogExport(products))
    setStatusMessage('Exported catalog JSON draft.')
  }

  function resetCatalog() {
    const initialProducts = getInitialAdminProducts()
    setProducts(initialProducts)
    setSelectedProductId(initialProducts[0]?.id || '')
    window.localStorage.removeItem(storageKey)
    setStatusMessage('Reset placeholder catalog back to the code seed.')
  }

  function importCatalog(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const importedProducts = readCatalogExport(String(reader.result))
        setProducts(importedProducts)
        setSelectedProductId(importedProducts[0]?.id || '')
        setStatusMessage('Imported catalog JSON into this placeholder workspace.')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to import catalog JSON.'
        setStatusMessage(message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <Head>
        <title>Catalog Admin - Bow-Bow-Ties</title>
        <meta name="description" content="Placeholder catalog admin workspace for Bow-Bow-Ties." />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <img src="/bow_bow_ties.jpg" alt="Bow-Bow-Ties Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Catalog Admin</h1>
                <p className="text-sm text-gray-600">Placeholder workspace for marketer catalog edits</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-3">
              <Link href="/admin/orders" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Orders
              </Link>
              <Link href="/products" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Storefront
              </Link>
              <a href="/api/admin/logout" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Logout
              </a>
              <button type="button" onClick={() => addProduct()} className="btn-primary">
                New Product
              </button>
            </nav>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Products</p>
              <p className="mt-2 text-3xl font-bold text-gray-950">{products.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Published</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">{activeCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Subscriptions</p>
              <p className="mt-2 text-3xl font-bold text-secondary-700">{subscriptionCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Storage</p>
              <p className="mt-2 text-base font-bold text-gray-950">Browser session</p>
            </div>
          </div>

          {statusMessage && (
            <div className="mt-5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-900">
              {statusMessage}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
            <aside className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-4">
                <label className="text-sm font-semibold text-gray-700" htmlFor="catalog-filter">
                  Category filter
                </label>
                <select
                  id="catalog-filter"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as AdminFilter)}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All categories</option>
                  {catalogCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-[760px] overflow-y-auto">
                {visibleProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProductId(product.id)}
                    className={`block w-full border-b border-gray-100 px-4 py-4 text-left transition-colors ${
                      selectedProduct?.id === product.id ? 'bg-primary-50' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-gray-950">{product.name}</p>
                        <p className="text-sm text-gray-600">{categoryNames[product.categoryId]}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${product.active ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'}`}>
                            {product.active ? 'Published' : 'Draft'}
                          </span>
                          {product.subscriptionEnabled && (
                            <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-800">
                              Subscription
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {selectedProduct ? (
              <section className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-950">Product editor</h2>
                      <p className="text-sm text-gray-600">Fields here mirror the future catalog database shape.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => duplicateProduct(selectedProduct)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => deactivateProduct(selectedProduct)}
                        className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-700">Product name</span>
                      <input
                        value={selectedProduct.name}
                        onChange={(event) =>
                          updateSelectedProduct({
                            ...selectedProduct,
                            name: event.target.value,
                            slug: slugify(event.target.value),
                          })
                        }
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-gray-700">Slug</span>
                      <input
                        value={selectedProduct.slug}
                        onChange={(event) => updateSelectedProduct({ ...selectedProduct, slug: slugify(event.target.value) })}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-gray-700">Category</span>
                      <select
                        value={selectedProduct.categoryId}
                        onChange={(event) => updateCategory(selectedProduct, event.target.value as ProductCategoryId)}
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        {catalogCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedProduct.active}
                          onChange={(event) => updateSelectedProduct({ ...selectedProduct, active: event.target.checked })}
                        />
                        <span className="text-sm font-semibold text-gray-700">Published</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedProduct.featured)}
                          onChange={(event) => updateSelectedProduct({ ...selectedProduct, featured: event.target.checked })}
                        />
                        <span className="text-sm font-semibold text-gray-700">Featured</span>
                      </label>
                    </div>

                    <label className="block md:col-span-2">
                      <span className="text-sm font-semibold text-gray-700">Short description</span>
                      <input
                        value={selectedProduct.shortDescription}
                        onChange={(event) => updateSelectedProduct({ ...selectedProduct, shortDescription: event.target.value })}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-sm font-semibold text-gray-700">Full description</span>
                      <textarea
                        value={selectedProduct.description}
                        onChange={(event) => updateSelectedProduct({ ...selectedProduct, description: event.target.value })}
                        rows={4}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-950">Photos</h3>
                      <button
                        type="button"
                        onClick={addImageSlot}
                        disabled={selectedProduct.images.length >= 5}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add Photo Slot
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {selectedProduct.images.map((image, index) => (
                        <div key={`${selectedProduct.id}-image-${index}`} className="grid grid-cols-[64px_1fr_auto] gap-3">
                          <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                            {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
                          </div>
                          <input
                            value={image}
                            onChange={(event) => updateImage(index, event.target.value)}
                            placeholder="/images/example.jpeg"
                            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageSlot(index)}
                            className="h-10 rounded-md border border-gray-300 px-3 text-sm font-semibold text-gray-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      For now, paste an external image URL or add a file to public/images and use /images/file-name.jpg.
                      Supabase Storage can replace these text fields later.
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-gray-950">Pricing and Stripe lookup keys</h3>
                    <div className="mt-4 space-y-4">
                      {selectedProduct.variants.map((variant) => (
                        <div key={variant.id} className="rounded-md border border-gray-200 p-3">
                          <div className="grid grid-cols-[1fr_140px] gap-3">
                            <div>
                              <p className="font-semibold text-gray-950">{variant.name}</p>
                              <p className="break-all text-xs text-gray-500">
                                {getOneTimePriceLookupKey(selectedProduct.id, variant.id)}
                              </p>
                            </div>
                            <label>
                              <span className="sr-only">Price for {variant.name}</span>
                              <input
                                value={centsToDollars(variant.priceCents)}
                                onChange={(event) => updateVariantPrice(variant.id, event.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                              />
                            </label>
                          </div>

                          {selectedProduct.subscriptionEnabled &&
                            selectedProduct.subscriptionPlans?.map((plan) => (
                              <p key={plan.id} className="mt-2 break-all text-xs text-secondary-800">
                                {getSubscriptionPriceLookupKey(selectedProduct.id, variant.id, plan.id)}
                              </p>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="grid gap-5 md:grid-cols-[1fr_280px]">
                    <div>
                      <h3 className="font-bold text-gray-950">Subscription rules</h3>
                      <p className="mt-2 text-sm text-gray-600">
                        Subscriptions are limited to Bow Bow Treats. Monthly and quarterly plans are generated from the selected product price.
                      </p>
                      {selectedProduct.subscriptionEnabled && selectedProduct.subscriptionPlans?.length ? (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {selectedProduct.subscriptionPlans.map((plan) => (
                            <div key={plan.id} className="rounded-md border border-secondary-200 bg-secondary-50 p-3">
                              <p className="font-semibold text-secondary-900">{plan.label}</p>
                              <p className="text-sm text-secondary-800">
                                Every {plan.intervalCount === 1 ? 'month' : `${plan.intervalCount} months`}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <label className="flex items-center justify-between gap-4 rounded-md border border-gray-200 px-4 py-3">
                      <span>
                        <span className="block text-sm font-bold text-gray-950">Enable subscription</span>
                        <span className="block text-xs text-gray-500">Only available for Bow Bow Treats</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedProduct.subscriptionEnabled}
                        disabled={selectedProduct.categoryId !== 'bow-bow-treats'}
                        onChange={(event) => toggleSubscription(event.target.checked)}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-gray-950">Validation</h3>
                    {validation.valid ? (
                      <p className="mt-3 rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800">
                        Ready to publish when a real database is connected.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {validation.errors.map((error) => (
                          <li key={error} className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                            {error}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-gray-950">Draft exchange</h3>
                    <div className="mt-4 flex flex-col gap-3">
                      <button type="button" onClick={exportCatalog} className="btn-primary">
                        Export JSON
                      </button>
                      <button
                        type="button"
                        onClick={resetCatalog}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500"
                      >
                        Reset Draft
                      </button>
                      <label className="rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:border-primary-500">
                        Import JSON
                        <input type="file" accept="application/json" onChange={importCatalog} className="sr-only" />
                      </label>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">Use exports as seed data until Supabase stores catalog changes.</p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <h3 className="font-bold text-gray-950">Storefront preview</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                      {selectedProduct.images[0] ? (
                        <img src={selectedProduct.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
                        {categoryNames[selectedProduct.categoryId]}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-gray-950">{selectedProduct.name}</h3>
                      <p className="mt-3 text-gray-700">{selectedProduct.shortDescription}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {selectedProduct.variants.map((variant) => (
                          <span key={variant.id} className="rounded-full border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700">
                            {variant.name}: {formatPrice(variant.priceCents)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <h2 className="text-xl font-bold text-gray-950">No products yet</h2>
                <button type="button" onClick={() => addProduct()} className="btn-primary mt-4">
                  Create Product
                </button>
              </section>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminPage(context)
