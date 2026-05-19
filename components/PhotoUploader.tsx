'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Camera, User, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { UserPhoto } from '@/lib/types'

interface PhotoUploaderProps {
  onComplete?: () => void
}

const photoTypes = [
  { id: 'front', label: '正脸照', icon: User, required: true, description: '光线均匀，正面视角（必填）' },
  { id: 'half', label: '半身照', icon: User, required: false, description: '展示体型轮廓（可选）' },
  { id: 'side-left', label: '左侧脸', icon: User, required: false, description: '展示面部立体感（可选）' },
  { id: 'side-right', label: '右侧脸', icon: User, required: false, description: '展示面部立体感（可选）' },
  { id: 'full', label: '全身照', icon: Camera, required: false, description: '展示整体比例（可选）' },
]

export default function PhotoUploader({ onComplete }: PhotoUploaderProps) {
  const { userPhotos, addUserPhoto, removeUserPhoto } = useAppStore()
  const [draggingType, setDraggingType] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent, typeId: string) => {
    e.preventDefault()
    setDraggingType(typeId)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDraggingType(null)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, typeId: string) => {
      e.preventDefault()
      setDraggingType(null)

      const file = e.dataTransfer.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过 10MB')
        return
      }

      const url = URL.createObjectURL(file)
      addUserPhoto({
        url,
        type: typeId as UserPhoto['type'],
      })
    },
    [addUserPhoto]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, typeId: string) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过 10MB')
        return
      }

      const url = URL.createObjectURL(file)
      addUserPhoto({
        url,
        type: typeId as UserPhoto['type'],
      })
    },
    [addUserPhoto]
  )

  const getPhotosByType = (type: string) => {
    return userPhotos.filter((p) => p.type === type)
  }

  const requiredTypes = photoTypes.filter((t) => t.required)
  const allRequiredUploaded = requiredTypes.every((t) => getPhotosByType(t.id).length > 0)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          上传你的照片
        </h2>
        <p className="text-gray-400">
          上传你的正脸照即可开始，照片越多 AI 越了解你的特征，生成效果越好
        </p>
      </div>

      {/* Photo type grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {photoTypes.map((type) => {
          const photos = getPhotosByType(type.id)
          const Icon = type.icon
          const isUploaded = photos.length > 0
          const isDragging = draggingType === type.id

          return (
            <motion.div
              key={type.id}
              layout
              onDragOver={(e) => handleDragOver(e, type.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, type.id)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all cursor-pointer',
                isDragging
                  ? 'border-primary-500 bg-primary-500/20 scale-[1.02]'
                  : isUploaded
                  ? 'border-primary-500 bg-primary-500/10'
                  : type.required
                  ? 'border-dashed border-gray-600 hover:border-gray-500'
                  : 'border-dashed border-gray-700 hover:border-gray-600'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {isUploaded ? (
                    <Check className="w-5 h-5 text-primary-400" />
                  ) : (
                    <Icon className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-medium text-white">{type.label}</span>
                </div>
                {type.required ? (
                  <span className="text-xs text-red-400">必填</span>
                ) : (
                  <span className="text-xs text-gray-500">可选</span>
                )}
              </div>

              {/* Photo grid */}
              {isUploaded ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark-200 group"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeUserPhoto(photo.id)
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Add more indicator */}
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-gray-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, type.id)}
                      className="hidden"
                      id={`upload-${type.id}`}
                    />
                    <label
                      htmlFor={`upload-${type.id}`}
                      className="cursor-pointer flex items-center justify-center space-x-2 text-sm text-gray-400 hover:text-gray-300"
                    >
                      <Upload className="w-4 h-4" />
                      <span>拖拽或点击添加更多</span>
                    </label>
                  </div>
                </div>
              ) : (
                /* Upload area */
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">{type.description}</p>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors bg-dark-100/30">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, type.id)}
                      className="hidden"
                      id={`upload-${type.id}`}
                    />
                    <label
                      htmlFor={`upload-${type.id}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">拖拽或点击上传</span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="bg-dark-100/50 rounded-xl p-4 mb-8">
        <h4 className="font-medium text-white mb-2">使用说明</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <span className="text-primary-400">只需上传正脸照</span>，其他照片可选</li>
          <li>• 缺少的照片 AI 会按标准男性特征帮你补充</li>
          <li>• 上传越多照片，生成效果越精准</li>
          <li>• 照片越清晰、角度越多，效果越好</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => useAppStore.getState().setCurrentStep('home')}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
        >
          上一步
        </button>
        <button
          onClick={() => {
            const currentPhotos = useAppStore.getState().userPhotos
            const frontPhotos = currentPhotos.filter(p => p.type === 'front')
            if (frontPhotos.length > 0) {
              useAppStore.getState().setCurrentStep('select')
              onComplete?.()
            } else {
              alert('请上传正脸照')
            }
          }}
          className="px-8 py-3 rounded-xl font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all"
        >
          下一步：选择风格
        </button>
      </div>
    </div>
  )
}
