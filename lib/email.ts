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
  html?: string
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

function escapeHtml(value: string | number | null | undefined) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getLogoUrl() {
  return `${siteUrl.replace(/\/$/, '')}/bow_bow_ties.png`
}

function renderEmailLayout(title: string, body: string) {
  const logoUrl = escapeHtml(getLogoUrl())

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="padding:28px 28px 18px;text-align:center;background:#ecfeff;">
        <img src="${logoUrl}" alt="Bow-Bow Ties" width="80" height="80" style="display:block;margin:0 auto 14px;border-radius:999px;object-fit:cover;">
        <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0f172a;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:28px;">
        ${body}
      </div>
      <div style="padding:22px 28px;background:#fff7ed;border-top:1px solid #fed7aa;color:#475569;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 14px;">Thank you for supporting our mission to help animals in need. We hope you and your furry friend love everything!</p>
        <p style="margin:0;">
          Sincerely,<br>
          <strong>Divisha Mandal</strong><br>
          Founder, <a href="${escapeHtml(siteUrl.replace(/\/$/, '/'))}" style="color:#0f766e;text-decoration:none;">Bow-Bow Ties</a><br>
          Making the world a better place for animals
        </p>
      </div>
    </div>
  </body>
</html>`
}

function renderLineItemsRows(order: OrderSummary) {
  return order.lineItems
    .map((item) => {
      const plan = item.planName ? `, ${item.planName}` : ''
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
          <div style="font-weight:700;color:#0f172a;">${escapeHtml(item.productName)}</div>
          <div style="margin-top:3px;color:#64748b;font-size:13px;">${escapeHtml(item.variantName + plan)} x ${escapeHtml(item.quantity)}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#0f172a;">${escapeHtml(formatPrice(item.totalAmountCents))}</td>
      </tr>`
    })
    .join('')
}

function renderDetailRows(rows: Array<[string, string | undefined]>) {
  return rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:700;color:#0f172a;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#334155;">${escapeHtml(value)}</td></tr>`
    )
    .join('')
}

function renderOrderHtml(order: OrderSummary, customerOrderNumber: string, isRenewalOrder: boolean, hasSubscription: boolean) {
  const discountCents = getOrderDiscountCents(order)
  const fulfillmentCopy =
    order.fulfillmentMethod === 'pickup'
      ? 'We will send you an update when your order is ready and coordinate pickup details with you.'
      : 'Most orders ship within 3-5 business days after we receive the order. We will send tracking details as soon as your package is on its way.'
  const addressHtml =
    order.fulfillmentMethod === 'pickup'
      ? '<p style="margin:8px 0 0;color:#475569;">Pick up order</p>'
      : `<p style="margin:8px 0 0;white-space:pre-line;color:#475569;">${escapeHtml(formatShippingAddress(order.shippingAddress))}</p>`
  const subscriptionHtml = hasSubscription
    ? `<p style="margin:20px 0 0;"><a href="${escapeHtml(siteUrl.replace(/\/$/, '') + '/subscriptions')}" style="color:#0f766e;font-weight:700;">Manage or cancel future subscription renewals</a></p>`
    : ''
  const noteHtml = order.orderNote
    ? `<div style="margin:0 0 22px;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#9a3412;letter-spacing:.04em;">Your note</div>
        <p style="margin:8px 0 0;white-space:pre-line;color:#475569;">${escapeHtml(order.orderNote)}</p>
      </div>`
    : ''

  return renderEmailLayout(
    isRenewalOrder ? 'Subscription Renewal Received' : 'Order Received',
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(order.customerName)},</p>
      <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">
        ${
          isRenewalOrder
            ? 'Thank you so much! Your Bow-Bow Ties subscription payment was received, and we will prepare this treat order.'
            : 'Thank you so much for your Bow-Bow Ties order! We received your payment and will start preparing your items.'
        }
      </p>

      <div style="margin:0 0 22px;padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#0f766e;letter-spacing:.04em;">Order</div>
        <div style="margin-top:4px;font-size:20px;font-weight:800;color:#0f172a;">${escapeHtml(customerOrderNumber)}</div>
      </div>

      <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">Items</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:18px;">
        ${renderLineItemsRows(order)}
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;color:#334155;">
        <tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;">${escapeHtml(formatPrice(order.subtotalCents))}</td></tr>
        <tr><td style="padding:4px 0;">Shipping</td><td style="padding:4px 0;text-align:right;">${escapeHtml(formatPrice(order.shippingCents))}</td></tr>
        <tr><td style="padding:4px 0;">Tax</td><td style="padding:4px 0;text-align:right;">${escapeHtml(formatPrice(order.taxCents))}</td></tr>
        ${discountCents > 0 ? `<tr><td style="padding:4px 0;color:#047857;">Discount</td><td style="padding:4px 0;text-align:right;color:#047857;">-${escapeHtml(formatPrice(discountCents))}</td></tr>` : ''}
        <tr><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;font-weight:800;color:#0f172a;">Total</td><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:800;color:#0f172a;">${escapeHtml(getOrderTotalLabel(order))}</td></tr>
      </table>

      <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">${order.fulfillmentMethod === 'pickup' ? 'Fulfillment' : 'Shipping to'}</h2>
      ${addressHtml}
      <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#475569;">${escapeHtml(fulfillmentCopy)}</p>
      ${noteHtml}
      ${subscriptionHtml}
    `
  )
}

function renderSellerOrderHtml(order: OrderSummary, customerOrderNumber: string, isRenewalOrder: boolean) {
  return renderEmailLayout(
    isRenewalOrder ? 'Subscription Renewal' : 'New Order',
    `
      <div style="margin:0 0 22px;padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#0f766e;letter-spacing:.04em;">Customer order</div>
        <div style="margin-top:4px;font-size:20px;font-weight:800;color:#0f172a;">${escapeHtml(customerOrderNumber)}</div>
      </div>

      <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">Customer</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;color:#334155;">
        ${renderDetailRows([
          ['Name', order.customerName],
          ['Email', order.customerEmail || 'Not provided'],
          ['Phone', order.customerPhone],
          ['Fulfillment', order.fulfillmentMethod === 'pickup' ? 'Pick up' : 'Ship'],
          ['Stripe session', order.stripeSessionId],
          ['Stripe subscription', order.stripeSubscriptionId],
        ])}
      </table>

      ${
        order.orderNote
          ? `<div style="margin:0 0 22px;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;">
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#9a3412;letter-spacing:.04em;">Order note</div>
              <p style="margin:8px 0 0;white-space:pre-line;color:#475569;">${escapeHtml(order.orderNote)}</p>
            </div>`
          : ''
      }

      <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">Items</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:18px;">
        ${renderLineItemsRows(order)}
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;color:#334155;">
        <tr><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;font-weight:800;color:#0f172a;">Total</td><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:800;color:#0f172a;">${escapeHtml(getOrderTotalLabel(order))}</td></tr>
      </table>

      <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">${order.fulfillmentMethod === 'pickup' ? 'Pickup' : 'Ship to'}</h2>
      <p style="margin:8px 0 0;white-space:pre-line;color:#475569;">${escapeHtml(order.fulfillmentMethod === 'pickup' ? 'Pickup order.' : formatShippingAddress(order.shippingAddress))}</p>
    `
  )
}

function renderFulfillmentHtml(order: OrderSummary, fulfillment: FulfillmentInfo, customerOrderNumber: string) {
  const isPickup = order.fulfillmentMethod === 'pickup'
  const trackingUrl = fulfillment.trackingUrl.trim()
  const trackingRows = isPickup
    ? [
        fulfillment.shippedAt ? ['Ready date', fulfillment.shippedAt] : null,
        fulfillment.note ? ['Pickup note', fulfillment.note] : null,
      ].filter((row): row is string[] => Boolean(row))
    : [
        ['Carrier', fulfillment.carrier || 'USPS'],
        ['Tracking Number', fulfillment.trackingNumber || 'Not provided'],
        fulfillment.shippedAt ? ['Shipped date', fulfillment.shippedAt] : null,
        fulfillment.note ? ['Note', fulfillment.note] : null,
      ].filter((row): row is string[] => Boolean(row))

  return renderEmailLayout(
    isPickup ? 'Your Order Is Ready For Pickup' : 'Your Order Is On Its Way',
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(order.customerName)},</p>
      <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">
        ${isPickup ? 'Great news! Your Bow-Bow Ties order is ready for pickup.' : 'Great news! Your Bow-Bow Ties order is on its way!'}
      </p>

      <div style="margin:0 0 22px;padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#0f766e;letter-spacing:.04em;">Order</div>
        <div style="margin-top:4px;font-size:20px;font-weight:800;color:#0f172a;">${escapeHtml(customerOrderNumber)}</div>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;color:#334155;">
        ${trackingRows
          .map(([label, value]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:700;color:#0f172a;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(value)}</td></tr>`)
          .join('')}
      </table>

      ${
        !isPickup && trackingUrl
          ? `<p style="margin:0 0 22px;text-align:center;"><a href="${escapeHtml(trackingUrl)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:8px;">Track Your Package</a></p>`
          : ''
      }
    `
  )
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
    html: renderOrderHtml(order, customerOrderNumber, isRenewalOrder, hasSubscription),
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
      ...(order.orderNote
        ? [
            '',
            'Your note:',
            order.orderNote,
          ]
        : []),
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
    html: renderSellerOrderHtml(order, customerOrderNumber, isRenewalOrder),
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
      order.orderNote ? `Order note: ${order.orderNote}` : '',
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
    html: renderFulfillmentHtml(order, fulfillment, customerOrderNumber),
    text: [
      `Hi ${order.customerName},`,
      '',
      `Order: ${customerOrderNumber}`,
      '',
      order.fulfillmentMethod === 'pickup'
        ? 'Great news! Your Bow-Bow Ties order is ready for pickup.'
        : 'Great news! Your Bow-Bow Ties order is on its way!',
      '',
      ...(order.fulfillmentMethod === 'pickup'
        ? [
            fulfillment.shippedAt ? `Ready date: ${fulfillment.shippedAt}` : '',
            fulfillment.note ? `Pickup note: ${fulfillment.note}` : '',
          ].filter(Boolean)
        : [
            `Carrier: ${fulfillment.carrier || 'USPS'}`,
            `Tracking Number: ${fulfillment.trackingNumber || 'Not provided'}`,
            fulfillment.trackingUrl ? `Track Your Package: ${fulfillment.trackingUrl}` : '',
            fulfillment.shippedAt ? `Shipped date: ${fulfillment.shippedAt}` : '',
            fulfillment.note ? `Note: ${fulfillment.note}` : '',
          ].filter(Boolean)),
      '',
      'Thank you so much for your order and for supporting our mission to help animals in need. We hope you and your furry friend love everything!',
      '',
      'Sincerely,',
      'Divisha Mandal',
      'Founder, Bow-Bow Ties',
      'https://bowbowties.us/',
      'Making the world a better place for animals',
    ].join('\n'),
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
        html: message.html,
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
        html: message.html,
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
