import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { buildHairEnhancementPrompt } from '@/lib/hair'
import { buildFaceRetouchPrompt } from '@/lib/retouch'

type ReferencePhotoInput = {
  type: 'front' | 'half' | 'side-left' | 'side-right' | 'full'
  dataUrl: string
}

type GenerationMode = 'final' | 'appearance-preview'

type ImageRenderPlan = {
  size: '1024x1024' | 'auto'
  timeoutMs: number
  quality: 'auto' | 'low'
}

type SubscriptionSnapshot = {
  subscriptionPlan: string
  creditsRemaining: number
  creditsTotal: number
  subscriptionExpiresAt: Date | null
  subscriptionStatus: string | null
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (!matches) {
    throw new Error('用户照片格式无效')
  }

  const [, mimeType, base64Data] = matches
  const buffer = Buffer.from(base64Data, 'base64')
  return new File([buffer], filename, { type: mimeType })
}

function isTimeoutError(error: any) {
  return (
    error?.name === 'AbortError' ||
    error?.name === 'APIConnectionTimeoutError' ||
    error?.code === 'ETIMEDOUT' ||
    /timed out/i.test(String(error?.message ?? ''))
  )
}

function getRenderPlans(generationMode: GenerationMode): ImageRenderPlan[] {
  if (generationMode === 'appearance-preview') {
    return [
      { size: '1024x1024', timeoutMs: 90000, quality: 'low' },
      { size: 'auto', timeoutMs: 60000, quality: 'low' },
    ]
  }

  return [
    { size: '1024x1024', timeoutMs: 120000, quality: 'auto' },
    { size: 'auto', timeoutMs: 75000, quality: 'auto' },
  ]
}

function getTimeoutMessage(generationMode: GenerationMode) {
  if (generationMode === 'appearance-preview') {
    return '正面预览生成超时了，我已经自动尝试过更轻量的参数。请稍后再试一次。'
  }

  return '最终成片生成超时了，我已经自动尝试过降级重试。请稍后再试一次。'
}

function serializeSubscription(subscription: SubscriptionSnapshot) {
  return {
    type: subscription.subscriptionPlan,
    remainingCredits: subscription.creditsRemaining,
    totalCredits: subscription.creditsTotal,
    expiresAt: subscription.subscriptionExpiresAt?.toISOString() ?? null,
    status: subscription.subscriptionStatus,
  }
}

async function consumeCredit(userId: string) {
  const deductionResult = await prisma.user.updateMany({
    where: {
      id: userId,
      creditsRemaining: {
        gt: 0,
      },
    },
    data: {
      creditsRemaining: {
        decrement: 1,
      },
    },
  })

  if (deductionResult.count === 0) {
    return null
  }

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      subscriptionPlan: true,
      creditsRemaining: true,
      creditsTotal: true,
      subscriptionExpiresAt: true,
      subscriptionStatus: true,
    },
  })
}

async function refundCredit(userId: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      creditsRemaining: {
        increment: 1,
      },
    },
  })
}

export async function POST(request: NextRequest) {
  let generationMode: GenerationMode = 'final'
  let consumedUserId: string | null = null

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
      appearanceDesign,
    } = body

    generationMode =
      body?.generationMode === 'appearance-preview'
        ? 'appearance-preview'
        : 'final'

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    let updatedUserSubscription: SubscriptionSnapshot | null = null

    if (session?.user?.id) {
      updatedUserSubscription = await consumeCredit(session.user.id)

      if (!updatedUserSubscription) {
        return NextResponse.json(
          { error: '生成次数已用完，请先购买或升级套餐' },
          { status: 402 }
        )
      }

      consumedUserId = session.user.id
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
      maxRetries: 0,
    })

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
      appearanceDesign
        ? [
            generationMode === 'appearance-preview'
              ? 'Apply the user-selected appearance design to the same real person and present him as a clean front-facing portrait preview.'
              : 'Apply the user-selected appearance design to the same real person before placing him into the final scene.',
            appearanceDesign.hairstylePrompt
              ? `User-selected hairstyle direction: ${appearanceDesign.hairstylePrompt}.`
              : null,
            appearanceDesign.outfitPrompt
              ? `User-selected outfit direction: ${appearanceDesign.outfitPrompt}.`
              : null,
            generationMode === 'appearance-preview'
              ? 'Keep the composition front-facing, centered, and suitable for previewing hairstyle and wardrobe decisions. Use a minimal premium portrait background without adding a busy environment.'
              : 'Treat the selected scene as a photo template. Only replace or render the person in that template, while preserving the background, lighting mood, environment, and composition as much as possible.',
          ]
            .filter(Boolean)
            .join(' ')
        : null,
      generationMode !== 'appearance-preview' && hairEnhancementEnabled
        ? buildHairEnhancementPrompt(
            styleId,
            sceneId,
            hairEnhancementStrength,
            ageTarget
          )
        : null,
      generationMode !== 'appearance-preview' && faceRetouchEnabled
        ? buildFaceRetouchPrompt(ageTarget)
        : null,
    ].filter(Boolean)

    const enhancedPrompt =
      enhancementPrompts.length > 0
        ? [prompt, ...enhancementPrompts].join(' ')
        : prompt

    console.log('Generating with GPT Image edit flow...')
    console.log('Reference photo count:', normalizedPhotos.length)
    console.log('Generation mode:', generationMode)

    if (normalizedPhotos.length === 0) {
      return NextResponse.json(
        {
          error:
            '请先上传参考照片，当前生成流程依赖参考图保持人物一致性。',
        },
        { status: 400 }
      )
    }

    const referenceImages = normalizedPhotos.slice(0, 1).map((photo, index) =>
      dataUrlToFile(photo.dataUrl, `reference-${index + 1}-${photo.type}.png`)
    )

    const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
    const renderPlans = getRenderPlans(generationMode)

    let response: Awaited<ReturnType<typeof client.images.edit>> | null = null
    let lastError: any = null

    for (let index = 0; index < renderPlans.length; index += 1) {
      const plan = renderPlans[index]
      try {
        console.log(
          `Image generation attempt ${index + 1}/${renderPlans.length} with size ${plan.size}, quality ${plan.quality}, and timeout ${plan.timeoutMs}ms`
        )

        response = await client.images.edit(
          {
            model: imageModel,
            image: referenceImages,
            prompt: enhancedPrompt,
            n: 1,
            size: plan.size,
            quality: plan.quality,
            background: generationMode === 'appearance-preview' ? 'opaque' : 'auto',
          },
          {
            timeout: plan.timeoutMs,
          }
        )

        break
      } catch (attemptError: any) {
        lastError = attemptError
        console.error(
          `Image generation attempt ${index + 1} failed:`,
          attemptError
        )

        if (!isTimeoutError(attemptError) || index === renderPlans.length - 1) {
          throw attemptError
        }

        console.warn(
          `Attempt ${index + 1} timed out, retrying with fallback settings...`
        )
      }
    }

    if (!response) {
      throw lastError || new Error('Image generation failed')
    }

    console.log('Image generation finished in ms:', Date.now() - startedAt)

    let imageUrl = response.data?.[0]?.url
    if (!imageUrl && response.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${response.data[0].b64_json}`
    }

    if (!imageUrl) {
      throw new Error('API 未返回有效图片 URL')
    }

    const savedGeneration =
      generationMode !== 'appearance-preview' &&
      session?.user?.id &&
      styleId &&
      sceneId
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
        subscription: updatedUserSubscription
          ? serializeSubscription(updatedUserSubscription)
          : null,
      },
    })
  } catch (error: any) {
    console.error('Generation error:', error)

    if (consumedUserId) {
      try {
        await refundCredit(consumedUserId)
      } catch (refundError) {
        console.error('Failed to refund consumed credit:', refundError)
      }
    }

    if (isTimeoutError(error)) {
      return NextResponse.json(
        { error: getTimeoutMessage(generationMode) },
        { status: 504 }
      )
    }

    const status = error?.status || error?.response?.status || 500
    const message =
      error?.error?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      '生成失败'

    return NextResponse.json(
      { error: `图片生成服务错误：${message}` },
      { status }
    )
  }
}
