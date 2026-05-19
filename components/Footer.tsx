'use client'

import { Camera, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-12 bg-dark-200 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              VibeShot
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              关于我们
            </a>
            <a href="#" className="hover:text-white transition-colors">
              使用条款
            </a>
            <a href="#" className="hover:text-white transition-colors">
              隐私政策
            </a>
            <a href="#" className="hover:text-white transition-colors">
              联系客服
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 mx-1" />
            <span>by VibeShot Team</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
          © 2026 VibeShot. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
