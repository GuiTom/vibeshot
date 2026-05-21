'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import AccountPanel from '@/components/AccountPanel'
import Features from '@/components/Features'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'
import PhotoUploader from '@/components/PhotoUploader'
import StyleSelector from '@/components/StyleSelector'
import PhotoGenerator from '@/components/PhotoGenerator'
import ResultGallery from '@/components/ResultGallery'
import { useAppStore } from '@/store/useAppStore'

export default function Home() {
  return (
    <Suspense fallback={<HomeContent checkoutState={null} />}>
      <HomeSearchParamsBoundary />
    </Suspense>
  )
}

function HomeSearchParamsBoundary() {
  const searchParams = useSearchParams()
  const checkoutState = searchParams.get('checkout')

  return <HomeContent checkoutState={checkoutState} />
}

interface HomeContentProps {
  checkoutState: string | null
}

function HomeContent({ checkoutState }: HomeContentProps) {
  const {
    currentStep,
    user,
    setUser,
    setGenerationHistory,
    clearGenerationHistory,
    resetFlow,
  } = useAppStore()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showCheckoutBanner, setShowCheckoutBanner] = useState(false)

  const checkoutBannerText = useMemo(() => {
    if (checkoutState !== 'success') {
      return null
    }

    const plan = user?.subscription?.type
    const credits = user?.subscription?.remainingCredits

    if (plan === 'monthly') {
      return `月度订阅开通成功，当前已到账 ${credits ?? 50} 次生成额度。`
    }

    if (plan === 'yearly') {
      return `年度订阅开通成功，当前已到账 ${credits ?? 600} 次生成额度。`
    }

    return '支付成功，套餐信息已更新。'
  }, [checkoutState, user?.subscription?.remainingCredits, user?.subscription?.type])

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  useEffect(() => {
    if (checkoutState === 'success') {
      setShowCheckoutBanner(true)
      return
    }

    setShowCheckoutBanner(false)
  }, [checkoutState])

  useEffect(() => {
    let cancelled = false

    async function loadAccount() {
      const response = await fetch('/api/account')
      if (!response.ok) {
        return null
      }

      const payload = await response.json()
      return payload.data ?? null
    }

    async function loadGenerationHistory() {
      try {
        const response = await fetch('/api/generations')
        if (!response.ok) {
          return
        }

        const payload = await response.json()
        if (!cancelled) {
          setGenerationHistory(
            (payload.data ?? []).map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to load generation history:', error)
      }
    }

    if (status === 'authenticated' && session?.user) {
      ;(async () => {
        const account = await loadAccount()

        if (!cancelled) {
          setUser({
            id: account?.id ?? session.user.id ?? session.user.email ?? 'authenticated-user',
            name: account?.name ?? session.user.name ?? undefined,
            email: account?.email ?? session.user.email ?? undefined,
            avatar: account?.image ?? session.user.image ?? undefined,
            createdAt: account?.createdAt ? new Date(account.createdAt) : new Date(),
            subscription: {
              type: account?.subscriptionPlan ?? 'free',
              remainingCredits: account?.creditsRemaining ?? 3,
              totalCredits: account?.creditsTotal ?? 3,
              expiresAt: account?.subscriptionExpiresAt
                ? new Date(account.subscriptionExpiresAt)
                : null,
              status: account?.subscriptionStatus ?? null,
            },
          })
        }

        loadGenerationHistory()
      })()
      return
    }

    if (status === 'unauthenticated') {
      resetFlow()
      clearGenerationHistory()
      setUser({
        id: 'guest',
        createdAt: new Date(),
        subscription: {
          type: 'free',
          remainingCredits: 3,
          totalCredits: 3,
          expiresAt: null,
        },
      })
    }

    return () => {
      cancelled = true
    }
  }, [clearGenerationHistory, resetFlow, session, setGenerationHistory, setUser, status])

  function dismissCheckoutBanner() {
    setShowCheckoutBanner(false)

    if (checkoutState === 'success') {
      router.replace('/', { scroll: false })
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      {showCheckoutBanner && checkoutBannerText && (
        <div className="fixed top-20 left-1/2 z-50 w-[min(92vw,720px)] -translate-x-1/2 px-4">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-emerald-100">
                {checkoutBannerText}
              </p>
              <p className="mt-1 text-xs text-emerald-200/80">
                你现在可以直接继续生成，账户额度已经按新套餐刷新。
              </p>
            </div>
            <button
              type="button"
              onClick={dismissCheckoutBanner}
              className="rounded-full p-1 text-emerald-200/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="关闭提示"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero />
            <AccountPanel />
            <Features />
            <Pricing />
            <Footer />
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen pt-24 pb-12 px-4"
          >
            {/* Step indicator */}
            <div className="max-w-7xl mx-auto mb-8">
              <div className="flex items-center justify-center space-x-4">
                {['home', 'upload', 'select', 'generate', 'result'].map((step, index) => {
                  const isActive = currentStep === step
                  const isPast = ['home', 'upload', 'select', 'generate', 'result'].indexOf(currentStep) > index

                  return (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : isPast
                            ? 'bg-primary-500/50 text-white'
                            : 'bg-dark-100 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < 4 && (
                        <div
                          className={`w-12 h-0.5 mx-2 transition-colors ${
                            isPast ? 'bg-primary-500' : 'bg-gray-700'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="max-w-7xl mx-auto">
              {currentStep === 'upload' && <PhotoUploader />}
              {currentStep === 'select' && <StyleSelector />}
              {currentStep === 'generate' && <PhotoGenerator />}
              {currentStep === 'result' && <ResultGallery />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
