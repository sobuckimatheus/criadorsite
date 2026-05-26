export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sites = await prisma.site.findMany({
    where: { status: 'PUBLISHED', subdomain: { not: null } },
    select: { subdomain: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const appDomain = process.env.MENTOR_DOMAIN || 'bethelapp.com.br'

  const urls = [
    `  <url>\n    <loc>https://${appDomain}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>`,
    ...sites
      .filter((s) => s.subdomain)
      .map(
        (s) =>
          `  <url>\n    <loc>${s.subdomain}</loc>\n    <lastmod>${s.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
