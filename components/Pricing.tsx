'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { useSession, signIn } from 'next-auth/react'
import { useAppStore } from '@/store/useAppStore'

const plans = [
  {
    name: '免费体验',
    price: '¥0',
    period: '永久',
    description: '适合尝鲜体验',
    features: [
      '3 张免费生成',
      '基础风格选择',
      '3 个场景模板',
      '压缩图下载',
    ],
    notIncluded: [
      '姿势智能推荐',
      '高清原图下载',
      '批量生成',
    ],
    cta: '立即体验',
    highlight: false,
  },
  {
    name: '月度订阅',
    price: '¥39',
    period: '每月',
    description: '适合经常使用',
    features: [
      '每月 50 张生成',
      '全部风格选择',
      '全部场景模板',
      '姿势智能推荐',
      '高清原图下载',
      '优先生成队列',
    ],
    notIncluded: [],
    cta: '立即订阅',
    highlight: true,
  },
  {
    name: '年度订阅',
    price: '¥299',
    period: '每年',
    description: '最划算的选择',
    features: [
      '每年 600 张生成',
      '全部风格选择',
      '全部场景模板',
      '姿势智能推荐',
      '高清原图下载',
      '优先生成队列',
      '形象升级报告',
    ],
    notIncluded: [],
    cta: '立即订阅',
    highlight: false,
    badge: '推荐',
  },
]

export default function Pricing() {
  const { status } = useSession()
  const { setCurrentStep } = useAppStore()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleCheckout(planName: string) {
    if (planName === '免费体验') {
      return
    }

    if (status !== 'authenticated') {
      await signIn(undefined, { callbackUrl: '/#pricing' })
      return
    }

    const plan = planName === '月度订阅' ? 'monthly' : 'yearly'
    setLoadingPlan(plan)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || '创建支付会话失败')
      }

      if (payload.data?.url) {
        window.location.href = payload.data.url
      }
    } catch (error: any) {
      alert(error.message || '暂时无法发起支付，请稍后重试')
    } finally {
      setLoadingPlan(null)
    }
  }

  function handleFreePlan() {
    if (status !== 'authenticated') {
      signIn('google', { callbackUrl: '/#pricing' })
      return
    }

    setCurrentStep('upload')
  }

  return (
    <section id="pricing" className="py-24 bg-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            简单透明的定价
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            按需选择，无需绑定期，随时取消
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-primary-600/20 to-primary-900/20 border-2 border-primary-500'
                  : 'bg-dark-100/50 border border-white/5'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 rounded-full">
                  <span className="text-sm font-medium text-white flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-gray-300"
                  >
                    <Check className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-gray-600"
                  >
                    <span className="w-5 h-5 mr-3 flex-shrink-0">-</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  plan.name === '免费体验'
                    ? handleFreePlan()
                    : handleCheckout(plan.name)
                }
                disabled={loadingPlan !== null}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-primary-600 hover:bg-primary-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {loadingPlan &&
                ((loadingPlan === 'monthly' && plan.name === '月度订阅') ||
                  (loadingPlan === 'yearly' && plan.name === '年度订阅'))
                  ? '跳转支付中...'
                  : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 text-sm mt-12"
        >
          按次付费：¥3/张，适合低频用户
        </motion.p>
      </div>
    </section>
  )
}
