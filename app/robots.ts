import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://music.aihelper360.com/sitemap.xml',
    host: 'https://music.aihelper360.com',
  }
}
