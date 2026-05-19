import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { buildHairEnhancementPrompt } from '@/lib/hair'
import { buildFaceRetouchPrompt } from '@/lib/retouch'

function dataUrlToFile(dataUrl: string, filename: string): File {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (!matches) {
    throw new Error('用户照片格式无效')
  }

  const [, mimeType, base64Data] = matches
  const buffer = Buffer.from(base64Data, 'base64')
  return new File([buffer], filename, { type: mimeType })
}

type ReferencePhotoInput = {
  type: 'front' | 'half' | 'side-left' | 'side-right' | 'full'
  dataUrl: string
}

const referencePhotoLabels: Record<ReferencePhotoInput['type'], string> = {
  front: 'front face',
  half: 'half body',
  'side-left': 'left profile',
  'side-right': 'right profile',
  full: 'full body',
}

export async function POST(request: NextRequest) {
  try {
    const startedAt = Date.now()
    const session = await auth()
    const body = await request.json()
    const {
      prompt,
      userPhoto,
      userPhotos,
      styleId,
      sceneId,
      hairEnhancementEnabled = true,
      hairEnhancementStrength = 'natural',
      faceRetouchEnabled = true,
      ageTarget = 'slightly-younger',
    } = body

    // Validate
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_API_BASE_URL,
    })

    // 构建 prompt，明确这是对参考图人物做风格转换，而不是重新生成一个新的人
    const normalizedPhotos: ReferencePhotoInput[] = Array.isArray(userPhotos)
      ? userPhotos.filter(
          (photo): photo is ReferencePhotoInput =>
            !!photo &&
            typeof photo.dataUrl === 'string' &&
            typeof photo.type === 'string'
        )
      : userPhoto
      ? [{ type: 'front', dataUrl: userPhoto }]
      : []

    const enhancementPrompts = [
      hairEnhancementEnabled
        ? buildHairEnhancementPrompt(
            styleId,
            sceneId,
            hairEnhancementStrength,
            ageTarget
          )
        : null,
      faceRetouchEnabled ? buildFaceRetouchPrompt(ageTarget) : null,
    ].filter(Boolean)

    const enhancedPrompt =
      enhancementPrompts.length > 0
        ? [prompt, ...enhancementPrompts].join(' ')
        : prompt

    console.log('Generating with GPT Image edit flow...')
    console.log('Reference photo count:', normalizedPhotos.length)

    if (normalizedPhotos.length === 0) {
      return NextResponse.json(
        { error: '请先上传参考照片，当前生成流程依赖参考图保持人物一致性' },
        { status: 400 }
      )
    }

    const referenceImages = normalizedPhotos.slice(0, 1).map((photo, index) =>
      dataUrlToFile(photo.dataUrl, `reference-${index + 1}-${photo.type}.png`)
    )

    const response = await client.images.edit(
      {
        model: 'gpt-image-2',
        image: referenceImages,
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
      },
      {
        timeout: 90000,
      }
    )

    console.log('Image generation finished in ms:', Date.now() - startedAt)

    // 获取结果
    let imageUrl = response.data?.[0]?.url
    if (!imageUrl && response.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${response.data[0].b64_json}`
    }
    
    if (!imageUrl) {
      throw new Error('API 未返回有效图片 URL')
    }

    const savedGeneration =
      session?.user?.id && styleId && sceneId
        ? await prisma.generation.create({
            data: {
              userId: session.user.id,
              styleId,
              sceneId,
              imageUrl,
              thumbnailUrl: imageUrl,
              prompt,
            },
          })
        : null

    return NextResponse.json({
      success: true,
      data: {
        id: savedGeneration?.id,
        imageUrl,
        thumbnailUrl: imageUrl,
        prompt,
        createdAt: savedGeneration?.createdAt ?? new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Generation error:', error)

    if (error?.name === 'AbortError' || error?.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: '生成超时，请减少参考图数量后重试' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error?.message || '生成失败' },
      { status: error?.status || 500 }
    )
  }
}
