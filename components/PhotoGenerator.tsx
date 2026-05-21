'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import { cn, generateId } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { getStyleById, getSceneById } from '@/lib/data'
import { getHairstyleById, getOutfitById } from '@/lib/design'
import { GeneratedPhoto } from '@/lib/types'

interface PhotoGeneratorProps {
  onComplete?: () => void
}

export default function PhotoGenerator({ onComplete }: PhotoGeneratorProps) {
  const {
    userPhotos,
    selectedStyleId,
    selectedSceneId,
    subscription,
    useCredit,
    refundCredit,
    setSubscription,
    addGeneratedPhotos,
    setGenerationHistory,
    generationHistory,
    setCurrentStep,
    user,
    hairEnhancementEnabled,
    hairEnhancementStrength,
    faceRetouchEnabled,
    ageTarget,
    selectedHairstyleId,
    selectedOutfitId,
  } = useAppStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectedStyle = getStyleById(selectedStyleId || '')
  const selectedScene = getSceneById(selectedSceneId || '')
  const selectedHairstyle = getHairstyleById(selectedHairstyleId)
  const selectedOutfit = getOutfitById(selectedOutfitId)

  const photoPriority = {
    front: 0,
    'side-left': 1,
    'side-right': 2,
    half: 3,
    full: 4,
  } as const

  const compressImage = async (url: string): Promise<string> => {
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
      throw new Error('图片压缩失败')
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    return canvas.toDataURL('image/jpeg', 0.82)
  }

  const generatePhotos = async () => {
    if (!selectedStyle || !selectedScene) {
      return
    }

    const shouldUseLocalCredit = !user || user.id === 'guest'
    let creditConsumed = false

    if (shouldUseLocalCredit && !useCredit()) {
      setError('生成次数已用完，请升级套餐')
      return
    }
    creditConsumed = shouldUseLocalCredit

    setIsGenerating(true)
    setProgress(0)
    setError(null)

    try {
      setStatus('正在分析参考照片...')
      setProgress(10)

      const sortedPhotos = [...userPhotos].sort(
        (a, b) => photoPriority[a.type] - photoPriority[b.type]
      )

      if (sortedPhotos.length === 0) {
        throw new Error('请先上传正面照')
      }

      setStatus('正在构建人物替换指令...')
      setProgress(20)

      const style = selectedStyle
      const scene = selectedScene
      const hairstyle = selectedHairstyle
      const outfit = selectedOutfit

      const prompt = [
        'Use the uploaded reference image as the same real person to transform.',
        'Keep the same identity, facial structure, skin tone, and recognizability.',
        'Do not replace the person with a different model.',
        'This is a template-person-replacement task, not an abstract style generation task.',
        'First preserve the same real person and refine him using the selected hairstyle direction.',
        hairstyle
          ? `Selected hairstyle direction: ${hairstyle.nameEn}. ${hairstyle.prompt}.`
          : 'Keep a natural, flattering, realistic hairstyle.',
        outfit
          ? `Keep the current clothing consistent with the user-approved outfit direction: ${outfit.nameEn}. ${outfit.prompt}.`
          : 'Keep the current outfit realistic, tasteful, and unchanged in spirit.',
        'Then replace only the person inside the selected environment template photo.',
        'Preserve the environment template itself, including background, camera angle, crop, perspective, lighting mood, and scene composition as much as possible.',
        'Follow the selected pose template so the new person matches the same stance, body orientation, gesture, and framing naturally.',
        'Do not redesign the wardrobe from scratch and do not swap into unrelated garments.',
        'The result should look like the same real person was photographed directly inside that exact template image setup.',
        `Selected pose template: ${style.nameEn}. Pose direction: ${style.parameters.pose}.`,
        `Expression direction: ${style.parameters.expression}.`,
        `Gesture direction: ${style.parameters.gesture}.`,
        `Environment template: ${scene.nameEn}.`,
        `Composition direction: ${style.parameters.composition}.`,
      ].join(' ')

      setStatus('正在压缩参考图...')
      setProgress(30)

      const referencePhotos = await Promise.all(
        sortedPhotos.slice(0, 1).map(async (photo) => ({
          type: photo.type,
          dataUrl: await compressImage(photo.url),
        }))
      )

      setStatus('正在调用 GPT Image 执行人物替换...')
      setProgress(50)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userPhoto: referencePhotos[0]?.dataUrl,
          userPhotos: referencePhotos,
          styleId: selectedStyleId,
          sceneId: selectedSceneId,
          hairEnhancementEnabled,
          hairEnhancementStrength,
          faceRetouchEnabled,
          ageTarget,
          appearanceDesign: {
            hairstyleId: selectedHairstyleId,
            hairstyleName: selectedHairstyle?.nameEn,
            hairstylePrompt: selectedHairstyle?.prompt,
            outfitId: selectedOutfitId,
            outfitName: selectedOutfit?.nameEn,
            outfitPrompt: selectedOutfit?.prompt,
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

      if (!response.ok && response.status === 504) {
        throw new Error(data?.error || '生成超时，请重试')
      }

      if (!response.ok) {
        const htmlSnippet = rawText
          .replace(/\s+/g, ' ')
          .slice(0, 200)
          .trim()

        throw new Error(
          data?.error ||
            (isJsonResponse
              ? '生成失败'
              : `服务返回了非 JSON 错误页面：${response.status} ${response.statusText}${htmlSnippet ? ` - ${htmlSnippet}` : ''}`)
        )
      }

      if (!data) {
        throw new Error('服务返回了非 JSON 响应，请稍后重试')
      }

      if (data?.data?.subscription) {
        setSubscription({
          ...data.data.subscription,
          expiresAt: data.data.subscription.expiresAt
            ? new Date(data.data.subscription.expiresAt)
            : null,
        })
      }

      setStatus('正在处理生成结果...')
      setProgress(90)

      const photos: GeneratedPhoto[] = [
        {
          id: data.data.id || generateId(),
          userId: user?.id || 'guest',
          styleId: selectedStyleId!,
          sceneId: selectedSceneId!,
          imageUrl: data.data.imageUrl,
          thumbnailUrl: data.data.thumbnailUrl,
          createdAt: new Date(data.data.createdAt || Date.now()),
          prompt: data.data.prompt || prompt,
        },
      ]

      addGeneratedPhotos(photos)

      if (data.data.id) {
        setGenerationHistory([
          {
            ...photos[0],
            updatedAt: new Date(data.data.createdAt || Date.now()),
          },
          ...generationHistory.filter((item) => item.id !== data.data.id),
        ])
      }

      setProgress(100)
      setStatus('完成')

      setTimeout(() => {
        setIsGenerating(false)
        setCurrentStep('result')
        onComplete?.()
      }, 500)
    } catch (err: any) {
      if (creditConsumed) {
        refundCredit()
      }
      console.error('Generation error:', err)
      setError(err.message || '生成失败，请重试')
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          AI 正在替换模板人物并生成最终照片
        </h2>
        <p className="text-gray-400">
          这一步会尽量保留模板图里的机位、背景、环境和构图，只把人物替换成你。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-100/50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-400 mb-4">已确认的人物形象</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-lg bg-dark-200">
              {selectedHairstyle?.referenceUrl && (
                <img
                  src={selectedHairstyle.referenceUrl}
                  alt={selectedHairstyle.name}
                  className="h-28 w-full object-cover"
                />
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-white">
                  {selectedHairstyle?.name ?? '默认发型'}
                </p>
                <p className="text-xs text-gray-400">发型方向</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-dark-200">
              {selectedOutfit?.referenceUrl && (
                <img
                  src={selectedOutfit.referenceUrl}
                  alt={selectedOutfit.name}
                  className="h-28 w-full object-cover"
                />
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-white">
                  {selectedOutfit?.name ?? '默认服装'}
                </p>
                <p className="text-xs text-gray-400">服装方向</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-100/50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-400 mb-4">拍照姿势模板</h4>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-primary-500/20 flex items-center justify-center text-3xl">
              {selectedStyle?.icon}
            </div>
            <div>
              <p className="font-semibold text-white">{selectedStyle?.name}</p>
              <p className="text-sm text-gray-400">{selectedStyle?.nameEn}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-100/50 rounded-xl p-6 md:col-span-2">
          <h4 className="text-sm font-medium text-gray-400 mb-4">环境模板图</h4>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl">
              场
            </div>
            <div>
              <p className="font-semibold text-white">{selectedScene?.name}</p>
              <p className="text-sm text-gray-400">{selectedScene?.nameEn}</p>
              <p className="text-xs text-gray-500 mt-1">
                生成时会尽量保留这张模板图的背景、透视、光线和构图，只替换里面的人物。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-100/50 rounded-xl p-6 mb-8">
        <h4 className="text-sm font-medium text-gray-400 mb-4">上传的参考照片</h4>
        <div className="flex justify-center space-x-4">
          {userPhotos.slice(0, 4).map((photo) => (
            <div
              key={photo.id}
              className="w-20 h-20 rounded-lg overflow-hidden bg-dark-200"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8"
        >
          <p className="text-center text-red-400">{error}</p>
        </motion.div>
      )}

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-100/50 rounded-xl p-8 mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
          <p className="text-center text-white mb-4">{status}</p>
          <div className="w-full bg-dark-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
            />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            {progress}%
          </p>
        </motion.div>
      )}

      {!isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-2">
            当前剩余生成次数：
            <span className="text-primary-400 font-semibold">
              {subscription.remainingCredits}
            </span>
          </p>
          <p className="mb-4 text-xs text-gray-500">
            最终生成会优先做“模板图里的人物替换”，不是重新随机构图或重新设计整套服装。
          </p>
          <button
            onClick={generatePhotos}
            className={cn(
              'px-8 py-4 rounded-xl font-semibold text-lg transition-all',
              'bg-gradient-to-r from-primary-600 to-primary-500',
              'hover:from-primary-500 hover:to-primary-400',
              'text-white shadow-lg shadow-primary-500/25',
              'flex items-center mx-auto'
            )}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            开始替换生成
          </button>
        </motion.div>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={() => setCurrentStep('design')}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回修改形象
        </button>
        <button
          onClick={() => setCurrentStep('select')}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回修改模板
        </button>
      </div>
    </div>
  )
}
