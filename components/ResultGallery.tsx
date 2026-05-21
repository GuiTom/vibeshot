'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, Trash2, RotateCcw, ChevronLeft, ChevronRight, X, Check, Camera } from 'lucide-react'
import { cn, downloadImage, formatRelativeTime } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { GeneratedPhoto } from '@/lib/types'
import { getStyleById, getSceneById } from '@/lib/data'

interface ResultGalleryProps {
  onComplete?: () => void
}

export default function ResultGallery({ onComplete }: ResultGalleryProps) {
  const {
    generatedPhotos,
    removeGeneratedPhoto,
    setCurrentStep,
    reset,
    subscription,
  } = useAppStore()

  const [selectedPhoto, setSelectedPhoto] = useState<GeneratedPhoto | null>(null)
  const [downloading, setDownloading] = useState(false)

  const latestPhotos = [...generatedPhotos].reverse()

  const handleDownload = async (photo: GeneratedPhoto) => {
    setDownloading(true)
    try {
      await downloadImage(photo.imageUrl, `vibeshot-${photo.id}.jpg`)
    } catch (error) {
      console.error('Download failed:', error)
    }
    setDownloading(false)
  }

  const handleShare = async (photo: GeneratedPhoto) => {
    try {
      if (navigator.share) {
        const response = await fetch(photo.imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'vibeshot-photo.jpg', { type: 'image/jpeg' })

        await navigator.share({
          title: 'VibeShot - AI 生成照片',
          text: '用 VibeShot AI 生成的高质量人物照片',
          files: [file],
        })
      } else {
        // Fallback: copy image URL
        await navigator.clipboard.writeText(photo.imageUrl)
        alert('图片链接已复制到剪贴板')
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const handleNewGeneration = () => {
    if (subscription.remainingCredits > 0) {
      setCurrentStep('select')
      onComplete?.()
    } else {
      alert('生成次数已用完，请升级套餐')
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          照片生成成功！
        </h2>
        <p className="text-gray-400">
          你的 AI 形象照片已准备就绪
        </p>
      </div>

      {/* Photo grid */}
      {latestPhotos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {latestPhotos.map((photo, index) => {
            const style = getStyleById(photo.styleId)
            const scene = getSceneById(photo.sceneId)

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-100"
              >
                <img
                  src={photo.imageUrl}
                  alt="Generated photo"
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleDownload(photo)}
                      disabled={downloading}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleShare(photo)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => removeGeneratedPhoto(photo.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {style && (
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-500/80 text-white">
                      {style.icon} {style.name}
                    </span>
                  )}
                  {scene && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-500/80 text-white">
                      {scene.name}
                    </span>
                  )}
                </div>

                {/* View full */}
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
                    点击查看大图
                  </span>
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">暂无生成记录</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleNewGeneration}
          className={cn(
            'px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center',
            subscription.remainingCredits > 0
              ? 'bg-primary-600 hover:bg-primary-500 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          继续生成
        </button>
        <button
          onClick={reset}
          className="px-8 py-4 rounded-xl font-semibold text-lg bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          重新开始
        </button>
      </div>

      {/* Remaining credits */}
      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          剩余生成次数:{' '}
          <span className={cn(
            'font-semibold',
            subscription.remainingCredits > 0 ? 'text-primary-400' : 'text-red-400'
          )}>
            {subscription.remainingCredits}
          </span>
        </p>
      </div>

      {/* Photo lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedPhoto.imageUrl}
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(selectedPhoto)
                }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                下载
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare(selectedPhoto)
                }}
                className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white flex items-center transition-colors"
              >
                <Share2 className="w-5 h-5 mr-2" />
                分享
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
