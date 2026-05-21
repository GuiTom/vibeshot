// 用户上传的照片类型
export interface UserPhoto {
  id: string
  url: string
  type: 'front' | 'half' | 'side-left' | 'side-right' | 'full'
  uploadedAt: Date
}

// 姿势风格
export interface PoseStyle {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string
  previewUrl: string
  tags: string[]
  parameters: {
    pose: string
    focalLength: string
    expression: string
    gesture: string
    lighting: string
    composition: string
  }
}

// 场景模板
export interface SceneTemplate {
  id: string
  name: string
  nameEn: string
  description: string
  previewUrl: string
  tags: string[]
  lighting: string
  mood: 'casual' | 'professional' | 'romantic' | 'adventurous' | 'luxury'
}

// 生成结果
export interface GeneratedPhoto {
  id: string
  userId: string
  styleId: string
  sceneId: string
  imageUrl: string
  thumbnailUrl: string
  createdAt: Date
  prompt: string
}

export interface SavedGeneration extends GeneratedPhoto {
  createdAt: Date
  updatedAt?: Date
}

// 用户订阅信息
export interface Subscription {
  type: 'free' | 'monthly' | 'yearly'
  remainingCredits: number
  totalCredits: number
  expiresAt: Date | null
  status?: string | null
}

// 用户信息
export interface User {
  id: string
  name?: string
  email?: string
  avatar?: string
  createdAt: Date
  subscription: Subscription
}

// 生成请求
export interface GenerateRequest {
  userPhotos: UserPhoto[]
  styleId: string
  sceneId: string
  count?: number
}

// 智能推荐结果
export interface Recommendation {
  style: PoseStyle
  scene: SceneTemplate
  reason: string
  confidence: number
}
