'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { type FormData } from '@/types'

const SERVICOS = [
  { nome: 'servico1Nome', desc: 'servico1Desc', label: 'Serviço 1' },
  { nome: 'servico2Nome', desc: 'servico2Desc', label: 'Serviço 2' },
  { nome: 'servico3Nome', desc: 'servico3Desc', label: 'Serviço 3' },
] as const

export default function StepServicos() {
  const { register, setValue, formState: { errors } } = useFormContext<FormData>()
  const [count, setCount] = useState(1)

  function addServico() {
    if (count < 3) setCount(c => c + 1)
  }

  function removeServico(index: number) {
    setValue(SERVICOS[index].nome as keyof FormData, '')
    setValue(SERVICOS[index].desc as keyof FormData, '')
    setCount(c => c - 1)
  }

  return (
    <div className="space-y-5">

      {/* Serviços dinâmicos */}
      <div className="space-y-4">
        {SERVICOS.slice(0, count).map((s, i) => (
          <div key={s.nome} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {s.label}{i === 0 ? ' *' : ' (opcional)'}
              </p>
              {i > 0 && (
                <button type="button" onClick={() => removeServico(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <Input
                {...register(s.nome as keyof FormData)}
                placeholder="Nome do serviço"
              />
              {i === 0 && errors.servico1Nome && (
                <p className="text-xs text-red-500 mt-1">{errors.servico1Nome.message}</p>
              )}
            </div>
            <div>
              <Input
                {...register(s.desc as keyof FormData)}
                placeholder="Descrição (opcional)"
              />
            </div>
          </div>
        ))}

        {count < 3 && (
          <button
            type="button"
            onClick={addServico}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar serviço
          </button>
        )}
      </div>

      {/* Campos fixos */}
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
