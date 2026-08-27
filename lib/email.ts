import {
  FulfillmentInfo,
  OrderSummary,
  formatShippingAddress,
  getOrderTotalLabel,
} from './orders'
import { formatPrice } from './catalog'

export interface EmailMessage {
  to: string
  subject: string
  text: string
}

const sellerEmail = process.env.SELLER_ORDER_EMAIL || 'bowbowties21@gmail.com'
const fromEmail = process.env.ORDER_FROM_EMAIL || 'orders@bowbowties.local'
const resendApiKey = process.env.RESEND_API_KEY

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

  return {
    to: order.customerEmail,
    subject: `Bow-Bow-Ties order received`,
    text: [
      `Hi ${order.customerName},`,
      '',
      'Thank you for your Bow-Bow-Ties order. We received your payment and will prepare your items for shipment.',
      '',
      'Items:',
      getLineItemsText(order),
      '',
      `Subtotal: ${formatPrice(order.subtotalCents)}`,
      `Shipping: ${formatPrice(order.shippingCents)}`,
      `Tax: ${formatPrice(order.taxCents)}`,
      `Total: ${getOrderTotalLabel(order)}`,
      '',
      order.fulfillmentMethod === 'pickup' ? 'Fulfillment: Pick up order' : 'Shipping to:',
      order.fulfillmentMethod === 'pickup'
        ? 'We will coordinate pickup details after your order is prepared.'
        : formatShippingAddress(order.shippingAddress),
      '',
      order.fulfillmentMethod === 'pickup'
        ? 'We will send an update when your order is ready.'
        : 'We will send tracking details after the order is fulfilled.',
    ].join('\n'),
  }
}

export function buildSellerOrderEmail(order: OrderSummary): EmailMessage {
  return {
    to: sellerEmail,
    subject: `New Bow-Bow-Ties order: ${order.customerName}`,
    text: [
      'New paid order received.',
      '',
      `Order ID: ${order.id}`,
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

  return {
    to: order.customerEmail,
    subject: `Your Bow-Bow-Ties order has shipped`,
    text: [
      `Hi ${order.customerName},`,
      '',
      order.fulfillmentMethod === 'pickup'
        ? 'Your Bow-Bow-Ties order is ready for pickup.'
        : 'Your Bow-Bow-Ties order has shipped.',
      '',
      order.fulfillmentMethod === 'pickup' ? '' : `Carrier: ${fulfillment.carrier || 'Not provided'}`,
      order.fulfillmentMethod === 'pickup' ? '' : `Tracking number: ${fulfillment.trackingNumber || 'Not provided'}`,
      order.fulfillmentMethod === 'pickup' || !fulfillment.trackingUrl ? '' : `Tracking link: ${fulfillment.trackingUrl}`,
      fulfillment.shippedAt
        ? `${order.fulfillmentMethod === 'pickup' ? 'Ready date' : 'Shipped date'}: ${fulfillment.shippedAt}`
        : '',
      fulfillment.note ? `Note: ${fulfillment.note}` : '',
      '',
      'Items:',
      getLineItemsText(order),
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
