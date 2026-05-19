'use client'

import { motion } from 'framer-motion'
import { PoseStyle } from '@/lib/types'
import { poseStyles, sceneTemplates } from '@/lib/data'
import { cn } from '@/lib/utils'

interface StyleCardProps {
  style: PoseStyle
  selected: boolean
  onClick: () => void
}

function StyleCard({ style, selected, onClick }: StyleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative p-6 rounded-2xl cursor-pointer transition-all duration-300',
        selected
          ? 'bg-primary-500/20 border-2 border-primary-500'
          : 'bg-dark-100/50 border border-white/5 hover:border-white/20'
      )}
    >
      <div className="text-4xl mb-4">{style.icon}</div>
      <h3 className="text-lg font-semibold text-white mb-1">{style.name}</h3>
      <p className="text-sm text-gray-400 mb-3">{style.nameEn}</p>
      <p className="text-sm text-gray-500">{style.description}</p>
      
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
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}

export default function Features() {
  return (
    <section id="styles" className="py-24 bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            6 种专属风格
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            从冷淡感、精英感到阳光男孩，每种风格都经过专业摄影师调研，
            找到最适合你的 pose
          </p>
        </motion.div>

        {/* Style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poseStyles.map((style, index) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <StyleCard style={style} selected={false} onClick={() => {}} />
            </motion.div>
          ))}
        </div>

        {/* Scenes section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <h2 className="text-4xl font-display font-bold text-white mb-4 text-center">
            多样化场景
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto text-center mb-12">
            咖啡馆、街头、写字楼... 预设高质量场景模板，一键应用
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sceneTemplates.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-dark-100 flex items-center justify-center">
                  <span className="text-4xl opacity-30">🏙️</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-medium text-white">{scene.name}</p>
                </div>
                <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/20 transition-colors" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
