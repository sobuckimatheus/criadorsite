import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Radar, ExternalLink, ChevronRight, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { RastreamentoForm } from './RastreamentoForm'

export default async function RastreamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const isAdmin = dbUser?.role === 'ADMIN'
  const { siteId } = await searchParams

  // Se tem siteId, mostra o formulário desse site
  if (siteId) {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, nomeNegocio: true, subdomain: true, metaPixelId: true, metaPixelToken: true, gtmId: true, userId: true },
    })

    if (!site || (!isAdmin && site.userId !== user.id)) redirect('/dashboard/rastreamento')

    return (
      <div className="py-10 px-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard/rastreamento" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
              ← Voltar aos sites
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{site.nomeNegocio}</h1>
                {site.subdomain && (
                  <a href={site.subdomain} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    {site.subdomain.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <RastreamentoForm
            siteId={site.id}
            initialData={{
              metaPixelId: site.metaPixelId ?? '',
              metaPixelToken: site.metaPixelToken ?? '',
              gtmId: site.gtmId ?? '',
            }}
          />
        </div>
      </div>
    )
  }

  // Lista de sites publicados
  const sites = isAdmin
    ? await prisma.site.findMany({
        where: { status: 'PUBLISHED' },
        select: { id: true, nomeNegocio: true, subdomain: true, segmento: true, metaPixelId: true, gtmId: true },
        orderBy: { updatedAt: 'desc' },
      })
    : await prisma.site.findMany({
        where: { userId: user.id, status: 'PUBLISHED' },
        select: { id: true, nomeNegocio: true, subdomain: true, segmento: true, metaPixelId: true, gtmId: true },
        orderBy: { updatedAt: 'desc' },
      })

  return (
    <div className="py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Radar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rastreamento</h1>
            <p className="text-gray-500 mt-1 text-sm">Selecione um site para configurar Meta Pixel e Google Tag Manager</p>
          </div>
        </div>

        {sites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <Globe className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum site publicado ainda.</p>
            <Link href="/dashboard" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Ir para Meu Site
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sites.map(site => (
              <Link
                key={site.id}
                href={`/dashboard/rastreamento?siteId=${site.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-orange-300 hover:bg-orange-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center flex-shrink-0 text-lg font-bold text-orange-600">
                  {site.nomeNegocio[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{site.nomeNegocio}</p>
                  {site.subdomain && (
                    <p className="text-xs text-gray-400 truncate">{site.subdomain.replace('https://', '')}</p>
                  )}
                  <div className="flex gap-2 mt-1.5">
                    {site.metaPixelId
                      ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Pixel ✓</span>
                      : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Pixel —</span>}
                    {site.gtmId
                      ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">GTM ✓</span>
                      : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">GTM —</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
