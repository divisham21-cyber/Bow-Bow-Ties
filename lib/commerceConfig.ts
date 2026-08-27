export const standardShipping = {
  id: 'standard-shipping',
  name: 'Standard shipping',
  priceCents: 499,
  deliveryEstimate: '3-7 business days',
}

export function getRecurringShippingPriceLookupKey(intervalCount: number) {
  return `bbt_${standardShipping.id}_${intervalCount}_month_subscription`
}
