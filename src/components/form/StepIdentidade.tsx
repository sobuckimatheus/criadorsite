'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Loader2, Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type FormData, PALETAS } from '@/types'
import { cn } from '@/lib/utils'

const SEGMENTOS = [
  { value: 'CLINICA', label: 'Clínica' },
  { value: 'ESCRITORIO', label: 'Escritório' },
  { value: 'OFICINA', label: 'Oficina' },
  { value: 'CONSULTORIA', label: 'Consultoria' },
  { value: 'OUTRO', label: 'Outro' },
]

export default function StepIdentidade() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormData>()
  const [uploading, setUploading] = useState(false)
  const logoUrl = watch('logoUrl')
  const corPaleta = watch('corPaleta')

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setValue('logoUrl', data.url, { shouldValidate: true })
    setUploading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nomeNegocio">Nome do negócio *</Label>
        <Input
          id="nomeNegocio"
          {...register('nomeNegocio')}
          className="mt-1.5"
          placeholder="Ex: Clínica da Família Silva"
        />
        {errors.nomeNegocio && <p className="text-xs text-red-500 mt-1">{errors.nomeNegocio.message}</p>}
      </div>

      <div>
        <Label htmlFor="segmento">Segmento *</Label>
        <select
          id="segmento"
          {...register('segmento')}
          className="mt-1.5 flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          {SEGMENTOS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {errors.segmento && <p className="text-xs text-red-500 mt-1">{errors.segmento.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input id="cidade" {...register('cidade')} className="mt-1.5" placeholder="São Paulo" />
          {errors.cidade && <p className="text-xs text-red-500 mt-1">{errors.cidade.message}</p>}
        </div>
        <div>
          <Label htmlFor="bairro">Bairro *</Label>
          <Input id="bairro" {...register('bairro')} className="mt-1.5" placeholder="Centro" />
          {errors.bairro && <p className="text-xs text-red-500 mt-1">{errors.bairro.message}</p>}
        </div>
      </div>

      <div>
        <Label>Paleta de cores *</Label>
        <div className="grid grid-cols-3 gap-3 mt-1.5">
          {PALETAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setValue('corPaleta', p.id, { shouldValidate: true })}
              className={cn(
                'border-2 rounded-xl p-3 text-center transition-all',
                corPaleta === p.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex justify-center gap-1 mb-2">
                <div className="w-5 h-5 rounded-full" style={{ background: p.primary }} />
                <div className="w-5 h-5 rounded-full" style={{ background: p.secondary }} />
                <div className="w-5 h-5 rounded-full border border-gray-200" style={{ background: p.light }} />
              </div>
              <p className="text-xs font-medium text-gray-700">{p.label}</p>
            </button>
          ))}
        </div>
        {errors.corPaleta && <p className="text-xs text-red-500 mt-1">{errors.corPaleta.message}</p>}
      </div>

      <div>
        <Label>Logo (opcional)</Label>
        <div className="mt-1.5">
          {logoUrl ? (
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded" />
              <span className="text-sm text-gray-600 flex-1 truncate">Logo carregado</span>
              <button type="button" onClick={() => setValue('logoUrl', undefined)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Upload className="w-4 h-4 text-gray-400" />}
              <span className="text-sm text-gray-500">{uploading ? 'Enviando...' : 'Clique para enviar logo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
