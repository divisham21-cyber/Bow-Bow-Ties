import { OrderSummary } from './orders'
import { getSupabaseAdmin } from './supabaseAdmin'

interface OrderRow {
  id: string
  stripe_session_id: string
  stripe_payment_intent_id: string | null
  stripe_subscription_id: string | null
  status: OrderSummary['status']
  customer_name: string
  customer_email: string
  customer_phone: string | null
  fulfillment_method: OrderSummary['fulfillmentMethod']
  shipping_address: OrderSummary['shippingAddress']
  line_items: OrderSummary['lineItems']
  subtotal_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  currency: string
  fulfillment: OrderSummary['fulfillment'] | null
  created_at: string
}

interface SaveOrderOptions {
  preserveAdminState?: boolean
}

function rowToOrder(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id || undefined,
    stripeSubscriptionId: row.stripe_subscription_id || undefined,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone || undefined,
    fulfillmentMethod: row.fulfillment_method,
    shippingAddress: row.shipping_address,
    lineItems: row.line_items,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    currency: row.currency,
    createdAt: row.created_at,
    fulfillment: row.fulfillment || undefined,
  }
}

function orderToRow(order: OrderSummary) {
  return {
    id: order.id,
    stripe_session_id: order.stripeSessionId,
    stripe_payment_intent_id: order.stripePaymentIntentId || null,
    stripe_subscription_id: order.stripeSubscriptionId || null,
    status: order.status,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone || null,
    fulfillment_method: order.fulfillmentMethod,
    shipping_address: order.shippingAddress,
    line_items: order.lineItems,
    subtotal_cents: order.subtotalCents,
    shipping_cents: order.shippingCents,
    tax_cents: order.taxCents,
    total_cents: order.totalCents,
    currency: order.currency,
    fulfillment: order.fulfillment || null,
    created_at: order.createdAt,
  }
}

export async function saveOrderToDb(order: OrderSummary, options: SaveOrderOptions = {}) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return false

  let row = orderToRow(order)

  if (options.preserveAdminState !== false) {
    const { data: existing, error: existingError } = await supabase
      .from('orders')
      .select('status, fulfillment')
      .eq('stripe_session_id', order.stripeSessionId)
      .maybeSingle()

    if (existingError) throw existingError

    if (existing) {
      row = {
        ...row,
        status: (existing.status as OrderSummary['status']) || row.status,
        fulfillment: (existing.fulfillment as OrderSummary['fulfillment'] | null) || row.fulfillment,
      }
    }
  }

  const { error } = await supabase
    .from('orders')
    .upsert(row, { onConflict: 'stripe_session_id' })

  if (error) throw error
  return true
}

export async function getOrdersFromDb() {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return (data || []).map((row) => rowToOrder(row as OrderRow))
}
