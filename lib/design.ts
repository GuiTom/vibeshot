export type HairstyleOption = {
  id: string
  name: string
  nameEn: string
  description: string
  prompt: string
  referenceUrl: string
  tags: string[]
}

export type OutfitOption = {
  id: string
  name: string
  nameEn: string
  description: string
  prompt: string
  referenceUrl: string
  tags: string[]
}

export const hairstyleOptions: HairstyleOption[] = [
  {
    id: 'textured-crop',
    name: '纹理短发',
    nameEn: 'Textured Crop',
    description: '清爽利落，顶部有轻微层次，适合多数脸型。',
    prompt:
      'a modern textured short crop, clean sides, natural top texture, realistic hairline, flattering masculine grooming',
    referenceUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=520&h=640&fit=crop&crop=faces',
    tags: ['清爽', '日常', '减龄'],
  },
  {
    id: 'soft-fringe',
    name: '自然刘海',
    nameEn: 'Soft Fringe',
    description: '柔和遮额，增加亲和感，适合想要年轻自然的形象。',
    prompt:
      'soft natural fringe with airy texture, gentle forehead framing, clean temple area, realistic youthful styling',
    referenceUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=520&h=640&fit=crop&crop=faces',
    tags: ['自然', '温和', '韩系'],
  },
  {
    id: 'side-part',
    name: '商务侧分',
    nameEn: 'Smart Side Part',
    description: '轮廓整洁，成熟可信，适合职业照和高端场景。',
    prompt:
      'refined smart side part, controlled volume, polished sides, premium executive grooming, realistic shine',
    referenceUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=520&h=640&fit=crop&crop=faces',
    tags: ['商务', '精英', '稳重'],
  },
  {
    id: 'brushed-back',
    name: '后梳蓬松',
    nameEn: 'Brushed Back',
    description: '更有气场和成熟魅力，适合电影感或豪华模板。',
    prompt:
      'natural brushed-back hairstyle with healthy volume, clean outline, premium masculine styling, believable density',
    referenceUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=520&h=640&fit=crop&crop=faces',
    tags: ['气场', '成熟', '高级'],
  },
]

export const outfitOptions: OutfitOption[] = [
  {
    id: 'minimal-tee',
    name: '极简T恤',
    nameEn: 'Minimal Tee',
    description: '干净松弛，适合日常社交头像。',
    prompt:
      'a premium minimal solid-color crew neck t-shirt, clean fit, understated casual styling, no visible logos',
    referenceUrl:
      'https://images.unsplash.com/photo-1520975682031-a9f2f7f7c716?w=520&h=640&fit=crop',
    tags: ['日常', '简洁', '松弛'],
  },
  {
    id: 'casual-shirt',
    name: '休闲衬衫',
    nameEn: 'Casual Shirt',
    description: '轻商务和约会都能用，亲和但不随便。',
    prompt:
      'a well-fitted casual button-up shirt, relaxed premium fabric, sleeves naturally styled, tasteful everyday look',
    referenceUrl:
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=520&h=640&fit=crop',
    tags: ['约会', '通勤', '亲和'],
  },
  {
    id: 'business-suit',
    name: '商务西装',
    nameEn: 'Business Suit',
    description: '正式、可信、专业，适合职场和精英模板。',
    prompt:
      'a tailored modern business suit with a crisp shirt, refined fit, premium professional styling, no exaggerated fashion details',
    referenceUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=520&h=640&fit=crop',
    tags: ['商务', '专业', '可信'],
  },
  {
    id: 'street-jacket',
    name: '街头夹克',
    nameEn: 'Street Jacket',
    description: '更有个性和层次，适合夜景、街头、电影感照片。',
    prompt:
      'a stylish dark casual jacket layered over a simple top, modern streetwear silhouette, masculine and cinematic',
    referenceUrl:
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=520&h=640&fit=crop',
    tags: ['街头', '酷感', '层次'],
  },
]

export function getHairstyleById(id?: string | null) {
  return hairstyleOptions.find((option) => option.id === id)
}

export function getOutfitById(id?: string | null) {
  return outfitOptions.find((option) => option.id === id)
}
