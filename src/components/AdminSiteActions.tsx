'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Trash2, Eye, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { removeSite, publishSite } from '@/app/actions/site'

type Props = {
  siteId: string
  siteUrl?: string | null
  hasHtml: boolean
  status: string
}

export function AdminSiteActions({ siteId, siteUrl, hasHtml, status }: Props) {
  const [isPendingRemove, startRemoveTransition] = useTransition()
  const [isPendingRepublish, startRepublishTransition] = useTransition()
  const router = useRouter()

  function handleRemove() {
    if (!confirm('Remover o deploy do Vercel e resetar este site para rascunho?')) return
    startRemoveTransition(async () => {
      const result = await removeSite(siteId)
      if (!result.success) toast.error(result.error)
      else toast.success('Site removido do Vercel e resetado para rascunho.')
      router.refresh()
    })
  }

  function handleRepublish() {
    startRepublishTransition(async () => {
      const result = await publishSite(siteId)
      if (!result.success) toast.error(result.error)
      else toast.success('Site republicado com sucesso!')
      router.refresh()
    })
  }

  const isPending = isPendingRemove || isPendingRepublish

  return (
    <div className="flex items-center gap-1">
      {status !== 'DRAFT' && (
        <Link
          href={`/dashboard/preview?siteId=${siteId}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          title="Ver preview"
        >
          <Eye className="w-4 h-4" />
        </Link>
      )}

      {siteUrl && (
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          title="Abrir site publicado"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}

      {hasHtml && (
        <button
          onClick={handleRepublish}
          disabled={isPending}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Republicar no Vercel"
        >
          {isPendingRepublish ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      )}

      <button
        onClick={handleRemove}
        disabled={isPending}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
        title="Remover deploy e resetar"
      >
        {isPendingRemove ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
