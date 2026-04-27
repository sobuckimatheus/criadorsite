import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { FormStepper } from '@/components/form/FormStepper'
import type { FormData } from '@/types'

export default async function CriarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const site = await prisma.site.findUnique({
    where: { userId: user.id },
    include: { depoimentos: true },
  })

  const initialData: Partial<FormData> | null = site
    ? {
        nomeNegocio: site.nomeNegocio,
        segmento: site.segmento,
        cidade: site.cidade,
        bairro: site.bairro,
        corPaleta: site.corPaleta,
        logoUrl: site.logoUrl ?? undefined,
        servico1Nome: site.servico1Nome,
        servico1Desc: site.servico1Desc,
        servico2Nome: site.servico2Nome ?? undefined,
        servico2Desc: site.servico2Desc ?? undefined,
        servico3Nome: site.servico3Nome ?? undefined,
        servico3Desc: site.servico3Desc ?? undefined,
        servicoDestaque: site.servicoDestaque,
        resultadoCliente: site.resultadoCliente,
        clienteIdeal: site.clienteIdeal,
        dorPrincipal: site.dorPrincipal,
        anosNoMercado: site.anosNoMercado,
        totalClientes: site.totalClientes ?? undefined,
        certificados: site.certificados ?? undefined,
        depoimentos: site.depoimentos.map((d) => ({
          nomeCliente: d.nomeCliente,
          texto: d.texto,
        })),
        whatsapp: site.whatsapp,
        whatsappMensagem: site.whatsappMensagem,
        instagram: site.instagram ?? undefined,
        horarioAtendimento: site.horarioAtendimento,
      }
    : null

  return (
    <div className="py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {site ? 'Editar site' : 'Criar meu site'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Preencha as informações do seu negócio para gerar seu site com IA
          </p>
        </div>
        <FormStepper initialData={initialData} />
      </div>
    </div>
  )
}
