'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { type FormData } from '@/types'

export default function StepServicos() {
  const { register, formState: { errors } } = useFormContext<FormData>()

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Serviço 1 *</p>
        <div>
          <Label htmlFor="s1nome">Nome</Label>
          <Input id="s1nome" {...register('servico1Nome')} className="mt-1.5" placeholder="Ex: Consulta médica" />
          {errors.servico1Nome && <p className="text-xs text-red-500 mt-1">{errors.servico1Nome.message}</p>}
        </div>
        <div>
          <Label htmlFor="s1desc">Descrição</Label>
          <Input id="s1desc" {...register('servico1Desc')} className="mt-1.5" placeholder="Breve descrição do serviço..." />
          {errors.servico1Desc && <p className="text-xs text-red-500 mt-1">{errors.servico1Desc.message}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Serviço 2 (opcional)</p>
        <div className="grid grid-cols-2 gap-3">
          <Input {...register('servico2Nome')} placeholder="Nome do serviço" />
          <Input {...register('servico2Desc')} placeholder="Descrição" />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Serviço 3 (opcional)</p>
        <div className="grid grid-cols-2 gap-3">
          <Input {...register('servico3Nome')} placeholder="Nome do serviço" />
          <Input {...register('servico3Desc')} placeholder="Descrição" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div>
          <Label htmlFor="destaque">Serviço carro-chefe *</Label>
          <Input id="destaque" {...register('servicoDestaque')} className="mt-1.5" placeholder="Qual serviço mais gera resultado?" />
          {errors.servicoDestaque && <p className="text-xs text-red-500 mt-1">{errors.servicoDestaque.message}</p>}
        </div>
        <div>
          <Label htmlFor="resultado">Resultado que o cliente alcança *</Label>
          <Textarea
            id="resultado"
            {...register('resultadoCliente')}
            className="mt-1.5"
            rows={2}
            placeholder="Ex: Eliminar a dor crônica nas costas em até 4 sessões"
          />
          {errors.resultadoCliente && <p className="text-xs text-red-500 mt-1">{errors.resultadoCliente.message}</p>}
        </div>
      </div>
    </div>
  )
}
