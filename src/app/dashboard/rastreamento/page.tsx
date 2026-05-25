'use client'

import { useState } from 'react'
import { Radar, CheckCircle2, Loader2 } from 'lucide-react'
import { saveRastreamento } from '@/app/actions/site'

interface Props {
  siteId: string
  initialData: {
    metaPixelId: string
    metaPixelToken: string
    gtmId: string
  }
}

function RastreamentoForm({ siteId, initialData }: Props) {
  const [metaPixelId, setMetaPixelId] = useState(initialData.metaPixelId)
  const [metaPixelToken, setMetaPixelToken] = useState(initialData.metaPixelToken)
  const [gtmId, setGtmId] = useState(initialData.gtmId)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setLoading(true)
    setError('')
    setSaved(false)
    const result = await saveRastreamento(siteId, { metaPixelId, metaPixelToken, gtmId })
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Meta Pixel */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 36 36" width="18" height="18" fill="none">
              <path d="M18 3C9.716 3 3 9.716 3 18s6.716 15 15 15 15-6.716 15-15S26.284 3 18 3z" fill="#1877F2"/>
              <path d="M22.5 18c0-2.485-2.015-4.5-4.5-4.5S13.5 15.515 13.5 18s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Meta Pixel</p>
            <p className="text-xs text-gray-500">Rastreia conversões e eventos no Facebook/Instagram Ads</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">ID do Pixel</label>
            <input
              value={metaPixelId}
              onChange={e => setMetaPixelId(e.target.value)}
              placeholder="Ex: 1234567890123456"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Token de Acesso <span className="text-gray-400 font-normal normal-case">(opcional — para Conversions API)</span>
            </label>
            <input
              value={metaPixelToken}
              onChange={e => setMetaPixelToken(e.target.value)}
              placeholder="EAAxxxxxxxxxxxxxxx..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      {/* Google Tag Manager */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Google Tag Manager</p>
            <p className="text-xs text-gray-500">Gerencia todos os seus tags do Google (Analytics, Ads, etc.)</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">ID do Container</label>
          <input
            value={gtmId}
            onChange={e => setGtmId(e.target.value)}
            placeholder="Ex: GTM-XXXXXXX"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
          : saved
            ? <><CheckCircle2 className="w-4 h-4" /> Salvo e aplicado!</>
            : 'Salvar e aplicar no site'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Os códigos são injetados automaticamente em todas as páginas do site publicado. Não é necessário regenerar.
      </p>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function RastreamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const isAdmin = dbUser?.role === 'ADMIN'

  const site = isAdmin
    ? null
    : await prisma.site.findFirst({ where: { userId: user.id } })

  if (!site && !isAdmin) {
    return (
      <div className="py-10 px-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Crie seu site primeiro para configurar o rastreamento.</p>
        </div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="py-10 px-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Selecione um site no painel Admin para configurar o rastreamento.</p>
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
