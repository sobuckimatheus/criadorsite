import { z } from 'zod'

export const step1Schema = z.object({
  nomeNegocio: z.string().min(2, 'Nome obrigatório'),
  segmento: z.enum(['CLINICA', 'ESCRITORIO', 'OFICINA', 'CONSULTORIA', 'OUTRO']),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  corPaleta: z.string().min(1, 'Selecione uma paleta'),
  logoUrl: z.string().optional(),
})

export const step2Schema = z.object({
  servico1Nome: z.string().min(2, 'Nome do serviço obrigatório'),
  servico1Desc: z.string().min(10, 'Descrição obrigatória'),
  servico2Nome: z.string().optional(),
  servico2Desc: z.string().optional(),
  servico3Nome: z.string().optional(),
  servico3Desc: z.string().optional(),
  servicoDestaque: z.string().min(2, 'Serviço destaque obrigatório'),
  resultadoCliente: z.string().min(10, 'Descreva o resultado para o cliente'),
})

export const step3Schema = z.object({
  clienteIdeal: z.string().min(10, 'Descreva seu cliente ideal'),
  dorPrincipal: z.string().min(10, 'Descreva a principal dor'),
})

export const step4Schema = z.object({
  anosNoMercado: z.coerce.number().min(0, 'Anos no mercado obrigatório'),
  totalClientes: z.coerce.number().optional(),
  certificados: z.string().optional(),
  depoimentos: z
    .array(
      z.object({
        nomeCliente: z.string().min(2, 'Nome obrigatório'),
        texto: z.string().min(10, 'Depoimento obrigatório'),
      })
    )
    .default([]),
})

export const step5Schema = z.object({
  whatsapp: z.string().min(10, 'WhatsApp obrigatório'),
  whatsappMensagem: z.string().min(10, 'Mensagem obrigatória'),
  instagram: z.string().optional(),
  horarioAtendimento: z.string().min(5, 'Horário obrigatório'),
})

export const formSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)

export type FormData = z.infer<typeof formSchema>

export const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ['nomeNegocio', 'segmento', 'cidade', 'bairro', 'corPaleta'],
  2: ['servico1Nome', 'servico1Desc', 'servicoDestaque', 'resultadoCliente'],
  3: ['clienteIdeal', 'dorPrincipal'],
  4: ['anosNoMercado'],
  5: ['whatsapp', 'whatsappMensagem', 'horarioAtendimento'],
}

export const PALETAS = [
  {
    id: 'azul-profissional',
    label: 'Azul Profissional',
    primary: '#1E40AF',
    secondary: '#3B82F6',
    light: '#EFF6FF',
    dark: '#1E3A8A',
  },
  {
    id: 'verde-saude',
    label: 'Verde Saúde',
    primary: '#166534',
    secondary: '#22C55E',
    light: '#F0FDF4',
    dark: '#14532D',
  },
  {
    id: 'roxo-premium',
    label: 'Roxo Premium',
    primary: '#6B21A8',
    secondary: '#A855F7',
    light: '#FAF5FF',
    dark: '#581C87',
  },
]

export const SEGMENTO_LABELS: Record<string, string> = {
  CLINICA: 'Clínica',
  ESCRITORIO: 'Escritório',
  OFICINA: 'Oficina',
  CONSULTORIA: 'Consultoria',
  OUTRO: 'Outro',
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  GENERATING: 'Gerando...',
  PREVIEW: 'Preview',
  PUBLISHED: 'Publicado',
  ERROR: 'Erro',
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  GENERATING: 'bg-yellow-100 text-yellow-700',
  PREVIEW: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ERROR: 'bg-red-100 text-red-700',
}
