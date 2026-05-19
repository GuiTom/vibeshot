import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/Providers'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://music.aihelper360.com'),
  title: 'VibeShot - AI 形象摄影师',
  description: '让每一个"不会拍照"的男生，都能拥有让人眼前一亮的人物照片。AI 摄影师 + AI 形象顾问，帮助你生成高质量社交照片。',
  keywords: 'AI照片生成, 男生拍照, 社交头像, 形象照, AI摄影师, 姿势推荐',
  authors: [{ name: 'VibeShot Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VibeShot',
  },
  openGraph: {
    title: 'VibeShot - AI 形象摄影师',
    description: '让每一个"不会拍照"的男生，都能拥有让人眼前一亮的人物照片',
    type: 'website',
    locale: 'zh_CN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-dark-300 text-white antialiased">
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
