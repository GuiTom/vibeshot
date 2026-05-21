'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Shield, Camera } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/store/useAppStore'

const features = [
  {
    icon: Camera,
    title: '姿势智能推荐',
    description: 'AI 分析你的特征，推荐最适合你的姿势和风格',
  },
  {
    icon: Sparkles,
    title: '人物一致性',
    description: '上传几张照片，AI 学习你的特征，生成保持一致性的照片',
  },
  {
    icon: Zap,
    title: '秒级生成',
    description: '30 秒内生成高质量照片，无需等待',
  },
  {
    icon: Shield,
    title: '隐私安全',
    description: '本地处理，仅存储特征向量，保护你的隐私',
  },
]

export default function Hero() {
  const { setCurrentStep } = useAppStore()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-300 via-dark-200 to-dark-300" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary-400 mr-2" />
            <span className="text-sm text-primary-300">AI 驱动的形象升级</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6"
          >
            <span className="text-white">让每个男生都能</span>
            <br />
            <span className="gradient-text">拍出帅气照片</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            不会摆 pose？不知道什么角度帅？VibeShot 让 AI 成为你的私人摄影师，
            一键生成专业级人物照片
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => {
                setCurrentStep('upload')
              }}
              className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-semibold text-lg transition-all duration-300 animate-pulse-glow flex items-center"
            >
              {isAuthenticated ? '立即免费生成' : '先体验生成流程'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-gray-500 text-sm">免费生成 3 张照片</span>
          </motion.div>

          {/* Demo preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 glass">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-4 p-8">
                    <div className="aspect-square rounded-xl bg-dark-100 border border-white/10 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-500" />
                      </div>
                    </div>
                    <div className="aspect-square rounded-xl bg-dark-100 border border-primary-500/50 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-primary-600/30 to-primary-700/30 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-primary-400" />
                      </div>
                    </div>
                    <div className="aspect-square rounded-xl bg-dark-100 border border-white/10 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">
                    上传照片 → 选择风格 → 生成专业照片
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="p-6 rounded-2xl bg-dark-100/50 border border-white/5 hover:border-primary-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
