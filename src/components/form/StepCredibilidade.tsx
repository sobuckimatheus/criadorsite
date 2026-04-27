'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { type FormData } from '@/types'

export default function StepCredibilidade() {
  const { register, control, formState: { errors } } = useFormContext<FormData>()
  const { fields, append, remove } = useFieldArray({ control, name: 'depoimentos' })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="anos">Anos no mercado *</Label>
          <Input id="anos" {...register('anosNoMercado')} type="number" min="0" className="mt-1.5" placeholder="Ex: 8" />
          {errors.anosNoMercado && <p className="text-xs text-red-500 mt-1">{errors.anosNoMercado.message}</p>}
        </div>
        <div>
          <Label htmlFor="clientes">Clientes atendidos (aprox.)</Label>
          <Input id="clientes" {...register('totalClientes')} type="number" min="0" className="mt-1.5" placeholder="Ex: 500" />
        </div>
      </div>

      <div>
        <Label htmlFor="certs">Certificados e formações</Label>
        <Input id="certs" {...register('certificados')} className="mt-1.5" placeholder="Ex: CRF 1234, Especialização em Dermato" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Depoimentos (até 3)</Label>
          {fields.length < 3 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ nomeCliente: '', texto: '' })}
              className="text-blue-600 hover:text-blue-700 h-auto py-0 px-0 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Depoimento {index + 1}</span>
                <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Input {...register(`depoimentos.${index}.nomeCliente`)} placeholder="Nome do cliente" />
              <Textarea {...register(`depoimentos.${index}.texto`)} rows={2} placeholder="O que o cliente disse sobre você..." />
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">
              Clique em &quot;Adicionar&quot; para incluir depoimentos
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
