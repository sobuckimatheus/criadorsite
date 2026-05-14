'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Wand2, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type FormData } from '@/types'

export default function StepHero() {
  const { register, watch, setValue } = useFormContext<FormData>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formData = watch()

  async function gerarSugestao() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/site/sugerir-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeNegocio: formData.nomeNegocio,
          segmento: formData.segmento,
          cidade: formData.cidade,
          estado: formData.estado,
          dorPrincipal: formData.dorPrincipal,
          resultadoCliente: formData.resultadoCliente,
          servicoDestaque: formData.servicoDestaque,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao gerar sugestão.'); return }
      if (data.headline) setValue('headline', data.headline)
      if (data.subheadline) setValue('subheadline', data.subheadline)
    } catch {
      setError('Erro ao conectar com a IA. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <p className="text-sm text-violet-700 font-medium mb-1">Headline e Subheadline do site</p>
        <p className="text-xs text-violet-600 leading-relaxed">
          Clique em &quot;Gerar com IA&quot; para ver exatamente o que a IA colocaria no topo do seu site — e edite à vontade antes de gerar.
        </p>
      </div>

      <button
        type="button"
        onClick={gerarSugestao}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando sugestão...</>
          : <><Wand2 className="w-4 h-4" /> Gerar sugestão com IA</>
        }
      </button>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <div>
        <Label htmlFor="headline">Headline</Label>
        <Textarea
          id="headline"
          {...register('headline')}
          className="mt-1.5"
          rows={2}
          placeholder="Ex: Elimine a dor crônica e volte a viver bem"
        />
      </div>

      <div>
        <Label htmlFor="subheadline">Subheadline</Label>
        <Textarea
          id="subheadline"
          {...register('subheadline')}
          className="mt-1.5"
          rows={3}
          placeholder="Ex: Atendimento especializado em São Paulo. Mais de 500 clientes recuperaram sua qualidade de vida."
        />
      </div>
    </div>
  )
}
