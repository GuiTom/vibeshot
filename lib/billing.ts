import { SubscriptionPlan } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { BILLING_PLAN_CONFIG, BillingPlan } from '@/lib/stripe'

export async function applySubscriptionPurchase(params: {
  userId: string
  plan: BillingPlan
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  subscriptionStatus?: string | null
  currentPeriodEnd?: Date | null
}) {
  const config = BILLING_PLAN_CONFIG[params.plan]

  await prisma.user.update({
    where: { id: params.userId },
    data: {
      stripeCustomerId: params.stripeCustomerId ?? undefined,
      stripeSubscriptionId: params.stripeSubscriptionId ?? undefined,
      subscriptionPlan: config.plan as SubscriptionPlan,
      subscriptionStatus: params.subscriptionStatus ?? undefined,
      creditsRemaining: config.credits,
      creditsTotal: config.credits,
      subscriptionExpiresAt: params.currentPeriodEnd ?? undefined,
    },
  })
}

export async function downgradeToFree(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: 'free',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      subscriptionExpiresAt: null,
      creditsRemaining: 3,
      creditsTotal: 3,
    },
  })
}
