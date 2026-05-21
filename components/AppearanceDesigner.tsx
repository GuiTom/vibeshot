'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Loader2,
  RefreshCcw,
  Shirt,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { hairstyleOptions, outfitOptions } from '@/lib/design'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export default function AppearanceDesigner() {
  const {
    userPhotos,
    subscription,
    user,
    useCredit,
    refundCredit,
    setSubscription,
    selectedHairstyleId,
    selectedOutfitId,
    designedPortraitUrl,
    isDesignedPortraitConfirmed,
    setSelectedHairstyleId,
    setSelectedOutfitId,
    setDesignedPortrait,
    setDesignedPortraitConfirmed,
    setCurrentStep,
  } = useAppStore()

  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const frontPhoto = userPhotos.find((photo) => photo.type === 'front')
  const selectedHairstyle = hairstyleOptions.find(
    (option) => option.id === selectedHairstyleId
  )
  const selectedOutfit = outfitOptions.find(
    (option) => option.id === selectedOutfitId
  )
  const canGeneratePreview =
    !!frontPhoto && !!selectedHairstyleId && !!selectedOutfitId
  const canContinue = canGeneratePreview

  async function compressImage(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()
    const bitmap = await createImageBitmap(blob)

    const maxSide = 1024
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法处理上传的正面照')
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    return canvas.toDataURL('image/jpeg', 0.82)
  }

  async function generateFrontPreview() {
    if (!frontPhoto || !selectedHairstyle || !selectedOutfit) {
      setPreviewError('请先上传正面照，并选择发型和服装')
      return
    }

    const shouldUseLocalCredit = !user || user.id === 'guest'

    if (shouldUseLocalCredit && !useCredit()) {
      setPreviewError('生成次数已用完，请先购买或升级套餐')
      return
    }

    setIsGeneratingPreview(true)
    setPreviewError(null)

    try {
      const frontPhotoDataUrl = await compressImage(frontPhoto.url)
      const prompt = [
        'Use the uploaded reference image as the same real person.',
        'Keep the same identity, facial structure, skin tone, age impression, and recognizability.',
        'Create a realistic front-facing portrait preview of this same man looking toward the camera.',
        'Frame it as a clean centered preview with a simple studio-style background.',
        'Keep the lighting natural and straightforward for fast hairstyle and outfit approval.',
        'Do not turn the face into a side profile, do not add complex scene elements, and do not change the person.',
        `Selected hairstyle: ${selectedHairstyle.nameEn}. ${selectedHairstyle.prompt}.`,
        `Selected outfit: ${selectedOutfit.nameEn}. ${selectedOutfit.prompt}.`,
        'Make it realistic, clear, and efficient to generate.',
      ].join(' ')

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generationMode: 'appearance-preview',
          prompt,
          userPhoto: frontPhotoDataUrl,
          userPhotos: [
            {
              type: 'front',
              dataUrl: frontPhotoDataUrl,
            },
          ],
          appearanceDesign: {
            hairstyleId: selectedHairstyle.id,
            hairstyleName: selectedHairstyle.nameEn,
            hairstylePrompt: selectedHairstyle.prompt,
            outfitId: selectedOutfit.id,
            outfitName: selectedOutfit.nameEn,
            outfitPrompt: selectedOutfit.prompt,
          },
        }),
      })

      const rawText = await response.text()
      const contentType = response.headers.get('content-type') || ''
      const isJsonResponse =
        contentType.includes('application/json') ||
        rawText.trim().startsWith('{') ||
        rawText.trim().startsWith('[')
      const data = isJsonResponse ? JSON.parse(rawText) : null

      if (!response.ok) {
        throw new Error(data?.error || '正面预览生成失败，请稍后重试')
      }

      if (!data?.data?.imageUrl) {
        throw new Error('预览服务没有返回有效图片')
      }

      if (data?.data?.subscription) {
        setSubscription({
          ...data.data.subscription,
          expiresAt: data.data.subscription.expiresAt
            ? new Date(data.data.subscription.expiresAt)
            : null,
        })
      }

      setDesignedPortrait(data.data.imageUrl, data.data.prompt || prompt)
      setDesignedPortraitConfirmed(true)
    } catch (error: any) {
      if (shouldUseLocalCredit) {
        refundCredit()
      }
      console.error('Front preview generation failed:', error)
      setPreviewError(error?.message || '正面预览生成失败，请稍后重试')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-display text-3xl font-bold text-white">
          设计正面照形象
        </h2>
        <p className="text-gray-400">
          先确定发型和服装，再生成一张正面预览图，确认人物状态后继续选模板。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-dark-100/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
              <UserRound className="h-4 w-4 text-primary-300" />
              上传的正面照
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-dark-200">
              {frontPhoto ? (
                <img
                  src={frontPhoto.url}
                  alt="Uploaded front portrait"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center text-sm text-gray-500">
                  请先上传正面照
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4 text-primary-300" />
              形象方案
            </div>
            <div className="space-y-3 text-sm">
              <SummaryRow label="发型" value={selectedHairstyle?.name} />
              <SummaryRow label="服装" value={selectedOutfit?.name} />
              <SummaryRow
                label="预览状态"
                value={designedPortraitUrl ? '已生成' : '待生成'}
              />
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">选择发型</h3>
                <p className="text-sm text-gray-400">
                  参考图只用于表达发型方向，最终仍会保留你自己的身份特征。
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {hairstyleOptions.map((option) => (
                <DesignCard
                  key={option.id}
                  title={option.name}
                  subtitle={option.nameEn}
                  description={option.description}
                  imageUrl={option.referenceUrl}
                  tags={option.tags}
                  selected={selectedHairstyleId === option.id}
                  onClick={() => setSelectedHairstyleId(option.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Shirt className="h-5 w-5 text-primary-300" />
              <div>
                <h3 className="text-lg font-semibold text-white">选择服装</h3>
                <p className="text-sm text-gray-400">
                  服装会作为人物形象的一部分，先在正面预览里确认，再进入模板生成。
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {outfitOptions.map((option) => (
                <DesignCard
                  key={option.id}
                  title={option.name}
                  subtitle={option.nameEn}
                  description={option.description}
                  imageUrl={option.referenceUrl}
                  tags={option.tags}
                  selected={selectedOutfitId === option.id}
                  onClick={() => setSelectedOutfitId(option.id)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-dark-100/50 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">正面预览</h3>
                <p className="text-sm text-gray-400">
                  根据你上传的正面照和当前形象方案，先生成一张正面预览给你确认。
                </p>
              </div>
              <button
                type="button"
                onClick={generateFrontPreview}
                disabled={!canGeneratePreview || isGeneratingPreview}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all',
                  canGeneratePreview && !isGeneratingPreview
                    ? 'bg-primary-600 text-white hover:bg-primary-500'
                    : 'cursor-not-allowed bg-gray-700 text-gray-400'
                )}
              >
                {isGeneratingPreview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在生成预览
                  </>
                ) : designedPortraitUrl ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    重新生成正面预览
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成正面预览
                  </>
                )}
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden rounded-xl bg-dark-200">
                {designedPortraitUrl ? (
                  <img
                    src={designedPortraitUrl}
                    alt="Designed portrait preview"
                    className="aspect-[4/5] h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center px-8 text-center text-sm text-gray-500">
                    选好发型和服装后，点击“生成正面预览”，这里会出现 AI 预览图。
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-sm font-medium text-white">预览说明</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    这张图会优先帮助你确认正面的人物状态、发型和穿搭是否顺眼，再进入后续模板出片。
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  生成一次正面预览会消耗 1 次生成额度；如果生成失败，这次额度会自动退回。
                </div>

                <div className="space-y-3">
                  <StatusRow
                    label="剩余额度"
                    value={`${subscription.remainingCredits} 次`}
                  />
                  <StatusRow
                    label="已选发型"
                    value={selectedHairstyle?.name ?? '未选择'}
                  />
                  <StatusRow
                    label="已选服装"
                    value={selectedOutfit?.name ?? '未选择'}
                  />
                  <StatusRow
                    label="预览引用"
                    value={
                      designedPortraitUrl && isDesignedPortraitConfirmed
                        ? '后续生成会优先参考这张预览'
                        : '还未生成预览'
                    }
                  />
                </div>

                {previewError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {previewError}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep('upload')}
          className="px-6 py-3 text-gray-400 transition-colors hover:text-white"
        >
          上一步
        </button>
        <button
          onClick={() => {
            if (!canContinue) {
              alert('请先上传正面照，并选择发型和服装')
              return
            }
            setCurrentStep('select')
          }}
          disabled={!canContinue}
          className={cn(
            'rounded-xl px-8 py-3 font-semibold transition-all',
            canContinue
              ? 'bg-primary-600 text-white hover:bg-primary-500'
              : 'cursor-not-allowed bg-gray-700 text-gray-500'
          )}
        >
          下一步：选择模板
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-black/20 px-3 py-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-white">{value ?? '未选择'}</span>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  )
}

function DesignCard({
  title,
  subtitle,
  description,
  imageUrl,
  tags,
  selected,
  onClick,
}: {
  title: string
  subtitle: string
  description: string
  imageUrl: string
  tags: string[]
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border-2 bg-dark-100/50 text-left transition-all',
        selected
          ? 'border-primary-500 shadow-lg shadow-primary-500/15'
          : 'border-transparent hover:border-white/20'
      )}
    >
      <div className="aspect-[4/5] overflow-hidden bg-dark-200">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
          {selected && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500">
              <Check className="h-4 w-4 text-white" />
            </span>
          )}
        </div>
        <p className="mt-2 min-h-[40px] text-sm text-gray-400">
          {description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}
