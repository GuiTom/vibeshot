'use client'

import Link from 'next/link'
import { Camera, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import AuthButtons from '@/components/AuthButtons'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentStep, subscription, setCurrentStep } = useAppStore()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isHomeStep = currentStep === 'home'

  function navigateToSection(
    sectionId: 'features' | 'styles' | 'pricing' | 'account'
  ) {
    if (currentStep !== 'home') {
      setCurrentStep('home')
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  function handlePrimaryAction() {
    if (!isAuthenticated) {
      signIn('google', { callbackUrl: '/' })
      return
    }

    if (currentStep !== 'home') {
      setCurrentStep('home')
      return
    }

    setCurrentStep('upload')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">
              VibeShot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex min-w-0 items-center justify-end gap-3 lg:gap-4 flex-1">
            <div className="hidden lg:flex items-center space-x-6 shrink-0">
              <button
                type="button"
                onClick={() => navigateToSection('features')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                功能介绍
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('styles')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                姿势风格
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                定价
              </button>
            </div>

            {isAuthenticated && (
              <>
                <div className="hidden xl:flex items-center rounded-full border border-primary-500/30 bg-dark-100 px-3 py-1 shrink-0">
                  <span className="text-sm text-gray-400">剩余次数:</span>
                  <span className="ml-1 text-primary-400 font-semibold">
                    {subscription.remainingCredits}
                  </span>
                </div>
                <div className="hidden 2xl:flex items-center gap-2 rounded-full border border-white/10 bg-dark-100 px-3 py-1 min-w-0 max-w-[220px]">
                  <User className="w-4 h-4 shrink-0 text-gray-400" />
                  <span className="truncate text-sm text-gray-300">
                    {session?.user?.name || session?.user?.email || '已登录'}
                  </span>
                </div>
              </>
            )}

            <button
              onClick={handlePrimaryAction}
              className="shrink-0 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              {isHomeStep ? '开始生成' : '返回首页'}
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => navigateToSection('account')}
                className="shrink-0 px-4 py-2 rounded-lg border border-white/10 text-gray-200 hover:text-white hover:border-primary-500/40 transition-colors"
              >
                账号信息
              </button>
            )}
            <div className="shrink-0">
              <AuthButtons isAuthenticated={isAuthenticated} />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden glass-dark border-t border-white/5 transition-all duration-300',
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <div className="px-4 py-4 space-y-4">
          {isAuthenticated && (
            <button
              type="button"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => {
                navigateToSection('account')
                setMobileMenuOpen(false)
              }}
            >
              账号信息
            </button>
          )}
          <button
            type="button"
            className="block text-gray-300 hover:text-white transition-colors"
            onClick={() => {
              navigateToSection('features')
              setMobileMenuOpen(false)
            }}
          >
            功能介绍
          </button>
          <button
            type="button"
            className="block text-gray-300 hover:text-white transition-colors"
            onClick={() => {
              navigateToSection('styles')
              setMobileMenuOpen(false)
            }}
          >
            姿势风格
          </button>
          <button
            type="button"
            className="block text-gray-300 hover:text-white transition-colors"
            onClick={() => {
              navigateToSection('pricing')
              setMobileMenuOpen(false)
            }}
          >
            定价
          </button>
          <button
            onClick={() => {
              handlePrimaryAction()
              setMobileMenuOpen(false)
            }}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            {isHomeStep ? '开始生成' : '返回首页'}
          </button>
          <AuthButtons isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </nav>
  )
}
