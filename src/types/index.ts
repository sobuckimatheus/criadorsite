import { z } from 'zod'

export const step1Schema = z.object({
  nomeNegocio: z.string().min(2, 'Nome obrigatório'),
  segmento: z.string().min(2, 'Segmento obrigatório'),
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
  foto1Url: z.string().optional(),
  foto2Url: z.string().optional(),
  foto3Url: z.string().optional(),
  fotoProfissionalUrl: z.string().optional(),
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
  {
    id: 'rosa-beleza',
    label: 'Rosa Beleza',
    primary: '#BE185D',
    secondary: '#F472B6',
    light: '#FDF2F8',
    dark: '#9D174D',
  },
  {
    id: 'laranja-energia',
    label: 'Laranja Energia',
    primary: '#C2410C',
    secondary: '#FB923C',
    light: '#FFF7ED',
    dark: '#9A3412',
  },
  {
    id: 'vermelho-paixao',
    label: 'Vermelho Paixão',
    primary: '#B91C1C',
    secondary: '#F87171',
    light: '#FEF2F2',
    dark: '#991B1B',
  },
  {
    id: 'cinza-elegante',
    label: 'Cinza Elegante',
    primary: '#374151',
    secondary: '#6B7280',
    light: '#F9FAFB',
    dark: '#111827',
  },
  {
    id: 'dourado-luxo',
    label: 'Dourado Luxo',
    primary: '#92400E',
    secondary: '#D97706',
    light: '#FFFBEB',
    dark: '#78350F',
  },
  {
    id: 'teal-moderno',
    label: 'Teal Moderno',
    primary: '#0F766E',
    secondary: '#2DD4BF',
    light: '#F0FDFA',
    dark: '#134E4A',
  },
]


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
