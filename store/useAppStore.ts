'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserPhoto, GeneratedPhoto, SavedGeneration, User, Subscription } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { AgeTarget, HairEnhancementStrength } from '@/lib/retouch'

interface AppState {
  // 用户信息
  user: User | null
  setUser: (user: User | null) => void
  
  // 用户上传的照片
  userPhotos: UserPhoto[]
  addUserPhoto: (photo: Omit<UserPhoto, 'id' | 'uploadedAt'>) => void
  removeUserPhoto: (id: string) => void
  clearUserPhotos: () => void
  
  // 选中的风格和场景
  selectedStyleId: string | null
  selectedSceneId: string | null
  hairEnhancementEnabled: boolean
  hairEnhancementStrength: HairEnhancementStrength
  faceRetouchEnabled: boolean
  ageTarget: AgeTarget
  setSelectedStyleId: (id: string | null) => void
  setSelectedSceneId: (id: string | null) => void
  setHairEnhancementEnabled: (enabled: boolean) => void
  setHairEnhancementStrength: (strength: HairEnhancementStrength) => void
  setFaceRetouchEnabled: (enabled: boolean) => void
  setAgeTarget: (target: AgeTarget) => void
  
  // 生成的照片
  generatedPhotos: GeneratedPhoto[]
  addGeneratedPhotos: (photos: GeneratedPhoto[]) => void
  setGeneratedPhotos: (photos: GeneratedPhoto[]) => void
  removeGeneratedPhoto: (id: string) => void
  clearGeneratedPhotos: () => void

  generationHistory: SavedGeneration[]
  setGenerationHistory: (photos: SavedGeneration[]) => void
  clearGenerationHistory: () => void
  
  // 订阅信息
  subscription: Subscription
  useCredit: () => boolean
  resetCredits: () => void
  
  // 当前页面步骤
  currentStep: 'home' | 'upload' | 'select' | 'generate' | 'result'
  setCurrentStep: (step: AppState['currentStep']) => void
  
  // 重置整个流程
  reset: () => void
  resetFlow: () => void
}

const freeSubscription: Subscription = {
  type: 'free',
  remainingCredits: 3,
  totalCredits: 3,
  expiresAt: null,
}

const initialUser: User = {
  id: 'guest',
  createdAt: new Date(),
  subscription: freeSubscription,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户信息
      user: initialUser,
      setUser: (user) => set({ user }),

      // 用户照片
      userPhotos: [],
      addUserPhoto: (photo) =>
        set((state) => ({
          userPhotos: [
            ...state.userPhotos,
            {
              ...photo,
              id: generateId(),
              uploadedAt: new Date(),
            },
          ],
        })),
      removeUserPhoto: (id) =>
        set((state) => ({
          userPhotos: state.userPhotos.filter((p) => p.id !== id),
        })),
      clearUserPhotos: () => set({ userPhotos: [] }),

      // 选中的风格和场景
      selectedStyleId: null,
      selectedSceneId: null,
      hairEnhancementEnabled: true,
      hairEnhancementStrength: 'natural',
      faceRetouchEnabled: true,
      ageTarget: 'slightly-younger',
      setSelectedStyleId: (id) => set({ selectedStyleId: id }),
      setSelectedSceneId: (id) => set({ selectedSceneId: id }),
      setHairEnhancementEnabled: (enabled) =>
        set({ hairEnhancementEnabled: enabled }),
      setHairEnhancementStrength: (strength) =>
        set({ hairEnhancementStrength: strength }),
      setFaceRetouchEnabled: (enabled) =>
        set({ faceRetouchEnabled: enabled }),
      setAgeTarget: (target) => set({ ageTarget: target }),

      // 生成的照片
      generatedPhotos: [],
      addGeneratedPhotos: (photos) =>
        set((state) => ({
          generatedPhotos: [...state.generatedPhotos, ...photos],
        })),
      setGeneratedPhotos: (photos) => set({ generatedPhotos: photos }),
      removeGeneratedPhoto: (id) =>
        set((state) => ({
          generatedPhotos: state.generatedPhotos.filter((p) => p.id !== id),
        })),
      clearGeneratedPhotos: () => set({ generatedPhotos: [] }),
      generationHistory: [],
      setGenerationHistory: (photos) => set({ generationHistory: photos }),
      clearGenerationHistory: () => set({ generationHistory: [] }),

      // 订阅
      subscription: freeSubscription,
      useCredit: () => {
        const { subscription } = get()
        if (subscription.remainingCredits > 0) {
          set({
            subscription: {
              ...subscription,
              remainingCredits: subscription.remainingCredits - 1,
            },
          })
          return true
        }
        return false
      },
      resetCredits: () =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            remainingCredits: state.subscription.totalCredits,
          },
        })),

      // 步骤
      currentStep: 'home',
      setCurrentStep: (step) => set({ currentStep: step }),

      // 重置
      reset: () =>
        set({
          user: initialUser,
          subscription: freeSubscription,
          userPhotos: [],
          selectedStyleId: null,
          selectedSceneId: null,
          hairEnhancementEnabled: true,
          hairEnhancementStrength: 'natural',
          faceRetouchEnabled: true,
          ageTarget: 'slightly-younger',
          generatedPhotos: [],
          generationHistory: [],
          currentStep: 'home',
        }),
      resetFlow: () =>
        set({
          userPhotos: [],
          selectedStyleId: null,
          selectedSceneId: null,
          hairEnhancementEnabled: true,
          hairEnhancementStrength: 'natural',
          faceRetouchEnabled: true,
          ageTarget: 'slightly-younger',
          generatedPhotos: [],
          currentStep: 'home',
        }),
    }),
    {
      name: 'vibeshot-storage',
      // 只保存订阅信息，不保存照片数据（照片数据太大）
      partialize: (state) => ({
        subscription: state.subscription,
        user: state.user,
        hairEnhancementEnabled: state.hairEnhancementEnabled,
        hairEnhancementStrength: state.hairEnhancementStrength,
        faceRetouchEnabled: state.faceRetouchEnabled,
        ageTarget: state.ageTarget,
      }),
    }
  )
)
