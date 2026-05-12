import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mangas = await prisma.manga.findMany({ select: { id: true, updatedAt: true } })

  return [
    { url: 'https://read-manboh.vercel.app', lastModified: new Date() },
    ...mangas.map((m) => ({
      url: `https://read-manboh.vercel.app/manga/${m.id}`,
      lastModified: m.updatedAt,
    })),
  ]
}
