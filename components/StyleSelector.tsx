'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { poseStyles, sceneTemplates } from '@/lib/data'
import { PoseStyle, SceneTemplate } from '@/lib/types'

interface StyleSelectorProps {
  onComplete?: () => void
}

export default function StyleSelector({ onComplete }: StyleSelectorProps) {
  const {
    selectedStyleId,
    selectedSceneId,
    hairEnhancementEnabled,
    hairEnhancementStrength,
    faceRetouchEnabled,
    ageTarget,
    setSelectedStyleId,
    setSelectedSceneId,
    setHairEnhancementEnabled,
    setHairEnhancementStrength,
    setFaceRetouchEnabled,
    setAgeTarget,
  } = useAppStore()
  const [activeTab, setActiveTab] = useState<'style' | 'scene'>('style')

  const selectedStyle = poseStyles.find((s) => s.id === selectedStyleId)
  const selectedScene = sceneTemplates.find((s) => s.id === selectedSceneId)

  // 风格必须选，场景可选（默认使用第一个）
  const canGenerate = !!selectedStyleId

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          选择风格和场景
        </h2>
        <p className="text-gray-400">
          AI 会根据你的选择生成最适合的照片
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl bg-dark-100">
          <button
            onClick={() => setActiveTab('style')}
            className={cn(
              'px-6 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'style'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            姿势风格
          </button>
          <button
            onClick={() => setActiveTab('scene')}
            className={cn(
              'px-6 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'scene'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            场景模板
          </button>
        </div>
      </div>

      {/* Style grid */}
      {activeTab === 'style' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          {poseStyles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              selected={selectedStyleId === style.id}
              onClick={() => setSelectedStyleId(style.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Scene grid */}
      {activeTab === 'scene' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          {sceneTemplates.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              selected={selectedSceneId === scene.id}
              onClick={() => setSelectedSceneId(scene.id)}
            />
          ))}
        </motion.div>
      )}

      {/* AI Recommendation banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-xl p-4 mb-8 border border-primary-500/30"
      >
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-primary-400" />
          <div>
            <p className="text-sm font-medium text-white">
              智能推荐已准备就绪
            </p>
            <p className="text-xs text-gray-400">
              基于你上传的照片，AI 会自动匹配风格组合，并对发型与人像细节做克制优化
            </p>
          </div>
        </div>
      </motion.div>

      <div className="bg-dark-100/50 rounded-xl p-4 mb-8 border border-white/10">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-white">年龄感控制</p>
            <p className="text-xs text-gray-400 mt-1 mb-2">
              统一控制发型优化和人像轻修复的年轻化目标，避免局部修太多或风格不一致。
            </p>
            <div className="inline-flex rounded-lg bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setAgeTarget('realistic')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-colors',
                  ageTarget === 'realistic'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                真实
              </button>
              <button
                type="button"
                onClick={() => setAgeTarget('slightly-younger')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-colors',
                  ageTarget === 'slightly-younger'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                略年轻
              </button>
              <button
                type="button"
                onClick={() => setAgeTarget('younger')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-colors',
                  ageTarget === 'younger'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                明显年轻
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">发型年轻化优化</p>
              <p className="text-xs text-gray-400 mt-1">
                自动判断发际线、发量和脸型。若偏秃或发际线偏高，会做自然修复，并按当前氛围与脸型调整发型。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHairEnhancementEnabled(!hairEnhancementEnabled)}
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors shrink-0',
                hairEnhancementEnabled ? 'bg-primary-500' : 'bg-gray-600'
              )}
              aria-pressed={hairEnhancementEnabled}
            >
              <span
                className={cn(
                  'absolute top-1 h-5 w-5 rounded-full bg-white transition-transform',
                  hairEnhancementEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {hairEnhancementEnabled && (
            <div>
              <p className="text-xs text-gray-400 mb-2">发型优化强度</p>
              <div className="inline-flex rounded-lg bg-black/20 p-1">
                <button
                  type="button"
                  onClick={() => setHairEnhancementStrength('natural')}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md transition-colors',
                    hairEnhancementStrength === 'natural'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  自然
                </button>
                <button
                  type="button"
                  onClick={() => setHairEnhancementStrength('noticeable')}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md transition-colors',
                    hairEnhancementStrength === 'noticeable'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  明显
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-sm font-medium text-white">人像轻修复</p>
              <p className="text-xs text-gray-400 mt-1">
                轻微优化眼袋、法令纹和肤色暗沉，让人更精神，但保留真实皮肤纹理与年龄感。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFaceRetouchEnabled(!faceRetouchEnabled)}
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors shrink-0',
                faceRetouchEnabled ? 'bg-primary-500' : 'bg-gray-600'
              )}
              aria-pressed={faceRetouchEnabled}
            >
              <span
                className={cn(
                  'absolute top-1 h-5 w-5 rounded-full bg-white transition-transform',
                  faceRetouchEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Selected preview */}
      {(selectedStyle || selectedScene) && (
        <div className="bg-dark-100/50 rounded-xl p-4 mb-8">
          <h4 className="text-sm font-medium text-gray-400 mb-3">已选择</h4>
          <div className="flex flex-wrap gap-3">
            {selectedStyle && (
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-500/20 border border-primary-500/50">
                <span className="text-lg">{selectedStyle.icon}</span>
                <span className="text-sm text-white">{selectedStyle.name}</span>
              </div>
            )}
            {selectedScene && (
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50">
                <span className="text-sm text-white">{selectedScene.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => useAppStore.getState().setCurrentStep('upload')}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
        >
          上一步
        </button>
        <button
          onClick={() => {
            // 风格必须选，场景可选（没选场景时自动用第一个）
            if (!selectedStyleId) {
              alert('请选择一个姿势风格')
              return
            }
            // 如果没选场景，自动选择第一个
            if (!selectedSceneId) {
              setSelectedSceneId(sceneTemplates[0].id)
            }
            useAppStore.getState().setCurrentStep('generate')
            onComplete?.()
          }}
          disabled={!canGenerate}
          className={cn(
            'px-8 py-3 rounded-xl font-semibold transition-all',
            canGenerate
              ? 'bg-primary-600 hover:bg-primary-500 text-white animate-pulse-glow'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          )}
        >
          开始生成
        </button>
      </div>
    </div>
  )
}

function StyleCard({
  style,
  selected,
  onClick,
}: {
  style: PoseStyle
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative p-6 rounded-2xl cursor-pointer transition-all duration-300',
        selected
          ? 'bg-primary-500/20 border-2 border-primary-500'
          : 'bg-dark-100/50 border-2 border-transparent hover:border-white/20'
      )}
    >
      <div className="text-4xl mb-4">{style.icon}</div>
      <h3 className="text-lg font-semibold text-white mb-1">{style.name}</h3>
      <p className="text-sm text-gray-400 mb-3">{style.nameEn}</p>
      <p className="text-sm text-gray-500 line-clamp-2">{style.description}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {style.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  )
}

function SceneCard({
  scene,
  selected,
  onClick,
}: {
  scene: SceneTemplate
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all duration-300',
        selected
          ? 'ring-2 ring-primary-500'
          : 'hover:ring-2 hover:ring-white/20'
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-30">🏙️</span>
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-sm font-semibold text-white mb-1">{scene.name}</h3>
        <div className="flex flex-wrap gap-1">
          {scene.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  )
}
