'use client'

import { useMemo } from 'react'
import { History, Images, Sparkles, UserCircle2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/store/useAppStore'
import { getSceneById, getStyleById } from '@/lib/data'
import { formatRelativeTime } from '@/lib/utils'

export default function AccountPanel() {
  const { data: session, status } = useSession()
  const { generationHistory, subscription } = useAppStore()

  const latestHistory = useMemo(
    () => generationHistory.slice(0, 6),
    [generationHistory]
  )

  if (status !== 'authenticated' || !session?.user) {
    return null
  }

  const planLabel =
    subscription.type === 'monthly'
      ? '月度订阅'
      : subscription.type === 'yearly'
      ? '年度订阅'
      : '免费体验'

  const statusLabel =
    subscription.status === 'active'
      ? '生效中'
      : subscription.status === 'trialing'
      ? '试用中'
      : subscription.status === 'past_due'
      ? '待支付'
      : subscription.status

  const usedCredits = Math.max(
    0,
    subscription.totalCredits - subscription.remainingCredits
  )
  const usagePercent =
    subscription.totalCredits > 0
      ? Math.min(100, Math.round((usedCredits / subscription.totalCredits) * 100))
      : 0

  return (
    <section
      id="account"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1.8fr] gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? 'User avatar'}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                <UserCircle2 className="w-9 h-9 text-primary-300" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-display font-bold text-white">
                {session.user.name || 'VibeShot 用户'}
              </h3>
              <p className="text-gray-400">{session.user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-dark-100/70 border border-white/5 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Sparkles className="w-4 h-4" />
                当前套餐
              </div>
              <p className="text-white font-semibold">{planLabel}</p>
              {statusLabel && (
                <p className="text-xs text-gray-500 mt-1">{statusLabel}</p>
              )}
            </div>
            <div className="rounded-2xl bg-dark-100/70 border border-white/5 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Images className="w-4 h-4" />
                账户额度
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">
                    {subscription.remainingCredits} / {subscription.totalCredits}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    已用 {usedCredits} 次，剩余 {subscription.remainingCredits} 次
                  </p>
                </div>
                <p className="text-sm font-medium text-primary-300">
                  {usagePercent}%
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl bg-dark-100/70 border border-white/5 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <History className="w-4 h-4" />
                历史生成
              </div>
              <p className="text-white font-semibold">{generationHistory.length} 张</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">最近生成</h3>
              <p className="text-gray-400 text-sm">你的账户历史会保存在服务器端</p>
            </div>
          </div>

          {latestHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-dark-100/50 px-6 py-12 text-center text-gray-400">
              还没有历史记录，去生成第一张照片吧。
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {latestHistory.map((photo) => {
                const style = getStyleById(photo.styleId)
                const scene = getSceneById(photo.sceneId)

                return (
                  <div
                    key={photo.id}
                    className="rounded-2xl overflow-hidden border border-white/10 bg-dark-100/60"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt="历史生成图片"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-white text-sm font-medium truncate">
                        {style?.name || '自定义风格'}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {scene?.name || '未分类场景'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatRelativeTime(new Date(photo.createdAt))}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
