'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { getStyleById, getSceneById } from '@/lib/data'
import { GeneratedPhoto } from '@/lib/types'
import { generateId } from '@/lib/utils'

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
    addGeneratedPhotos,
    setGenerationHistory,
    generationHistory,
    setCurrentStep,
    user,
    hairEnhancementEnabled,
    hairEnhancementStrength,
    faceRetouchEnabled,
    ageTarget,
  } = useAppStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectedStyle = getStyleById(selectedStyleId || '')
  const selectedScene = getSceneById(selectedSceneId || '')

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

  // Generate photo using OpenAI GPT Image API
  const generatePhotos = async () => {
    if (!selectedStyle || !selectedScene) return

    if (!useCredit()) {
      setError('生成次数已用完，请升级套餐')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError(null)

    try {
      // Step 1: 获取用户照片
      setStatus('正在分析照片...')
      setProgress(10)
      const sortedPhotos = [...userPhotos].sort(
        (a, b) => photoPriority[a.type] - photoPriority[b.type]
      )

      if (sortedPhotos.length === 0) {
        throw new Error('请先上传正脸照')
      }

      // Step 2: 构建 prompt - 使用详细参数
      setStatus('正在构建生成指令...')
      setProgress(20)
      
      const style = selectedStyle!
      const scene = selectedScene!
      
      // 构建详细 prompt
      const prompt = [
        'Use the uploaded reference image as the same real person to transform.',
        'Keep the same identity, facial structure, hairstyle, skin tone, and recognizability.',
        'Do not replace the person with a different model.',
        'Create a realistic professional portrait with clean lighting, premium composition, and natural skin detail.',
        style.parameters.pose + ',',
        style.parameters.expression + ',',
        scene.name + ',',
        style.parameters.composition + ',',
      ].join(' ')

      // Step 3: 获取图片 base64
      setStatus('正在压缩参考图...')
      setProgress(30)
      const selectedReferencePhotos = sortedPhotos.slice(0, 1)
      const referencePhotos = await Promise.all(
        selectedReferencePhotos.map(async (photo) => ({
          type: photo.type,
          dataUrl: await compressImage(photo.url),
        }))
      )

      // Step 4: 调用 API
      setStatus('正在调用 GPT Image 生成...')
      setProgress(50)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          userPhoto: referencePhotos[0]?.dataUrl,
          userPhotos: referencePhotos,
          styleId: selectedStyleId,
          sceneId: selectedSceneId,
          hairEnhancementEnabled,
          hairEnhancementStrength,
          faceRetouchEnabled,
          ageTarget,
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

      // Step 5: 完成
      setStatus('正在处理结果...')
      setProgress(90)

      const photos: GeneratedPhoto[] = [{
        id: data.data.id || generateId(),
        userId: user?.id || 'guest',
        styleId: selectedStyleId!,
        sceneId: selectedSceneId!,
        imageUrl: data.data.imageUrl,
        thumbnailUrl: data.data.thumbnailUrl,
        createdAt: new Date(data.data.createdAt || Date.now()),
        prompt: data.data.prompt || prompt,
      }]

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
      setStatus('完成！')

      setTimeout(() => {
        setIsGenerating(false)
        setCurrentStep('result')
        onComplete?.()
      }, 500)

    } catch (err: any) {
      console.error('Generation error:', err)
      setError(err.message || '生成失败，请重试')
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          AI 正在生成你的照片
        </h2>
        <p className="text-gray-400">
          预计需要 30~60 秒，请耐心等待...
        </p>
      </div>

      {/* Preview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Style preview */}
        <div className="bg-dark-100/50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-400 mb-4">姿势风格</h4>
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

        {/* Scene preview */}
        <div className="bg-dark-100/50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-400 mb-4">场景模板</h4>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
              🏙️
            </div>
            <div>
              <p className="font-semibold text-white">{selectedScene?.name}</p>
              <p className="text-sm text-gray-400">{selectedScene?.nameEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded photos */}
      <div className="bg-dark-100/50 rounded-xl p-6 mb-8">
        <h4 className="text-sm font-medium text-gray-400 mb-4">已上传照片</h4>
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

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8"
        >
          <p className="text-center text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Generation progress */}
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

      {/* Generate button */}
      {!isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-4">
            当前剩余生成次数:{' '}
            <span className="text-primary-400 font-semibold">
              {subscription.remainingCredits}
            </span>
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
            开始生成
          </button>
        </motion.div>
      )}

      {/* Back button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setCurrentStep('select')}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center mx-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回修改风格
        </button>
      </div>
    </div>
  )
}
