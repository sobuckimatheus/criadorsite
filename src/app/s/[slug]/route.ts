import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const site = await prisma.site.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { htmlGerado: true, nomeNegocio: true },
  })

  if (!site?.htmlGerado) {
    return new NextResponse('<h1>Site não encontrado</h1>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new NextResponse(site.htmlGerado, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
