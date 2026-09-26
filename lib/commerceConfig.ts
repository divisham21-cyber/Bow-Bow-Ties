export const standardShipping = {
  id: 'standard-shipping',
  name: 'Standard shipping',
  priceCents: 499,
  deliveryEstimate: '3-7 business days',
}

export const freeShippingThresholdCents = 5000

export function qualifiesForFreeShipping(subtotalCents: number) {
  return subtotalCents >= freeShippingThresholdCents
}

export function getShippingPriceCents(subtotalCents: number) {
  return qualifiesForFreeShipping(subtotalCents) ? 0 : standardShipping.priceCents
}

export const pickupLocation = {
  label: 'South Bothell',
  city: 'Bothell',
  state: 'WA',
  postalCode: '98021',
  country: 'US',
}

export function getRecurringShippingPriceLookupKey(intervalCount: number) {
  return `bbt_${standardShipping.id}_${intervalCount}_month_subscription`
}
