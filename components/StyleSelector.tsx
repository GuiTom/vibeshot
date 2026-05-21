'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
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
  const canGenerate = !!selectedStyleId && !!selectedSceneId

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          选择拍照姿势和环境模板
        </h2>
        <p className="text-gray-400">
          最后一步不是抽象风格，而是先选人物姿势，再选一张环境模板图。生成时会把模板图里的人替换成你，并尽量保留你已经确认好的服装。
        </p>
      </div>

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
            拍照姿势模板
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
            环境模板图
          </button>
        </div>
      </div>

      {activeTab === 'style' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"
        >
          {poseStyles.map((style) => (
            <PoseTemplateCard
              key={style.id}
              style={style}
              selected={selectedStyleId === style.id}
              onClick={() => setSelectedStyleId(style.id)}
            />
          ))}
        </motion.div>
      )}

      {activeTab === 'scene' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"
        >
          {sceneTemplates.map((scene) => (
            <SceneTemplateCard
              key={scene.id}
              scene={scene}
              selected={selectedSceneId === scene.id}
              onClick={() => setSelectedSceneId(scene.id)}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-xl p-4 mb-8 border border-primary-500/30"
      >
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-primary-400" />
          <div>
            <p className="text-sm font-medium text-white">
              当前生成逻辑会优先做“人物替换”
            </p>
            <p className="text-xs text-gray-400">
              AI 会优先保留模板里的镜头关系、背景、光线和构图，把模板图中的人物替换成你，而不是重新凭空生成一张抽象风格图。
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
                自动判断发际线、发量和脸型。如果偏稀或发际线偏高，会做自然修复，并按模板气质微调发型。
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
                轻微优化疲态和肤色问题，但仍然保留真实质感，不做过度磨皮。
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

      {(selectedStyle || selectedScene) && (
        <div className="bg-dark-100/50 rounded-xl p-4 mb-8">
          <h4 className="text-sm font-medium text-gray-400 mb-3">已选择的替换模板</h4>
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

      <div className="flex items-center justify-between">
        <button
          onClick={() => useAppStore.getState().setCurrentStep('design')}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
        >
          上一步：设计形象
        </button>
        <button
          onClick={() => {
            if (!selectedStyleId || !selectedSceneId) {
              alert('请先选好拍照姿势模板和环境模板图')
              return
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
          下一步：确认替换生成
        </button>
      </div>
    </div>
  )
}

function PoseTemplateCard({
  style,
  selected,
  onClick,
}: {
  style: PoseStyle
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
        'overflow-hidden rounded-2xl border-2 text-left transition-all duration-300',
        selected
          ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/15'
          : 'border-transparent bg-dark-100/50 hover:border-white/20'
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-dark-200">
        <img
          src={style.previewUrl}
          alt={style.name}
          className="h-full w-full object-cover"
        />
        {selected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{style.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">{style.name}</h3>
            <p className="text-sm text-gray-400">{style.nameEn}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-400">{style.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {style.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

function SceneTemplateCard({
  scene,
  selected,
  onClick,
}: {
  scene: SceneTemplate
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
        'overflow-hidden rounded-2xl border-2 text-left transition-all duration-300',
        selected
          ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/15'
          : 'border-transparent bg-dark-100/50 hover:border-white/20'
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-dark-200">
        <img
          src={scene.previewUrl}
          alt={scene.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {selected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-sm font-semibold text-white">{scene.name}</h3>
          <p className="text-xs text-gray-200/80 mt-1">{scene.nameEn}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-400">{scene.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {scene.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}
