import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { BillingPlan, getPriceIdForPlan, getStripeServer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: '请先登录后再支付' }, { status: 401 })
  }

  const body = await request.json()
  const plan = body?.plan as BillingPlan

  if (plan !== 'monthly' && plan !== 'yearly') {
    return NextResponse.json({ error: '无效的订阅套餐' }, { status: 400 })
  }

  const stripe = getStripeServer()
  const priceId = getPriceIdForPlan(plan)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
    },
  })

  if (!user?.email) {
    return NextResponse.json({ error: '用户邮箱缺失' }, { status: 400 })
  }

  const origin =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    request.nextUrl.origin

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: user.stripeCustomerId || undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancel`,
    metadata: {
      userId: user.id,
      plan,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        plan,
      },
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({
    success: true,
    data: {
      url: checkoutSession.url,
    },
  })
}
