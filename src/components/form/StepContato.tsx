'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { type FormData } from '@/types'

export default function StepContato() {
  const { register, formState: { errors } } = useFormContext<FormData>()

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="whatsapp">WhatsApp *</Label>
        <Input
          id="whatsapp"
          {...register('whatsapp')}
          type="tel"
          className="mt-1.5"
          placeholder="11999999999 (apenas números)"
        />
        {errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message}</p>}
      </div>

      <div>
        <Label htmlFor="mensagem">Mensagem pré-preenchida do WhatsApp *</Label>
        <Textarea
          id="mensagem"
          {...register('whatsappMensagem')}
          className="mt-1.5"
          rows={2}
          placeholder="Ex: Olá! Vi seu site e gostaria de agendar uma consulta."
        />
        {errors.whatsappMensagem && <p className="text-xs text-red-500 mt-1">{errors.whatsappMensagem.message}</p>}
      </div>

      <div>
        <Label htmlFor="instagram">Instagram (opcional)</Label>
        <div className="relative mt-1.5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
          <Input id="instagram" {...register('instagram')} className="pl-7" placeholder="seuperfil" />
        </div>
      </div>

      <div>
        <Label htmlFor="horario">Horário de atendimento *</Label>
        <Input
          id="horario"
          {...register('horarioAtendimento')}
          className="mt-1.5"
          placeholder="Ex: Seg a Sex das 8h às 18h | Sáb 8h às 12h"
        />
        {errors.horarioAtendimento && <p className="text-xs text-red-500 mt-1">{errors.horarioAtendimento.message}</p>}
      </div>
    </div>
  )
}
