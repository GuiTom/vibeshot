'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserPhoto, GeneratedPhoto, SavedGeneration, User, Subscription } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { AgeTarget, HairEnhancementStrength } from '@/lib/retouch'
import { hairstyleOptions, outfitOptions } from '@/lib/design'

interface AppState {
  // 用户信息
  user: User | null
  setUser: (user: User | null) => void
  setSubscription: (subscription: Subscription) => void
  
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

  selectedHairstyleId: string | null
  selectedOutfitId: string | null
  designedPortraitUrl: string | null
  designedPortraitPrompt: string | null
  isDesignedPortraitConfirmed: boolean
  setSelectedHairstyleId: (id: string | null) => void
  setSelectedOutfitId: (id: string | null) => void
  setDesignedPortrait: (url: string | null, prompt?: string | null) => void
  setDesignedPortraitConfirmed: (confirmed: boolean) => void
  clearDesignedPortrait: () => void
  
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
  refundCredit: () => void
  resetCredits: () => void
  
  // 当前页面步骤
  currentStep: 'home' | 'upload' | 'design' | 'select' | 'generate' | 'result'
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

function toDate(value: unknown, fallback = new Date()) {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return fallback
}

function normalizeSubscription(subscription: any): Subscription {
  return {
    type: subscription?.type ?? 'free',
    remainingCredits: subscription?.remainingCredits ?? freeSubscription.remainingCredits,
    totalCredits: subscription?.totalCredits ?? freeSubscription.totalCredits,
    expiresAt: subscription?.expiresAt ? toDate(subscription.expiresAt) : null,
    status: subscription?.status ?? null,
  }
}

function normalizeUser(user: any): User | null {
  if (!user) {
    return null
  }

  return {
    id: user.id ?? 'guest',
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    avatar: user.avatar ?? undefined,
    createdAt: toDate(user.createdAt),
    subscription: normalizeSubscription(user.subscription),
  }
}

function normalizeUserPhoto(photo: any): UserPhoto {
  return {
    id: photo?.id ?? generateId(),
    url: photo?.url ?? '',
    type: photo?.type ?? 'front',
    uploadedAt: toDate(photo?.uploadedAt),
  }
}

function normalizeGeneratedPhoto(photo: any): GeneratedPhoto {
  return {
    id: photo?.id ?? generateId(),
    userId: photo?.userId ?? 'guest',
    styleId: photo?.styleId ?? '',
    sceneId: photo?.sceneId ?? '',
    imageUrl: photo?.imageUrl ?? '',
    thumbnailUrl: photo?.thumbnailUrl ?? photo?.imageUrl ?? '',
    createdAt: toDate(photo?.createdAt),
    prompt: photo?.prompt ?? '',
  }
}

function normalizeSavedGeneration(photo: any): SavedGeneration {
  return {
    ...normalizeGeneratedPhoto(photo),
    updatedAt: photo?.updatedAt ? toDate(photo.updatedAt) : undefined,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户信息
      user: initialUser,
      setUser: (user) =>
        set((state) => ({
          user,
          subscription: user?.subscription ?? state.subscription,
        })),
      setSubscription: (subscription) =>
        set((state) => ({
          subscription,
          user: state.user
            ? {
                ...state.user,
                subscription,
              }
            : state.user,
        })),

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
      selectedHairstyleId: hairstyleOptions[0]?.id ?? null,
      selectedOutfitId: outfitOptions[0]?.id ?? null,
      designedPortraitUrl: null,
      designedPortraitPrompt: null,
      isDesignedPortraitConfirmed: false,
      setSelectedStyleId: (id) => set({ selectedStyleId: id }),
      setSelectedSceneId: (id) => set({ selectedSceneId: id }),
      setHairEnhancementEnabled: (enabled) =>
        set({ hairEnhancementEnabled: enabled }),
      setHairEnhancementStrength: (strength) =>
        set({ hairEnhancementStrength: strength }),
      setFaceRetouchEnabled: (enabled) =>
        set({ faceRetouchEnabled: enabled }),
      setAgeTarget: (target) => set({ ageTarget: target }),
      setSelectedHairstyleId: (id) =>
        set({
          selectedHairstyleId: id,
          designedPortraitUrl: null,
          designedPortraitPrompt: null,
          isDesignedPortraitConfirmed: false,
        }),
      setSelectedOutfitId: (id) =>
        set({
          selectedOutfitId: id,
          designedPortraitUrl: null,
          designedPortraitPrompt: null,
          isDesignedPortraitConfirmed: false,
        }),
      setDesignedPortrait: (url, prompt = null) =>
        set({
          designedPortraitUrl: url,
          designedPortraitPrompt: prompt,
          isDesignedPortraitConfirmed: false,
        }),
      setDesignedPortraitConfirmed: (confirmed) =>
        set({ isDesignedPortraitConfirmed: confirmed }),
      clearDesignedPortrait: () =>
        set({
          designedPortraitUrl: null,
          designedPortraitPrompt: null,
          isDesignedPortraitConfirmed: false,
        }),

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
        const { subscription, user } = get()
        if (subscription.remainingCredits > 0) {
          const nextSubscription = {
            ...subscription,
            remainingCredits: subscription.remainingCredits - 1,
          }

          set({
            subscription: nextSubscription,
            user: user
              ? {
                  ...user,
                  subscription: nextSubscription,
                }
              : user,
          })
          return true
        }
        return false
      },
      refundCredit: () =>
        set((state) => {
          const nextSubscription = {
            ...state.subscription,
            remainingCredits: Math.min(
              state.subscription.totalCredits,
              state.subscription.remainingCredits + 1
            ),
          }

          return {
            subscription: nextSubscription,
            user: state.user
              ? {
                  ...state.user,
                  subscription: nextSubscription,
                }
              : state.user,
          }
        }),
      resetCredits: () =>
        set((state) => {
          const nextSubscription = {
            ...state.subscription,
            remainingCredits: state.subscription.totalCredits,
          }

          return {
            subscription: nextSubscription,
            user: state.user
              ? {
                  ...state.user,
                  subscription: nextSubscription,
                }
              : state.user,
          }
        }),

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
          selectedHairstyleId: hairstyleOptions[0]?.id ?? null,
          selectedOutfitId: outfitOptions[0]?.id ?? null,
          designedPortraitUrl: null,
          designedPortraitPrompt: null,
          isDesignedPortraitConfirmed: false,
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
          selectedHairstyleId: hairstyleOptions[0]?.id ?? null,
          selectedOutfitId: outfitOptions[0]?.id ?? null,
          designedPortraitUrl: null,
          designedPortraitPrompt: null,
          isDesignedPortraitConfirmed: false,
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
        userPhotos: state.userPhotos,
        generatedPhotos: state.generatedPhotos,
        generationHistory: state.generationHistory,
        hairEnhancementEnabled: state.hairEnhancementEnabled,
        hairEnhancementStrength: state.hairEnhancementStrength,
        faceRetouchEnabled: state.faceRetouchEnabled,
        ageTarget: state.ageTarget,
        selectedStyleId: state.selectedStyleId,
        selectedSceneId: state.selectedSceneId,
        selectedHairstyleId: state.selectedHairstyleId,
        selectedOutfitId: state.selectedOutfitId,
        designedPortraitUrl: state.designedPortraitUrl,
        designedPortraitPrompt: state.designedPortraitPrompt,
        isDesignedPortraitConfirmed: state.isDesignedPortraitConfirmed,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState> | undefined

        if (!persisted) {
          return currentState
        }

        const user = normalizeUser(persisted.user ?? currentState.user)
        const subscription = normalizeSubscription(
          persisted.subscription ?? user?.subscription ?? currentState.subscription
        )

        return {
          ...currentState,
          ...persisted,
          user: user
            ? {
                ...user,
                subscription,
              }
            : user,
          subscription,
          userPhotos: Array.isArray(persisted.userPhotos)
            ? persisted.userPhotos.map(normalizeUserPhoto)
            : currentState.userPhotos,
          generatedPhotos: Array.isArray(persisted.generatedPhotos)
            ? persisted.generatedPhotos.map(normalizeGeneratedPhoto)
            : currentState.generatedPhotos,
          generationHistory: Array.isArray(persisted.generationHistory)
            ? persisted.generationHistory.map(normalizeSavedGeneration)
            : currentState.generationHistory,
        }
      },
    }
  )
)
