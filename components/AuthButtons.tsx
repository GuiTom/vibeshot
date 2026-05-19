'use client'

import { useEffect, useState, useTransition } from 'react'
import { LogIn, LogOut } from 'lucide-react'
import { signIn, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

interface AuthButtonsProps {
  isAuthenticated: boolean
}

interface AuthProvider {
  id: string
  name: string
}

export default function AuthButtons({ isAuthenticated }: AuthButtonsProps) {
  const [isPending, startTransition] = useTransition()
  const [providers, setProviders] = useState<Record<string, AuthProvider>>({})
  const { resetFlow, clearGenerationHistory } = useAppStore()

  useEffect(() => {
    let cancelled = false

    async function loadProviders() {
      try {
        const response = await fetch('/api/auth/providers')
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as Record<string, AuthProvider>
        if (!cancelled) {
          setProviders(data)
        }
      } catch {
        // Keep the UI usable even if provider discovery fails.
      }
    }

    loadProviders()

    return () => {
      cancelled = true
    }
  }, [])

  if (isAuthenticated) {
    return (
      <button
        onClick={() =>
          startTransition(async () => {
            resetFlow()
            clearGenerationHistory()
            await signOut({ callbackUrl: '/' })
          })
        }
        className="px-4 py-2 rounded-lg border border-white/10 text-gray-200 hover:text-white hover:border-primary-500/40 transition-colors flex items-center gap-2"
        disabled={isPending}
      >
        <LogOut className="w-4 h-4" />
        退出登录
      </button>
    )
  }

  const hasGoogle = Boolean(providers.google)
  const hasFacebook = Boolean(providers.facebook)

  return (
    <div className="flex items-center gap-2">
      {hasGoogle && (
        <button
          onClick={() => startTransition(() => signIn('google', { callbackUrl: '/' }))}
          className={cn(
            'px-4 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2',
            isPending && 'opacity-70 cursor-not-allowed'
          )}
          disabled={isPending}
        >
          <LogIn className="w-4 h-4" />
          Google 登录
        </button>
      )}
      {hasFacebook && (
        <button
          onClick={() => startTransition(() => signIn('facebook', { callbackUrl: '/' }))}
          className={cn(
            'px-4 py-2 rounded-lg bg-[#1877F2] text-white hover:bg-[#1669d8] transition-colors',
            isPending && 'opacity-70 cursor-not-allowed'
          )}
          disabled={isPending}
        >
          Facebook 登录
        </button>
      )}
    </div>
  )
}
