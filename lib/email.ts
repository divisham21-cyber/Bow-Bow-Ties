import {
  FulfillmentInfo,
  OrderSummary,
  formatShippingAddress,
  getCustomerOrderNumber,
  getOrderDiscountCents,
  getOrderTotalLabel,
} from './orders'
import { formatPrice } from './catalog'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  replyTo?: string
}

const sellerEmail = process.env.SELLER_ORDER_EMAIL || 'contact@bowbowties.us'
const fromEmail = process.env.ORDER_FROM_EMAIL || 'contact@bowbowties.us'
const replyToEmail = process.env.ORDER_REPLY_TO_EMAIL || sellerEmail
const resendApiKey = process.env.RESEND_API_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://bowbowties.us'

function getLineItemsText(order: OrderSummary) {
  return order.lineItems
    .map((item) => {
      const plan = item.planName ? `, ${item.planName}` : ''
      return `- ${item.productName} (${item.variantName}${plan}) x ${item.quantity}: ${formatPrice(item.totalAmountCents)}`
    })
    .join('\n')
}

export function buildBuyerOrderEmail(order: OrderSummary): EmailMessage | null {
  if (!order.customerEmail) return null
  const customerOrderNumber = getCustomerOrderNumber(order)
  const hasSubscription = order.lineItems.some((item) => item.purchaseType === 'subscription')
  const isRenewalOrder = order.stripeSessionId.startsWith('invoice:')

  return {
    to: order.customerEmail,
    subject: isRenewalOrder
      ? `[Bow-Bow-Ties Order ${customerOrderNumber}] Subscription renewal received`
      : `[Bow-Bow-Ties Order ${customerOrderNumber}] Order received`,
    text: [
      `Hi ${order.customerName},`,
      '',
      isRenewalOrder
        ? 'Thank you so much! Your Bow-Bow Ties subscription payment was received, and we will prepare this treat order.'
        : 'Thank you so much for your Bow-Bow Ties order! We received your payment and will start preparing your items.',
      '',
      `Order: ${customerOrderNumber}`,
      '',
      'Items:',
      getLineItemsText(order),
      '',
      `Subtotal: ${formatPrice(order.subtotalCents)}`,
      `Shipping: ${formatPrice(order.shippingCents)}`,
      `Tax: ${formatPrice(order.taxCents)}`,
      getOrderDiscountCents(order) > 0 ? `Discount: -${formatPrice(getOrderDiscountCents(order))}` : '',
      `Total: ${getOrderTotalLabel(order)}`,
      '',
      order.fulfillmentMethod === 'pickup' ? 'Fulfillment: Pick up order' : 'Shipping to:',
      order.fulfillmentMethod === 'pickup'
        ? 'We will send you an update when your order is ready and coordinate pickup details with you.'
        : formatShippingAddress(order.shippingAddress),
      '',
      order.fulfillmentMethod === 'pickup'
        ? 'We will send an update when your order is ready.'
        : 'Most orders ship within 3-5 business days after we receive the order. We will send tracking details as soon as your package is on its way.',
      ...(hasSubscription
        ? [
            '',
            `Manage or cancel future subscription renewals: ${siteUrl.replace(/\/$/, '')}/subscriptions`,
          ]
        : []),
      '',
      'Thank you for supporting our mission to help animals in need. We hope you and your furry friend love everything!',
      '',
      'Sincerely,',
      'Divisha Mandal',
      'Founder, Bow-Bow Ties',
      'https://bowbowties.us/',
      'Making the world a better place for animals',
    ].join('\n'),
  }
}

export function buildSellerOrderEmail(order: OrderSummary): EmailMessage {
  const customerOrderNumber = getCustomerOrderNumber(order)
  const isRenewalOrder = order.stripeSessionId.startsWith('invoice:')

  return {
    to: sellerEmail,
    subject: isRenewalOrder
      ? `[BBT Seller Order ${customerOrderNumber}] Subscription renewal - ${order.customerName}`
      : `[BBT Seller Order ${customerOrderNumber}] New order - ${order.customerName}`,
    text: [
      isRenewalOrder
        ? 'New paid subscription renewal order received.'
        : 'New paid order received.',
      '',
      `Customer order: ${customerOrderNumber}`,
      `Internal order ID: ${order.id}`,
      `Stripe session: ${order.stripeSessionId}`,
      order.stripeSubscriptionId ? `Stripe subscription: ${order.stripeSubscriptionId}` : '',
      '',
      `Buyer: ${order.customerName}`,
      `Email: ${order.customerEmail || 'Not provided'}`,
      order.customerPhone ? `Phone: ${order.customerPhone}` : '',
      `Fulfillment: ${order.fulfillmentMethod === 'pickup' ? 'Pick up' : 'Ship'}`,
      '',
      'Items:',
      getLineItemsText(order),
      '',
      `Total: ${getOrderTotalLabel(order)}`,
      '',
      order.fulfillmentMethod === 'pickup' ? 'Pickup order.' : 'Ship to:',
      order.fulfillmentMethod === 'pickup' ? '' : formatShippingAddress(order.shippingAddress),
    ]
      .filter((line) => line !== '')
      .join('\n'),
  }
}

export function buildShippingConfirmationEmail(
  order: OrderSummary,
  fulfillment: FulfillmentInfo
): EmailMessage | null {
  if (!order.customerEmail) return null
  const customerOrderNumber = getCustomerOrderNumber(order)

  return {
    to: order.customerEmail,
    subject:
      order.fulfillmentMethod === 'pickup'
        ? `[Bow-Bow-Ties Order ${customerOrderNumber}] Ready for pickup`
        : `[Bow-Bow-Ties Order ${customerOrderNumber}] Your order has shipped`,
    text: [
      `Hi ${order.customerName},`,
      '',
      `Order: ${customerOrderNumber}`,
      '',
      order.fulfillmentMethod === 'pickup'
        ? 'Great news! Your Bow-Bow Ties order is ready for pickup.'
        : 'Great news! Your Bow-Bow Ties order is on its way!',
      '',
      order.fulfillmentMethod === 'pickup' ? '' : `Carrier: ${fulfillment.carrier || 'USPS'}`,
      order.fulfillmentMethod === 'pickup' ? '' : `Tracking Number: ${fulfillment.trackingNumber || 'Not provided'}`,
      order.fulfillmentMethod === 'pickup' || !fulfillment.trackingUrl ? '' : `Track Your Package: ${fulfillment.trackingUrl}`,
      fulfillment.shippedAt
        ? `${order.fulfillmentMethod === 'pickup' ? 'Ready date' : 'Shipped date'}: ${fulfillment.shippedAt}`
        : '',
      fulfillment.note ? `Note: ${fulfillment.note}` : '',
      '',
      'Thank you so much for your order and for supporting our mission to help animals in need. We hope you and your furry friend love everything!',
      '',
      'Sincerely,',
      'Divisha Mandal',
      'Founder, Bow-Bow Ties',
      'https://bowbowties.us/',
      'Making the world a better place for animals',
    ]
      .filter((line) => line !== '')
      .join('\n'),
  }
}

export async function sendEmail(message: EmailMessage) {
  if (resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: message.to,
        subject: message.subject,
        text: message.text,
        reply_to: message.replyTo || replyToEmail,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Unable to send email: ${body}`)
    }

    return
  }

  console.log(
    JSON.stringify(
      {
        mode: 'email-preview',
        from: fromEmail,
        to: message.to,
        subject: message.subject,
        replyTo: message.replyTo || replyToEmail,
        text: message.text,
      },
      null,
      2
    )
  )
}

export async function sendOrderEmails(order: OrderSummary) {
  const buyerEmail = buildBuyerOrderEmail(order)
  const sellerOrderEmail = buildSellerOrderEmail(order)

  if (buyerEmail) await sendEmail(buyerEmail)
  await sendEmail(sellerOrderEmail)
}
