import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { applySubscriptionPurchase, downgradeToFree } from '@/lib/billing'
import { prisma } from '@/lib/prisma'
import { getStripeServer } from '@/lib/stripe'

function toDateFromUnixTimestamp(value: unknown) {
  return typeof value === 'number' ? new Date(value * 1000) : null
}

export async function POST(request: Request) {
  const stripe = getStripeServer()
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing Stripe webhook signature/secret' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan as 'monthly' | 'yearly' | undefined

        if (userId && plan && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          const currentPeriodEnd = toDateFromUnixTimestamp(
            (subscription as any).current_period_end
          )

          await applySubscriptionPurchase({
            userId,
            plan,
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            currentPeriodEnd,
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        const plan = subscription.metadata?.plan as 'monthly' | 'yearly' | undefined
        const currentPeriodEnd = toDateFromUnixTimestamp(
          (subscription as any).current_period_end
        )

        if (userId && plan) {
          await applySubscriptionPurchase({
            userId,
            plan,
            stripeCustomerId: String(subscription.customer),
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            currentPeriodEnd,
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          select: { id: true },
        })

        if (user) {
          await downgradeToFree(user.id)
        }
        break
      }
    }
  } catch (error: any) {
    console.error('Stripe webhook handling error:', error)
    return NextResponse.json(
      { error: error?.message || 'Webhook handling failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
