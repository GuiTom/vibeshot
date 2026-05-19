import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripeServer() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured')
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  return stripeInstance
}

export type BillingPlan = 'monthly' | 'yearly'

export const BILLING_PLAN_CONFIG: Record<
  BillingPlan,
  {
    plan: 'monthly' | 'yearly'
    credits: number
    envKey: 'STRIPE_MONTHLY_PRICE_ID' | 'STRIPE_YEARLY_PRICE_ID'
  }
> = {
  monthly: {
    plan: 'monthly',
    credits: 50,
    envKey: 'STRIPE_MONTHLY_PRICE_ID',
  },
  yearly: {
    plan: 'yearly',
    credits: 600,
    envKey: 'STRIPE_YEARLY_PRICE_ID',
  },
}

export function getPriceIdForPlan(plan: BillingPlan) {
  const envKey = BILLING_PLAN_CONFIG[plan].envKey
  const priceId = process.env[envKey]

  if (!priceId) {
    throw new Error(`Missing Stripe price id: ${envKey}`)
  }

  return priceId
}
