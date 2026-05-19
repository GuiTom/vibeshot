import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

async function loadEnvFile(envPath) {
  const content = await fs.readFile(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex === -1) continue

    const key = trimmed.slice(0, equalIndex).trim()
    const value = trimmed.slice(equalIndex + 1).trim()
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

async function testAPI() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  await loadEnvFile(path.join(__dirname, '.env.local'))

  const apiKey = process.env.OPENAI_API_KEY
  const baseURL = process.env.OPENAI_API_BASE_URL
  const inputImagePath = path.join(__dirname, '3.jpg')
  const outputImagePath = path.join(__dirname, 'test-output-3.png')

  if (!apiKey) {
    throw new Error('请先设置 OPENAI_API_KEY 环境变量')
  }

  const client = new OpenAI({
    apiKey,
    baseURL,
  })
  
  console.log('正在测试用 3.jpg 做 gpt-image-2 图生图...')
  
  try {
    const imageBuffer = await fs.readFile(inputImagePath)
    const imageFile = new File([imageBuffer], '3.jpg', { type: 'image/jpeg' })
    const startedAt = Date.now()

    const response = await client.images.edit(
      {
        model: 'gpt-image-2',
        image: [imageFile],
        prompt: [
          'Use the uploaded reference image as the same real person to transform.',
          'Keep the same identity, facial structure, hairstyle, skin tone, and recognizability.',
          'Do not replace the person with a different model.',
          'Create a realistic professional portrait with clean lighting, premium composition, and natural skin detail.',
        ].join(' '),
        n: 1,
        size: '1024x1024',
      },
      {
        timeout: 90000,
      }
    )

    console.log('耗时(ms):', Date.now() - startedAt)
    
    console.log('✅ 成功!')
    if (!response.data?.[0]?.b64_json) {
      throw new Error('接口没有返回 b64 图片数据')
    }

    const outputBuffer = Buffer.from(response.data[0].b64_json, 'base64')
    await fs.writeFile(outputImagePath, outputBuffer)
    console.log('输出文件:', outputImagePath)
  } catch (error) {
    console.log('❌ 失败')
    console.log('Status:', error?.status)
    console.log('错误:', error?.error?.message || error?.message)
  }
}

testAPI()
