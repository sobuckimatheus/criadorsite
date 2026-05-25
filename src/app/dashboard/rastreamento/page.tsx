import { redirect } from 'next/navigation'
import { Radar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { RastreamentoForm } from './RastreamentoForm'

export default async function RastreamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const isAdmin = dbUser?.role === 'ADMIN'

  const site = isAdmin
    ? null
    : await prisma.site.findFirst({ where: { userId: user.id } })

  if (!site) {
    return (
      <div className="py-10 px-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">
            {isAdmin ? 'Selecione um site no painel Admin para configurar o rastreamento.' : 'Crie seu site primeiro para configurar o rastreamento.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Radar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rastreamento</h1>
            <p className="text-gray-500 mt-1 text-sm">Configure os pixels e tags do seu site</p>
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
