import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { buildShippingConfirmationEmail } from '../../lib/email'
import { requireAdminPage } from '../../lib/adminAuth'
import {
  FulfillmentInfo,
  OrderStatus,
  OrderSummary,
  formatShippingAddress,
  getCustomerOrderNumber,
  getOrderDiscountCents,
  getOrderTotalLabel,
} from '../../lib/orders'
import { formatPrice } from '../../lib/catalog'

const statusLabels: Record<OrderStatus, string> = {
  paid: 'Paid',
  needs_fulfillment: 'Needs fulfillment',
  fulfilled: 'Fulfilled',
  customer_notified: 'Customer notified',
  canceled: 'Canceled',
  refunded: 'Refunded',
}

const emptyFulfillment: FulfillmentInfo = {
  carrier: '',
  trackingNumber: '',
  trackingUrl: '',
  shippedAt: new Date().toISOString().slice(0, 10),
  note: '',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [fulfillmentDraft, setFulfillmentDraft] = useState<FulfillmentInfo>(emptyFulfillment)
  const [emailPreview, setEmailPreview] = useState('')
  const [statusMessage, setStatusMessage] = useState('Loading paid Stripe checkout orders...')
  const [orderAction, setOrderAction] = useState<'refund' | 'cancel' | null>(null)
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || orders[0]
  const isSavingSelectedOrder = selectedOrder ? savingOrderId === selectedOrder.id : false
  const selectedOrderIsFulfilled = selectedOrder
    ? ['fulfilled', 'customer_notified'].includes(selectedOrder.status)
    : false
  const selectedOrderIsNotified = selectedOrder?.status === 'customer_notified'
  const fulfillmentQueue = orders.filter((order) =>
    ['paid', 'needs_fulfillment'].includes(order.status)
  ).length
  const fulfilledCount = orders.filter((order) =>
    ['fulfilled', 'customer_notified'].includes(order.status)
  ).length

  const selectedEmail = useMemo(() => {
    if (!selectedOrder) return null
    return buildShippingConfirmationEmail(selectedOrder, fulfillmentDraft)
  }, [fulfillmentDraft, selectedOrder])

  async function loadStripeOrders() {
    setStatusMessage('Loading paid Stripe checkout orders...')

    try {
      const response = await fetch('/api/admin/orders')
      const result = await response.json()

      if (!response.ok) {
        setStatusMessage(result.message || 'Unable to load Stripe orders.')
        return
      }

      const loadedOrders = (result.orders || []) as OrderSummary[]
      const nextOrders = loadedOrders
      setOrders(nextOrders)
      setSelectedOrderId((current) =>
        nextOrders.some((order) => order.id === current) ? current : nextOrders[0]?.id || ''
      )
      setFulfillmentDraft(nextOrders[0]?.fulfillment || emptyFulfillment)
      setEmailPreview('')
      setStatusMessage(
        nextOrders.length
          ? `Loaded ${nextOrders.length} paid order${nextOrders.length === 1 ? '' : 's'}.`
          : 'No paid orders found yet.'
      )
    } catch {
      setStatusMessage('Unable to load Stripe orders. Please try again.')
    }
  }

  useEffect(() => {
    loadStripeOrders()
  }, [])

  function selectOrder(order: OrderSummary) {
    setSelectedOrderId(order.id)
    setFulfillmentDraft(order.fulfillment || emptyFulfillment)
    setEmailPreview('')
  }

  async function saveOrder(nextOrder: OrderSummary, successMessage = 'Order saved.') {
    setSavingOrderId(nextOrder.id)
    setStatusMessage('Saving order...')

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: nextOrder }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save order.')
      }

      setStatusMessage(successMessage)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save order.'
      setStatusMessage(`${message} Local copy was still updated.`)
      return false
    } finally {
      setSavingOrderId(null)
    }
  }

  async function updateOrder(nextOrder: OrderSummary, successMessage?: string) {
    setOrders((current) => current.map((order) => (order.id === nextOrder.id ? nextOrder : order)))
    await saveOrder(nextOrder, successMessage)
  }

  async function runOrderAction(action: 'refund' | 'cancel') {
    if (!selectedOrder) return

    const prompt =
      action === 'refund'
        ? `Refund payment for ${selectedOrder.customerName}?`
        : selectedOrder.stripeSubscriptionId
          ? `Cancel subscription for ${selectedOrder.customerName}?`
          : `Cancel order for ${selectedOrder.customerName}? This will not refund payment.`

    if (!window.confirm(prompt)) return

    setOrderAction(action)
    setStatusMessage(action === 'refund' ? 'Creating Stripe refund...' : 'Canceling order...')

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, order: selectedOrder }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to update order.')
      }

      setOrders((current) => current.map((order) => (order.id === result.order.id ? result.order : order)))
      setStatusMessage(result.message || (action === 'refund' ? 'Payment refunded.' : 'Order canceled.'))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update order.'
      setStatusMessage(message)
    } finally {
      setOrderAction(null)
    }
  }

  async function updateStatus(status: OrderStatus) {
    if (!selectedOrder) return

    await updateOrder({ ...selectedOrder, status }, `Updated ${selectedOrder.id} to ${statusLabels[status]}.`)
  }

  async function markFulfilled() {
    if (!selectedOrder) return

    await updateOrder(
      {
        ...selectedOrder,
        status: 'fulfilled',
        fulfillment: fulfillmentDraft,
      },
      'Fulfillment saved and order marked fulfilled.'
    )
  }

  async function saveFulfillment() {
    if (!selectedOrder) return

    await updateOrder(
      {
        ...selectedOrder,
        fulfillment: fulfillmentDraft,
      },
      'Fulfillment details saved.'
    )
  }

  function previewShippingEmail() {
    if (!selectedEmail) {
      setEmailPreview('Customer email is missing, so no shipping email can be sent.')
      return
    }

    setEmailPreview(`To: ${selectedEmail.to}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.text}`)
    setStatusMessage('Shipping email preview generated.')
  }

  async function markCustomerNotified() {
    if (!selectedOrder) return

    await updateOrder(
      {
        ...selectedOrder,
        status: 'customer_notified',
        fulfillment: fulfillmentDraft,
      },
      'Customer notification preview generated and order marked notified.'
    )
    previewShippingEmail()
  }

  function resetOrders() {
    setOrders([])
    setSelectedOrderId('')
    setFulfillmentDraft(emptyFulfillment)
    setEmailPreview('')
    setStatusMessage('Cleared the local view. Refresh orders to reload paid orders.')
  }

  return (
    <>
      <Head>
        <title>Orders Admin - Bow-Bow-Ties</title>
        <meta name="description" content="Order fulfillment workspace for Bow-Bow-Ties." />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <img src="/bow_bow_ties.jpg" alt="Bow-Bow-Ties Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Orders Admin</h1>
                <p className="text-sm text-gray-600">Fulfillment and customer shipping updates</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-3">
              <Link href="/admin/catalog" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Catalog
              </Link>
              <button type="button" onClick={resetOrders} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Clear Local Edits
              </button>
              <button type="button" onClick={loadStripeOrders} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Refresh Orders
              </button>
              <Link href="/products" className="btn-primary">
                Storefront
              </Link>
              <a href="/api/admin/logout" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500">
                Logout
              </a>
            </nav>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-950">{orders.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">To fulfill</p>
              <p className="mt-2 text-3xl font-bold text-secondary-700">{fulfillmentQueue}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Fulfilled</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">{fulfilledCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-500">Email</p>
              <p className="mt-2 text-base font-bold text-gray-950">Preview mode</p>
            </div>
          </div>

          {statusMessage && (
            <div className="mt-5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-900">
              {statusMessage}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-4">
                <h2 className="font-bold text-gray-950">Order queue</h2>
                <p className="mt-1 text-sm text-gray-600">Paid orders, newest first.</p>
              </div>
              <div className="max-h-[720px] overflow-y-auto">
                {orders.length ? orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => selectOrder(order)}
                    className={`block w-full border-b border-gray-100 px-4 py-4 text-left transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-primary-50' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-gray-950">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail || 'No email'}</p>
                        <p className="mt-1 text-xs font-bold text-primary-700">{getCustomerOrderNumber(order)}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">{order.stripeSessionId}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </button>
                )) : (
                  <p className="p-4 text-sm text-gray-600">No paid orders loaded.</p>
                )}
              </div>
            </aside>

            {selectedOrder ? (
              <section className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
                        Customer order {getCustomerOrderNumber(selectedOrder)}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-gray-950">{selectedOrder.customerName}</h2>
                      <p className="mt-1 text-gray-600">{selectedOrder.customerEmail || 'No buyer email on order'}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedOrder.customerPhone ? `Phone: ${selectedOrder.customerPhone}` : 'No buyer phone on order'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-2 break-all text-xs font-semibold text-gray-500">
                        Stripe session: {selectedOrder.stripeSessionId}
                      </p>
                      <p className="mt-3 inline-block rounded-full bg-secondary-100 px-3 py-1 text-sm font-bold text-secondary-800">
                        {selectedOrder.fulfillmentMethod === 'pickup' ? 'Pick up order' : 'Ship order'}
                      </p>
                      <p
                        className={`ml-2 mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold ${
                          selectedOrderIsNotified
                            ? 'bg-green-100 text-green-800'
                            : selectedOrderIsFulfilled
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedOrderIsNotified
                          ? 'Customer notified'
                          : selectedOrderIsFulfilled
                            ? 'Fulfilled'
                            : 'Needs fulfillment'}
                      </p>
                      {selectedOrder.petDetails && (
                        <div className="mt-4 rounded-md border border-sky-100 bg-sky-50 p-3 text-sm text-slate-700">
                          <p className="font-bold text-slate-950">Pet details</p>
                          <div className="mt-2 grid gap-1">
                            <p>Pet name: {selectedOrder.petDetails.petName || 'Not provided'}</p>
                            <p>Birthday/gotcha day: {selectedOrder.petDetails.specialDate || 'Not provided'}</p>
                            <p>Instagram: {selectedOrder.petDetails.instagramHandle || 'Not provided'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <label className="text-sm font-semibold text-gray-700" htmlFor="order-status">
                        Status
                      </label>
                      <select
                        id="order-status"
                        value={selectedOrder.status}
                        onChange={(event) => updateStatus(event.target.value as OrderStatus)}
                        disabled={isSavingSelectedOrder}
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        {Object.entries(statusLabels).map(([status, label]) => (
                          <option key={status} value={status}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-3 text-2xl font-bold text-primary-700">{getOrderTotalLabel(selectedOrder)}</p>
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => runOrderAction('refund')}
                          disabled={orderAction !== null || isSavingSelectedOrder || selectedOrder.status === 'refunded'}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {orderAction === 'refund' ? 'Refunding...' : 'Refund payment'}
                        </button>
                        <button
                          type="button"
                          onClick={() => runOrderAction('cancel')}
                          disabled={orderAction !== null || isSavingSelectedOrder || selectedOrder.status === 'canceled'}
                          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {orderAction === 'cancel' ? 'Canceling...' : 'Cancel order'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-gray-950">Items</h3>
                    <div className="mt-4 space-y-3">
                      {selectedOrder.lineItems.map((item) => (
                        <div key={`${item.productId}-${item.variantId}-${item.planId || 'single'}`} className="rounded-md border border-gray-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-950">{item.productName}</p>
                              <p className="text-sm text-gray-600">
                                {item.variantName}
                                {item.planName ? `, ${item.planName}` : ''}
                              </p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {item.purchaseType === 'subscription' ? 'Subscription' : 'One-time'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-950">x {item.quantity}</p>
                              <p className="text-sm font-semibold text-primary-700">{formatPrice(item.totalAmountCents)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotalCents)}</span></div>
                      <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(selectedOrder.shippingCents)}</span></div>
                      <div className="flex justify-between"><span>Tax</span><span>{formatPrice(selectedOrder.taxCents)}</span></div>
                      {getOrderDiscountCents(selectedOrder) > 0 && (
                        <div className="flex justify-between font-semibold text-emerald-700">
                          <span>Discount</span>
                          <span>-{formatPrice(getOrderDiscountCents(selectedOrder))}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold"><span>Total</span><span>{getOrderTotalLabel(selectedOrder)}</span></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-gray-950">
                      {selectedOrder.fulfillmentMethod === 'pickup' ? 'Pickup details' : 'Shipping address'}
                    </h3>
                    <pre className="mt-4 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-700">
                      {selectedOrder.fulfillmentMethod === 'pickup'
                        ? 'No shipping address required. Coordinate pickup after payment.'
                        : formatShippingAddress(selectedOrder.shippingAddress) || 'No shipping address available.'}
                    </pre>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold text-gray-950">Fulfillment</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedOrderIsNotified
                          ? 'This order is fulfilled and the customer notification has been prepared.'
                          : selectedOrderIsFulfilled
                            ? 'This order is marked fulfilled.'
                            : 'Add fulfillment details, then mark the order fulfilled.'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-bold ${
                        selectedOrderIsNotified
                          ? 'bg-green-100 text-green-800'
                          : selectedOrderIsFulfilled
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {statusLabels[selectedOrder.status]}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label>
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedOrder.fulfillmentMethod === 'pickup' ? 'Pickup contact/method' : 'Carrier'}
                      </span>
                      <input
                        value={fulfillmentDraft.carrier}
                        onChange={(event) => setFulfillmentDraft({ ...fulfillmentDraft, carrier: event.target.value })}
                        placeholder={selectedOrder.fulfillmentMethod === 'pickup' ? 'Text or email' : 'USPS'}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedOrder.fulfillmentMethod === 'pickup' ? 'Pickup reference' : 'Tracking number'}
                      </span>
                      <input
                        value={fulfillmentDraft.trackingNumber}
                        onChange={(event) => setFulfillmentDraft({ ...fulfillmentDraft, trackingNumber: event.target.value })}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedOrder.fulfillmentMethod === 'pickup' ? 'Pickup info URL' : 'Tracking URL'}
                      </span>
                      <input
                        value={fulfillmentDraft.trackingUrl}
                        onChange={(event) => setFulfillmentDraft({ ...fulfillmentDraft, trackingUrl: event.target.value })}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedOrder.fulfillmentMethod === 'pickup' ? 'Ready date' : 'Shipped date'}
                      </span>
                      <input
                        type="date"
                        value={fulfillmentDraft.shippedAt}
                        onChange={(event) => setFulfillmentDraft({ ...fulfillmentDraft, shippedAt: event.target.value })}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="md:col-span-2">
                      <span className="text-sm font-semibold text-gray-700">Seller note</span>
                      <textarea
                        value={fulfillmentDraft.note}
                        onChange={(event) => setFulfillmentDraft({ ...fulfillmentDraft, note: event.target.value })}
                        rows={3}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={saveFulfillment}
                      disabled={isSavingSelectedOrder}
                      className="rounded-md border border-primary-600 bg-white px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSavingSelectedOrder ? 'Saving...' : 'Save Fulfillment'}
                    </button>
                    <button
                      type="button"
                      onClick={markFulfilled}
                      disabled={isSavingSelectedOrder || selectedOrderIsFulfilled}
                      className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selectedOrderIsFulfilled ? 'Fulfilled' : 'Mark Fulfilled'}
                    </button>
                    <button type="button" onClick={previewShippingEmail} className="rounded-md border border-primary-600 bg-white px-4 py-2 font-semibold text-primary-700 hover:bg-primary-50">
                      Preview Customer Email
                    </button>
                    <button
                      type="button"
                      onClick={markCustomerNotified}
                      disabled={isSavingSelectedOrder || selectedOrderIsNotified}
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selectedOrderIsNotified ? 'Customer Notified' : 'Mark Customer Notified'}
                    </button>
                  </div>
                </div>

                {emailPreview && (
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-gray-950">Email preview</h3>
                    <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-gray-950 p-4 text-sm text-white">
                      {emailPreview}
                    </pre>
                  </div>
                )}
              </section>
            ) : (
              <section className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <h2 className="text-xl font-bold text-gray-950">No orders yet</h2>
                <p className="mt-2 text-gray-600">Paid orders will appear here after checkout.</p>
              </section>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminPage(context)
