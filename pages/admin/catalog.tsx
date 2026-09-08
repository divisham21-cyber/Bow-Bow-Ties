import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import {
  CatalogProduct,
  CategoryContent,
  ProductCategoryId,
  catalogCategories,
  defaultCategoryContent,
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
  getInitialCategoryContent,
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
  const [statusMessage, setStatusMessage] = useState('Loading catalog...')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [catalogSource, setCatalogSource] = useState('Unsaved changes')
  const [categoryContent, setCategoryContent] = useState<CategoryContent[]>(() => getInitialCategoryContent())
  const [selectedCategoryContentId, setSelectedCategoryContentId] = useState<ProductCategoryId>('bow-ties')

  const selectedProduct = products.find((product) => product.id === selectedProductId) || products[0]
  const selectedCategoryContent =
    categoryContent.find((content) => content.categoryId === selectedCategoryContentId) ||
    defaultCategoryContent.find((content) => content.categoryId === selectedCategoryContentId) ||
    categoryContent[0]
  const visibleProducts = useMemo(() => {
    if (filter === 'all') return products
    return products.filter((product) => product.categoryId === filter)
  }, [filter, products])
  const validation = selectedProduct ? validateProduct(selectedProduct, products) : { valid: false, errors: [] }
  const activeCount = products.filter((product) => product.active).length
  const subscriptionCount = products.filter((product) => product.subscriptionEnabled).length

  useEffect(() => {
    let ignore = false

    async function loadCatalog() {
      try {
        const response = await fetch('/api/admin/catalog')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Unable to load catalog.')
        }

        if (ignore) return

        const nextProducts = result.products || []
        const nextCategoryContent = result.categoryContent || getInitialCategoryContent()
        setProducts(nextProducts)
        setCategoryContent(nextCategoryContent)
        setSelectedProductId(nextProducts[0]?.id || '')
        setCatalogSource('Saved')
        setStatusMessage('Loaded catalog.')
      } catch (error) {
        if (ignore) return

        setCatalogSource('Code seed')
        setStatusMessage(error instanceof Error ? error.message : 'Using the starter catalog.')
      }
    }

    loadCatalog()

    return () => {
      ignore = true
    }
  }, [])

  function updateSelectedProduct(nextProduct: CatalogProduct) {
    setProducts((current) =>
      current.map((product) => (product.id === nextProduct.id ? nextProduct : product))
    )
  }

  function updateSelectedCategoryContent(nextContent: CategoryContent) {
    setCategoryContent((current) =>
      current.some((content) => content.categoryId === nextContent.categoryId)
        ? current.map((content) =>
            content.categoryId === nextContent.categoryId ? nextContent : content
          )
        : [...current, nextContent]
    )
  }

  function addProduct(categoryId: ProductCategoryId = 'bow-ties') {
    const draft = createProductDraft(categoryId)
    setProducts((current) => [draft, ...current])
    setSelectedProductId(draft.id)
    setStatusMessage('Created a new product.')
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
    setStatusMessage('Duplicated product as inactive.')
  }

  function deactivateProduct(product: CatalogProduct) {
    updateSelectedProduct({ ...product, active: false, featured: false })
    setStatusMessage('Product deactivated. It stays in admin but will not show on the storefront.')
  }

  function activateProduct(product: CatalogProduct) {
    updateSelectedProduct({ ...product, active: true })
    setStatusMessage('Product activated. It will show on the storefront after saving.')
  }

  function updateCategory(product: CatalogProduct, categoryId: ProductCategoryId) {
    updateSelectedProduct(normalizeProductForCategory(product, categoryId))
  }

  function updateHeroImage(value: string) {
    if (!selectedProduct) return

    updateSelectedProduct({ ...selectedProduct, images: [value] })
  }

  async function saveCatalog() {
    setIsSaving(true)
    setStatusMessage('Saving catalog...')

    try {
      const response = await fetch('/api/admin/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createCatalogExport(products, categoryContent)),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save catalog.')
      }

      setCatalogSource('Saved')
      setStatusMessage(
        result.categoryContentSaved === false
          ? 'Catalog saved. Run the category content SQL in Supabase to save category copy edits.'
          : 'Catalog saved. Storefront will use these active products and category copy.'
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save catalog.'
      setStatusMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function uploadHeroImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !selectedProduct) return

    setIsUploadingImage(true)
    setStatusMessage('Uploading hero image...')

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const response = await fetch('/api/admin/upload-product-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selectedProduct.id,
            dataUrl: String(reader.result),
          }),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Unable to upload image.')
        }

        updateHeroImage(result.publicUrl)
        setStatusMessage('Hero image uploaded. Save when ready.')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to upload image.'
        setStatusMessage(message)
      } finally {
        setIsUploadingImage(false)
        event.target.value = ''
      }
    }
    reader.readAsDataURL(file)
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

  function updateSubscriptionPlan(
    planId: string,
    patch: Partial<NonNullable<CatalogProduct['subscriptionPlans']>[number]>
  ) {
    if (!selectedProduct?.subscriptionPlans) return

    updateSelectedProduct({
      ...selectedProduct,
      subscriptionPlans: selectedProduct.subscriptionPlans.map((plan) =>
        plan.id === planId ? { ...plan, ...patch } : plan
      ),
    })
  }

  function toggleSubscription(enabled: boolean) {
    if (!selectedProduct || selectedProduct.categoryId !== 'bow-bow-treats') return

    updateSelectedProduct({
      ...selectedProduct,
      subscriptionEnabled: enabled,
      subscriptionPlans: enabled
        ? selectedProduct.subscriptionPlans || bowBowTreatSubscriptionPlans.map((plan) => ({ ...plan }))
        : undefined,
    })
  }

  function exportCatalog() {
    downloadJson('bow-bow-ties-catalog-draft.json', createCatalogExport(products, categoryContent))
    setStatusMessage('Exported catalog JSON.')
  }

  function resetCatalog() {
    const initialProducts = getInitialAdminProducts()
    const initialCategoryContent = getInitialCategoryContent()
    setProducts(initialProducts)
    setCategoryContent(initialCategoryContent)
    setSelectedProductId(initialProducts[0]?.id || '')
    setSelectedCategoryContentId(initialCategoryContent[0]?.categoryId || 'bow-ties')
    setCatalogSource('Reset')
    setStatusMessage('Reset catalog back to the starter version. Save when ready.')
  }

  function importCatalog(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result))
        const importedProducts = readCatalogExport(String(reader.result))
        setProducts(importedProducts)
        setCategoryContent(
          Array.isArray(imported.categoryContent) ? imported.categoryContent : getInitialCategoryContent()
        )
        setSelectedProductId(importedProducts[0]?.id || '')
        setCatalogSource('Unsaved changes')
        setStatusMessage('Imported catalog JSON. Save when ready.')
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
        <meta name="description" content="Catalog admin workspace for Bow-Bow-Ties." />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <img src="/bow_bow_ties.jpg" alt="Bow-Bow-Ties Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Catalog Admin</h1>
                <p className="text-sm text-gray-600">Manage products, pricing, photos, and availability</p>
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
              <button type="button" onClick={saveCatalog} disabled={isSaving} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Save'}
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
              <p className="text-sm font-semibold text-gray-500">Active</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">{activeCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Subscriptions</p>
              <p className="mt-2 text-3xl font-bold text-secondary-700">{subscriptionCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Catalog status</p>
              <p className="mt-2 text-base font-bold text-gray-950">{catalogSource}</p>
            </div>
          </div>

          {statusMessage && (
            <div className="mt-5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-900">
              {statusMessage}
            </div>
          )}

          {selectedCategoryContent && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-950">Category storefront copy</h2>
                  <p className="text-sm text-gray-600">This text appears above each category on the products page.</p>
                </div>
                <label className="md:w-72">
                  <span className="text-sm font-semibold text-gray-700">Category</span>
                  <select
                    value={selectedCategoryContentId}
                    onChange={(event) => setSelectedCategoryContentId(event.target.value as ProductCategoryId)}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {catalogCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-700">Eyebrow</span>
                  <input
                    value={selectedCategoryContent.eyebrow}
                    onChange={(event) =>
                      updateSelectedCategoryContent({
                        ...selectedCategoryContent,
                        eyebrow: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label>
                  <span className="text-sm font-semibold text-gray-700">Title</span>
                  <input
                    value={selectedCategoryContent.title}
                    onChange={(event) =>
                      updateSelectedCategoryContent({
                        ...selectedCategoryContent,
                        title: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Summary</span>
                  <input
                    value={selectedCategoryContent.summary}
                    onChange={(event) =>
                      updateSelectedCategoryContent({
                        ...selectedCategoryContent,
                        summary: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="text-sm font-semibold text-gray-700">More text</span>
                  <textarea
                    value={selectedCategoryContent.body}
                    onChange={(event) =>
                      updateSelectedCategoryContent({
                        ...selectedCategoryContent,
                        body: event.target.value,
                      })
                    }
                    rows={4}
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
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
                            {product.active ? 'Active' : 'Inactive'}
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
                      <p className="text-sm text-gray-600">Edit details, then save when the product is ready.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => duplicateProduct(selectedProduct)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500"
                      >
                        Duplicate
                      </button>
                      {selectedProduct.active ? (
                        <button
                          type="button"
                          onClick={() => deactivateProduct(selectedProduct)}
                          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => activateProduct(selectedProduct)}
                          className="rounded-md border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-100"
                        >
                          Activate
                        </button>
                      )}
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

                    <div className="grid grid-cols-1 gap-3">
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
                    <h3 className="font-bold text-gray-950">Hero image</h3>
                    <div className="mt-4 grid grid-cols-[80px_1fr] gap-3">
                      <div className="h-20 w-20 overflow-hidden rounded-md bg-gray-100">
                        {selectedProduct.images[0] ? (
                          <img src={selectedProduct.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <label>
                        <span className="text-sm font-semibold text-gray-700">Hero image URL</span>
                        <input
                          value={selectedProduct.images[0] || ''}
                          onChange={(event) => updateHeroImage(event.target.value)}
                          placeholder="/images/example.jpeg"
                          className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                        />
                      </label>
                    </div>
                    <label className="mt-4 inline-flex cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                      {isUploadingImage ? 'Uploading...' : 'Upload Hero Image'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={uploadHeroImage}
                        disabled={isUploadingImage}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-3 text-sm text-gray-500">
                      Upload a hero image, or paste an existing image URL.
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-gray-950">Pricing</h3>
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
                        Subscriptions are limited to Bow Bow Treats. Monthly and quarterly plan prices are managed separately from the one-time product price.
                      </p>
                      <p className="mt-2 text-sm font-semibold text-amber-700">
                        After changing subscription prices, sync Stripe prices before taking orders.
                      </p>
                      {selectedProduct.subscriptionEnabled && selectedProduct.subscriptionPlans?.length ? (
                        <div className="mt-4 grid grid-cols-1 gap-3">
                          {selectedProduct.subscriptionPlans.map((plan) => (
                            <div key={plan.id} className="rounded-md border border-secondary-200 bg-secondary-50 p-3">
                              <div className="grid gap-3 md:grid-cols-[1fr_120px_120px]">
                                <label>
                                  <span className="text-xs font-bold uppercase tracking-wide text-secondary-800">Plan label</span>
                                  <input
                                    value={plan.label}
                                    onChange={(event) => updateSubscriptionPlan(plan.id, { label: event.target.value })}
                                    className="mt-1 w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm"
                                  />
                                </label>
                                <label>
                                  <span className="text-xs font-bold uppercase tracking-wide text-secondary-800">Price</span>
                                  <input
                                    value={centsToDollars(plan.priceCents || 0)}
                                    onChange={(event) =>
                                      updateSubscriptionPlan(plan.id, { priceCents: dollarsToCents(event.target.value) })
                                    }
                                    className="mt-1 w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm"
                                  />
                                </label>
                                <label>
                                  <span className="text-xs font-bold uppercase tracking-wide text-secondary-800">Every</span>
                                  <select
                                    value={plan.intervalCount}
                                    onChange={(event) =>
                                      updateSubscriptionPlan(plan.id, { intervalCount: Number(event.target.value) })
                                    }
                                    className="mt-1 w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm"
                                  >
                                    <option value={1}>1 month</option>
                                    <option value={3}>3 months</option>
                                  </select>
                                </label>
                              </div>
                              <p className="mt-2 text-xs font-semibold text-secondary-800">
                                Storefront: {formatPrice(plan.priceCents || 0)} every {plan.intervalCount === 1 ? 'month' : `${plan.intervalCount} months`}
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
                    <h3 className="font-bold text-gray-950">Ready Check</h3>
                    {validation.valid ? (
                      <p className="mt-3 rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800">
                        Ready to save.
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
                    <h3 className="font-bold text-gray-950">Backup</h3>
                    <div className="mt-4 flex flex-col gap-3">
                      <button type="button" onClick={exportCatalog} className="btn-primary">
                        Export JSON
                      </button>
                      <button type="button" onClick={saveCatalog} disabled={isSaving} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={resetCatalog}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500"
                      >
                        Reset
                      </button>
                      <label className="rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:border-primary-500">
                        Import JSON
                        <input type="file" accept="application/json" onChange={importCatalog} className="sr-only" />
                      </label>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">Import/export remains useful for backup copies.</p>
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
