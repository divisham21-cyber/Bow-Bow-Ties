import Stripe from 'stripe'
import { CatalogProduct, catalogProducts, formatPrice } from './catalog'

export type OrderStatus =
  | 'paid'
  | 'needs_fulfillment'
  | 'fulfilled'
  | 'customer_notified'
  | 'canceled'
  | 'refunded'

export interface OrderLineItem {
  productId: string
  productName: string
  variantId: string
  variantName: string
  purchaseType: 'one-time' | 'subscription'
  planId?: string
  planName?: string
  quantity: number
  unitAmountCents: number
  totalAmountCents: number
}

export interface ShippingAddress {
  name?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface FulfillmentInfo {
  carrier: string
  trackingNumber: string
  trackingUrl: string
  shippedAt: string
  note: string
}

export interface PetDetails {
  petName: string
  specialDate: string
  instagramHandle: string
}

export interface OrderSummary {
  id: string
  stripeSessionId: string
  stripePaymentIntentId?: string
  stripeSubscriptionId?: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  customerPhone?: string
  fulfillmentMethod: 'ship' | 'pickup'
  shippingAddress: ShippingAddress
  lineItems: OrderLineItem[]
  subtotalCents: number
  shippingCents: number
  taxCents: number
  discountCents?: number
  totalCents: number
  currency: string
  createdAt: string
  fulfillment?: FulfillmentInfo
  petDetails?: PetDetails
  orderNote?: string
}

interface CartMetadataItem {
  p?: string
  productId: string
  productName?: string
  v?: string
  variantId: string
  t?: 'o' | 's'
  variantName?: string
  purchaseType: 'one-time' | 'subscription'
  plan?: string
  planId?: string
  planName?: string
  q?: number
  unitAmountCents?: number
  quantity: number
}

type CheckoutSessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null
    address?: Stripe.Address | null
  } | null
  payment_intent?: string | (Stripe.PaymentIntent & {
    shipping?: Stripe.PaymentIntent.Shipping | null
  }) | null
}

type InvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null
  payment_intent?: string | Stripe.PaymentIntent | null
  tax?: number | null
  total_tax_amounts?: Array<{ amount: number }>
  total_discount_amounts?: Array<{ amount: number }>
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as InvoiceWithSubscription
  const parentSubscription = invoice.parent?.subscription_details?.subscription
  return getStripeId(invoiceWithSubscription.subscription) || getStripeId(parentSubscription)
}

function normalizeCartMetadataItem(item: Partial<CartMetadataItem>): CartMetadataItem | null {
  const productId = item.productId || item.p
  const variantId = item.variantId || item.v
  const quantity = item.quantity || item.q || 1

  if (!productId || !variantId) return null

  return {
    productId,
    productName: item.productName,
    variantId,
    variantName: item.variantName,
    purchaseType: item.purchaseType || (item.t === 's' ? 'subscription' : 'one-time'),
    planId: item.planId || item.plan,
    planName: item.planName,
    quantity,
    unitAmountCents: item.unitAmountCents,
  }
}

function parseCartMetadata(metadata?: Stripe.Metadata | null) {
  const cart =
    metadata?.cart ||
    Array.from({ length: Number(metadata?.cartParts || 0) }, (_, index) => metadata?.[`cart_${index}`] || '').join('')

  if (!cart) return []

  try {
    const parsed = JSON.parse(cart) as Array<Partial<CartMetadataItem>>
    return Array.isArray(parsed)
      ? parsed.map(normalizeCartMetadataItem).filter((item): item is CartMetadataItem => Boolean(item))
      : []
  } catch {
    return []
  }
}

function getStripeId(value: string | Stripe.PaymentIntent | Stripe.Subscription | null | undefined) {
  if (!value) return undefined
  return typeof value === 'string' ? value : value.id
}

function getOrderNote(session: Stripe.Checkout.Session) {
  const orderNote = session.custom_fields?.find((field) => field.key === 'order_note')
  return orderNote?.text?.value?.trim() || undefined
}

function getAddress(session: Stripe.Checkout.Session): ShippingAddress {
  const sessionWithShipping = session as CheckoutSessionWithShipping
  const paymentIntent = typeof sessionWithShipping.payment_intent === 'string' ? null : sessionWithShipping.payment_intent
  const shipping =
    sessionWithShipping.shipping_details?.address ||
    paymentIntent?.shipping?.address ||
    session.customer_details?.address

  return {
    name:
      sessionWithShipping.shipping_details?.name ||
      paymentIntent?.shipping?.name ||
      session.customer_details?.name ||
      undefined,
    line1: shipping?.line1 || undefined,
    line2: shipping?.line2 || undefined,
    city: shipping?.city || undefined,
    state: shipping?.state || undefined,
    postalCode: shipping?.postal_code || undefined,
    country: shipping?.country || undefined,
  }
}

function getCatalogLineItem(item: CartMetadataItem, products: CatalogProduct[]): OrderLineItem | null {
  const product = products.find((candidate) => candidate.id === item.productId)
  const variant = product?.variants.find((candidate) => candidate.id === item.variantId)

  if (!product || !variant) {
    if (!item.productName || !item.variantName) return null
    const unitAmountCents = item.unitAmountCents || 0

    return {
      productId: item.productId,
      productName: item.productName,
      variantId: item.variantId,
      variantName: item.variantName,
      purchaseType: item.purchaseType,
      planId: item.planId,
      planName: item.planName,
      quantity: item.quantity,
      unitAmountCents,
      totalAmountCents: unitAmountCents * item.quantity,
    }
  }

  const plan = product.subscriptionPlans?.find((candidate) => candidate.id === item.planId)
  const unitAmountCents =
    item.purchaseType === 'subscription' && plan
      ? plan.priceCents || variant.priceCents * plan.intervalCount
      : variant.priceCents

  return {
    productId: product.id,
    productName: product.name,
    variantId: variant.id,
    variantName: variant.name,
    purchaseType: item.purchaseType,
    planId: plan?.id,
    planName: plan?.label,
    quantity: item.quantity,
    unitAmountCents,
    totalAmountCents: unitAmountCents * item.quantity,
  }
}

export function createOrderFromCheckoutSession(
  session: Stripe.Checkout.Session,
  products: CatalogProduct[] = catalogProducts
): OrderSummary {
  const sessionWithShipping = session as CheckoutSessionWithShipping
  const fulfillmentMethod = session.metadata?.fulfillmentMethod === 'pickup' ? 'pickup' : 'ship'
  const cartItems = parseCartMetadata(session.metadata)
  const lineItems = cartItems
    .map((item) => getCatalogLineItem(item, products))
    .filter((item): item is OrderLineItem => Boolean(item))
  const subtotalCents =
    session.amount_subtotal ||
    lineItems.reduce((sum, item) => sum + item.totalAmountCents, 0)
  const taxCents = session.total_details?.amount_tax || 0
  const shippingCents = session.total_details?.amount_shipping || 0
  const discountCents = session.total_details?.amount_discount || 0
  const totalCents = getOrderDueCents({
    subtotalCents,
    shippingCents,
    taxCents,
    discountCents,
    totalCents: session.amount_total || 0,
  })

  return {
    id: `order-${session.id}`,
    stripeSessionId: session.id,
    stripePaymentIntentId: getStripeId(session.payment_intent),
    stripeSubscriptionId: getStripeId(session.subscription),
    status: 'needs_fulfillment',
    customerName: session.customer_details?.name || sessionWithShipping.shipping_details?.name || 'Customer',
    customerEmail: session.customer_details?.email || '',
    customerPhone: session.customer_details?.phone || undefined,
    fulfillmentMethod,
    shippingAddress: getAddress(session),
    lineItems,
    subtotalCents,
    shippingCents,
    taxCents,
    discountCents,
    totalCents,
    currency: (session.currency || 'usd').toUpperCase(),
    createdAt: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    orderNote: getOrderNote(session),
  }
}

export function createRenewalOrderFromInvoice(
  invoice: Stripe.Invoice,
  sourceOrder: OrderSummary
): OrderSummary {
  const invoiceWithSubscription = invoice as InvoiceWithSubscription
  const taxCents =
    invoiceWithSubscription.total_tax_amounts?.reduce((sum, taxAmount) => sum + taxAmount.amount, 0) ||
    invoiceWithSubscription.tax ||
    0
  const discountCents =
    invoiceWithSubscription.total_discount_amounts?.reduce(
      (sum, discountAmount) => sum + discountAmount.amount,
      0
    ) || 0
  const createdAt = new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000).toISOString()

  return {
    ...sourceOrder,
    id: `order-${invoice.id}`,
    stripeSessionId: `invoice:${invoice.id}`,
    stripePaymentIntentId: getStripeId(invoiceWithSubscription.payment_intent),
    stripeSubscriptionId: getInvoiceSubscriptionId(invoice) || sourceOrder.stripeSubscriptionId,
    status: 'needs_fulfillment',
    customerName: invoice.customer_name || sourceOrder.customerName,
    customerEmail: invoice.customer_email || sourceOrder.customerEmail,
    customerPhone: invoice.customer_phone || sourceOrder.customerPhone,
    subtotalCents: invoice.subtotal || sourceOrder.subtotalCents,
    shippingCents: (invoice as { amount_shipping?: number | null }).amount_shipping || sourceOrder.shippingCents,
    taxCents,
    discountCents,
    totalCents: invoice.amount_paid || invoice.total || sourceOrder.totalCents,
    currency: (invoice.currency || sourceOrder.currency || 'usd').toUpperCase(),
    createdAt,
    fulfillment: undefined,
    petDetails: sourceOrder.petDetails,
    orderNote: sourceOrder.orderNote,
  }
}

export function formatShippingAddress(address: ShippingAddress) {
  return [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    address.country,
  ]
    .filter(Boolean)
    .join('\n')
}

export function getOrderTotalLabel(order: OrderSummary) {
  return `${formatPrice(getOrderDueCents(order))} ${order.currency}`
}

export function getOrderDiscountCents(order: OrderSummary) {
  if (order.discountCents) return order.discountCents

  const totalBeforeDiscount = order.subtotalCents + order.shippingCents + order.taxCents
  if (order.taxCents > 0 && order.totalCents === order.subtotalCents + order.shippingCents) {
    return 0
  }

  if (order.totalCents > 0 && order.totalCents < totalBeforeDiscount) {
    return totalBeforeDiscount - order.totalCents
  }

  return 0
}

export function getOrderDueCents(
  order: Pick<OrderSummary, 'subtotalCents' | 'shippingCents' | 'taxCents' | 'totalCents' | 'discountCents'>
) {
  const discountCents = getOrderDiscountCents(order as OrderSummary)
  return Math.max(order.subtotalCents + order.shippingCents + order.taxCents - discountCents, 0)
}

export function getCustomerOrderNumber(order: Pick<OrderSummary, 'stripeSessionId' | 'createdAt'>) {
  const date = new Date(order.createdAt)
  const datePart = Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10).replace(/-/g, '')
    : date.toISOString().slice(0, 10).replace(/-/g, '')
  const reference = order.stripeSessionId
    .replace(/[^a-z0-9]/gi, '')
    .slice(-4)
    .toUpperCase()

  return `BBT-${datePart}-${reference || 'ORDER'}`
}

export function getPlaceholderOrders(): OrderSummary[] {
  return [
    {
      id: 'order-placeholder-1001',
      stripeSessionId: 'cs_test_placeholder_1001',
      status: 'needs_fulfillment',
      customerName: 'Sample Buyer',
      customerEmail: 'buyer@example.com',
      customerPhone: '(555) 010-1001',
      fulfillmentMethod: 'ship',
      shippingAddress: {
        name: 'Sample Buyer',
        line1: '123 Market Street',
        city: 'Bothell',
        state: 'WA',
        postalCode: '98011',
        country: 'US',
      },
      lineItems: [
        {
          productId: 'fall-bow-ties',
          productName: 'Fall Print Bow Ties',
          variantId: 'small',
          variantName: 'Small',
          purchaseType: 'one-time',
          quantity: 2,
          unitAmountCents: 999,
          totalAmountCents: 1998,
        },
      ],
      subtotalCents: 1998,
      shippingCents: 499,
      taxCents: 0,
      totalCents: 2497,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'order-placeholder-1002',
      stripeSessionId: 'cs_test_placeholder_1002',
      stripeSubscriptionId: 'sub_placeholder_1002',
      status: 'paid',
      customerName: 'Treat Subscriber',
      customerEmail: 'subscriber@example.com',
      fulfillmentMethod: 'pickup',
      shippingAddress: {
        name: 'Treat Subscriber',
      },
      lineItems: [
        {
          productId: 'bow-bow-treat-box',
          productName: 'Bow Bow Treat Box',
          variantId: 'standard',
          variantName: 'Standard',
          purchaseType: 'subscription',
          planId: 'monthly',
          planName: 'Monthly treat box',
          quantity: 1,
          unitAmountCents: 1199,
          totalAmountCents: 1199,
        },
      ],
      subtotalCents: 1199,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 1199,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    },
  ]
}
