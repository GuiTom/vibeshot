import { PoseStyle, SceneTemplate } from './types'

// 男生姿势风格库 - MVP 版本包含 6 种风格
export const poseStyles: PoseStyle[] = [
  {
    id: 'cold',
    name: '冷淡感',
    nameEn: 'Cold & Mysterious',
    description: '简约克制，眼神疏离，散发神秘魅力',
    icon: '❄️',
    tags: ['高冷', '神秘', '简约'],
    parameters: {
      pose: '双手插兜，微微侧身',
      focalLength: '85mm',
      expression: '面无表情或微微皱眉',
      gesture: '插兜、抱臂',
      lighting: '侧光，阴影较多',
      composition: '三分法，人物占画面 2/3',
    },
  },
  {
    id: 'relaxed',
    name: '松弛感',
    nameEn: 'Relaxed Chill',
    description: '自然放松，随性自在，让人想靠近',
    icon: '☀️',
    tags: ['自然', '亲和', '日常'],
    parameters: {
      pose: '靠墙站立或自然行走',
      focalLength: '50mm',
      expression: '自然微笑，眼神柔和',
      gesture: '自然下垂、摸头发',
      lighting: '自然散射光',
      composition: '中心构图或对角线',
    },
  },
  {
    id: 'elite',
    name: '精英感',
    nameEn: 'Elite Professional',
    description: '商务精英，自信从容，职场加分项',
    icon: '💼',
    tags: ['商务', '自信', '专业'],
    parameters: {
      pose: '正襟站立或坐姿端正',
      focalLength: '85mm',
      expression: '自信微笑，眼神坚定',
      gesture: '双手交叠、扶领带',
      lighting: '蝴蝶光，专业影棚效果',
      composition: '中心构图，背景简洁',
    },
  },
  {
    id: 'rebel',
    name: '痞帅',
    nameEn: 'Bad Boy Vibes',
    description: '不羁帅气，坏坏的笑，让人过目不忘',
    icon: '😏',
    tags: ['帅气', '叛逆', '魅力'],
    parameters: {
      pose: '倚靠物体，身体微倾',
      focalLength: '35mm',
      expression: '似笑非笑，眼神戏谑',
      gesture: '叼牙签、单手插兜',
      lighting: '戏剧光，明暗对比强',
      composition: '框架构图',
    },
  },
  {
    id: 'sunny',
    name: '阳光男孩',
    nameEn: 'Sunny Boy',
    description: '活力满满，正能量，让人心情变好',
    icon: '🌟',
    tags: ['活力', '阳光', '亲切'],
    parameters: {
      pose: '跳跃姿势或双手比耶',
      focalLength: '50mm',
      expression: '开怀大笑，露出大白牙',
      gesture: '比耶、手指比划',
      lighting: '逆光加补光',
      composition: '三分法，上方留白',
    },
  },
  {
    id: 'korean',
    name: '韩系',
    nameEn: 'Korean Style',
    description: '清新自然，盐系男神，百搭不出错',
    icon: '🍀',
    tags: ['清新', '韩风', '温柔'],
    parameters: {
      pose: '随意站姿或低头沉思',
      focalLength: '50mm',
      expression: '淡淡的微笑或无表情',
      gesture: '手插口袋、摸后颈',
      lighting: '柔和侧光，暖色调',
      composition: '对角线构图',
    },
  },
]

// 场景模板库 - MVP 版本包含 6 个场景
export const sceneTemplates: SceneTemplate[] = [
  {
    id: 'cafe',
    name: '精品咖啡馆',
    nameEn: 'Cafe',
    description: '文艺小资，休闲时尚，适合日常社交',
    previewUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    tags: ['休闲', '文艺', '日常'],
    lighting: '暖色调，窗边自然光',
    mood: 'casual',
  },
  {
    id: 'office',
    name: '写字楼天际线',
    nameEn: 'Office Skyline',
    description: '都市精英，城市奋斗感，职场形象加分',
    previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    tags: ['职场', '商务', '都市'],
    lighting: '城市灯光，剪影效果',
    mood: 'professional',
  },
  {
    id: 'night-street',
    name: '夜景街头',
    nameEn: 'Night Street',
    description: '氛围感十足，神秘电影感，夜晚撩人',
    previewUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop',
    tags: ['夜景', '氛围', '电影感'],
    lighting: '霓虹灯光，明暗对比',
    mood: 'romantic',
  },
  {
    id: 'gym',
    name: '健身房',
    nameEn: 'Gym',
    description: '健康活力，运动型人设，展现自律生活',
    previewUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    tags: ['运动', '活力', '健康'],
    lighting: '运动场馆灯光，明亮干净',
    mood: 'adventurous',
  },
  {
    id: 'supercar',
    name: '豪车旁',
    nameEn: 'Supercar',
    description: '高端生活方式，展示品味与实力',
    previewUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
    tags: ['奢华', '品味', '高端'],
    lighting: '戏剧光，展示车辆质感',
    mood: 'luxury',
  },
  {
    id: 'minimal',
    name: '纯色背景',
    nameEn: 'Minimal',
    description: '百搭通用，头像首选，干净简洁',
    previewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop',
    tags: ['头像', '通用', '简约'],
    lighting: '专业影棚光',
    mood: 'professional',
  },
]

export function getStyleById(id: string): PoseStyle | undefined {
  return poseStyles.find((s) => s.id === id)
}

export function getSceneById(id: string): SceneTemplate | undefined {
  return sceneTemplates.find((s) => s.id === id)
}
