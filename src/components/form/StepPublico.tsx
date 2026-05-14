'use client'

import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { type FormData } from '@/types'

export default function StepPublico() {
  const { register, formState: { errors } } = useFormContext<FormData>()

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dorPrincipal">Principal dor que você resolve *</Label>
        <Textarea
          id="dorPrincipal"
          {...register('dorPrincipal')}
          className="mt-1.5"
          rows={3}
          placeholder="Ex: Dor crônica no joelho que impede de trabalhar, praticar esporte e viver com qualidade"
        />
        {errors.dorPrincipal && <p className="text-xs text-red-500 mt-1">{errors.dorPrincipal.message}</p>}
      </div>
    </div>
  )
}
