import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/StatusBadge'
import { AdminSiteActions } from '@/components/AdminSiteActions'

type FilterStatus = 'ALL' | 'DRAFT' | 'GENERATING' | 'PREVIEW' | 'PUBLISHED' | 'ERROR'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (dbUser?.role !== 'ADMIN') redirect('/dashboard')

  const { status } = await searchParams
  const filterStatus = (status as FilterStatus) || 'ALL'

  const sites = await prisma.site.findMany({
    where: filterStatus !== 'ALL' ? { status: filterStatus as any } : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const counts = await prisma.site.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const STATUS_FILTERS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'PUBLISHED', label: 'Publicados' },
    { value: 'PREVIEW', label: 'Preview' },
    { value: 'GENERATING', label: 'Gerando' },
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'ERROR', label: 'Com erro' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sites.length} site{sites.length !== 1 ? 's' : ''} encontrado{sites.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count = value === 'ALL'
            ? counts.reduce((sum, c) => sum + c._count.status, 0)
            : counts.find((c) => c.status === value)?._count.status ?? 0

          return (
            <a
              key={value}
              href={value === 'ALL' ? '/admin' : `/admin?status=${value}`}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                filterStatus === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              {label}
              <span className={[
                'text-xs px-1.5 py-0.5 rounded-full',
                filterStatus === value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500',
              ].join(' ')}>
                {count}
              </span>
            </a>
          )
        })}
      </div>

      {/* Sites table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Negócio</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Mentorado</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Segmento</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Criado</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{site.nomeNegocio}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{site.cidade}, {site.bairro}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-gray-700">{site.user.name}</p>
                  <p className="text-gray-400 text-xs">{site.user.email}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {site.segmento}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={site.status} />
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {new Date(site.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-4">
                  <AdminSiteActions
                    siteId={site.id}
                    siteUrl={site.subdomain || site.vercelUrl}
                    hasHtml={!!site.htmlGerado}
                    status={site.status}
                  />
                </td>
              </tr>
            ))}
            {sites.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  Nenhum site encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
