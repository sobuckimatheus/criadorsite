export const maxDuration = 300

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PreviewContent } from '@/components/PreviewContent'

export default async function PreviewPage({
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

  // Admin can preview any site via ?siteId=
  const site = isAdmin && siteId
    ? await prisma.site.findUnique({ where: { id: siteId } })
    : await prisma.site.findFirst({ where: { userId: user.id } })

  if (!site) redirect(isAdmin ? '/admin' : '/dashboard/criar')

  return (
    <PreviewContent
      siteId={site.id}
      nomeNegocio={site.nomeNegocio}
      htmlGerado={site.htmlGerado}
      status={site.status}
      geracoesCount={site.geracoesCount}
      publishedUrl={site.subdomain || site.vercelUrl}
    />
  )
}
