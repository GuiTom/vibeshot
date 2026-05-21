import { PoseStyle, SceneTemplate } from './types'

export const poseStyles: PoseStyle[] = [
  {
    id: 'cold',
    name: '冷淡感站姿',
    nameEn: 'Cold Standing Pose',
    description: '微侧身站立，收下巴，眼神克制，适合高冷和质感大片。',
    icon: '❄️',
    previewUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&h=860&fit=crop',
    tags: ['站姿', '高冷', '微侧身'],
    parameters: {
      pose: 'slight side-standing pose with relaxed shoulders and a cool restrained expression',
      focalLength: '85mm',
      expression: 'calm, restrained, slightly distant eye contact',
      gesture: 'hands relaxed or lightly placed in pockets',
      lighting: 'clean side lighting with gentle contrast',
      composition: 'half-body or upper-body centered portrait',
    },
  },
  {
    id: 'relaxed',
    name: '松弛感靠墙',
    nameEn: 'Relaxed Lean Pose',
    description: '轻松靠墙或倚靠物体，适合日常、咖啡馆和街头模板。',
    icon: '☀️',
    previewUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&h=860&fit=crop',
    tags: ['靠墙', '自然', '日常'],
    parameters: {
      pose: 'relaxed leaning pose with natural weight shift',
      focalLength: '50mm',
      expression: 'easy natural smile or relaxed neutral expression',
      gesture: 'one hand in pocket or both hands relaxed',
      lighting: 'soft natural light with casual atmosphere',
      composition: 'environmental portrait with room around the body',
    },
  },
  {
    id: 'elite',
    name: '精英感正身',
    nameEn: 'Executive Upright Pose',
    description: '正身站立或半身坐姿，适合办公室、酒店、大堂等职业模板。',
    icon: '💼',
    previewUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=640&h=860&fit=crop',
    tags: ['职场', '正身', '商务'],
    parameters: {
      pose: 'upright professional pose facing the camera with confident posture',
      focalLength: '85mm',
      expression: 'confident composed expression with premium presence',
      gesture: 'arms relaxed, lightly crossed, or one hand adjusting sleeve',
      lighting: 'professional portrait lighting with polished contrast',
      composition: 'clean mid-shot with strong center balance',
    },
  },
  {
    id: 'rebel',
    name: '痞帅街头姿势',
    nameEn: 'Street Attitude Pose',
    description: '身体略带动态，适合夜景、街头和电影感模板。',
    icon: '😏',
    previewUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=640&h=860&fit=crop',
    tags: ['街头', '痞帅', '电影感'],
    parameters: {
      pose: 'edgy standing pose with asymmetrical shoulder angle',
      focalLength: '35mm',
      expression: 'subtle smirk or confident cinematic expression',
      gesture: 'one shoulder dropped, hands relaxed, slightly dynamic body line',
      lighting: 'dramatic directional light with urban atmosphere',
      composition: 'stylized portrait with strong lines and attitude',
    },
  },
  {
    id: 'sunny',
    name: '阳光活力姿势',
    nameEn: 'Sunny Open Pose',
    description: '身体打开、表情更友好，适合户外、运动和生活方式模板。',
    icon: '🌟',
    previewUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=860&fit=crop',
    tags: ['户外', '活力', '开朗'],
    parameters: {
      pose: 'open natural standing pose with lively body language',
      focalLength: '50mm',
      expression: 'warm friendly expression with healthy energy',
      gesture: 'natural arm position with bright confident posture',
      lighting: 'sunlit clean lighting with fresh atmosphere',
      composition: 'full or half body with airy spacing',
    },
  },
  {
    id: 'korean',
    name: '韩系半身姿势',
    nameEn: 'Korean Half-Body Pose',
    description: '更注重脸部角度和半身构图，适合简洁、城市和室内模板。',
    icon: '🍀',
    previewUrl:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=640&h=860&fit=crop',
    tags: ['半身', '韩系', '清爽'],
    parameters: {
      pose: 'soft half-body pose with clean shoulder line and subtle head angle',
      focalLength: '50mm',
      expression: 'gentle soft expression with calm direct gaze',
      gesture: 'minimal natural hand placement and elegant posture',
      lighting: 'soft flattering portrait light with clean tone',
      composition: 'balanced half-body composition with stylish simplicity',
    },
  },
]

export const sceneTemplates: SceneTemplate[] = [
  {
    id: 'cafe',
    name: '咖啡馆模板',
    nameEn: 'Cafe Template',
    description: '保留咖啡馆环境和桌面构图，只替换模板里的人物。',
    previewUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=760&h=520&fit=crop',
    tags: ['咖啡馆', '日常', '氛围感'],
    lighting: 'warm indoor cafe lighting with window softness',
    mood: 'casual',
  },
  {
    id: 'office',
    name: '办公室模板',
    nameEn: 'Office Template',
    description: '保留职业场景、桌面或城市背景，只替换人物本身。',
    previewUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=760&h=520&fit=crop',
    tags: ['办公室', '商务', '都市'],
    lighting: 'clean professional lighting with office ambience',
    mood: 'professional',
  },
  {
    id: 'night-street',
    name: '夜景街头模板',
    nameEn: 'Night Street Template',
    description: '保留夜晚霓虹和街头透视，只替换照片里的主角。',
    previewUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=760&h=520&fit=crop&sat=-100',
    tags: ['夜景', '街头', '电影感'],
    lighting: 'neon night lighting with cinematic contrast',
    mood: 'romantic',
  },
  {
    id: 'gym',
    name: '健身房模板',
    nameEn: 'Gym Template',
    description: '保留器械和运动环境，只替换人物，不额外改动场景。',
    previewUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=760&h=520&fit=crop',
    tags: ['健身房', '运动', '男性力量感'],
    lighting: 'bright gym lighting with healthy athletic mood',
    mood: 'adventurous',
  },
  {
    id: 'supercar',
    name: '豪车模板',
    nameEn: 'Supercar Template',
    description: '保留车身、光泽和构图关系，只把人替换成你。',
    previewUrl:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=760&h=520&fit=crop',
    tags: ['豪车', '高端', '生活方式'],
    lighting: 'luxury editorial lighting with glossy surfaces',
    mood: 'luxury',
  },
  {
    id: 'minimal',
    name: '纯色棚拍模板',
    nameEn: 'Studio Template',
    description: '保留棚拍背景和专业布光，只替换人物，不替换服装。',
    previewUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=760&h=520&fit=crop',
    tags: ['棚拍', '简洁', '头像'],
    lighting: 'professional studio lighting with clean backdrop',
    mood: 'professional',
  },
]

export function getStyleById(id: string): PoseStyle | undefined {
  return poseStyles.find((s) => s.id === id)
}

export function getSceneById(id: string): SceneTemplate | undefined {
  return sceneTemplates.find((s) => s.id === id)
}
