import Anthropic from '@anthropic-ai/sdk'
import { PALETAS } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type SiteData = {
  nomeNegocio: string
  segmento: string
  cidade: string
  bairro: string
  corPaleta: string
  logoUrl?: string | null
  servico1Nome: string
  servico1Desc: string
  servico2Nome?: string | null
  servico2Desc?: string | null
  servico3Nome?: string | null
  servico3Desc?: string | null
  servicoDestaque: string
  resultadoCliente: string
  clienteIdeal: string
  dorPrincipal: string
  anosNoMercado: number
  totalClientes?: number | null
  certificados?: string | null
  depoimentos: { nomeCliente: string; texto: string }[]
  whatsapp: string
  whatsappMensagem: string
  instagram?: string | null
  horarioAtendimento: string
}

function getPaleta(corPaleta: string) {
  const found = PALETAS.find((p) => p.id === corPaleta)
  if (found) return found
  return { primary: corPaleta, secondary: corPaleta, light: '#FFFFFF', dark: '#111827' }
}

export async function generateSiteHTML(data: SiteData): Promise<string> {
  const paleta = getPaleta(data.corPaleta)

  const services = [
    `• ${data.servico1Nome}: ${data.servico1Desc}`,
    data.servico2Nome ? `• ${data.servico2Nome}: ${data.servico2Desc}` : null,
    data.servico3Nome ? `• ${data.servico3Nome}: ${data.servico3Desc}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const depoimentosList =
    data.depoimentos.length > 0
      ? data.depoimentos
          .map((d) => `• "${d.texto}" — ${d.nomeCliente}`)
          .join('\n')
      : 'Nenhum depoimento fornecido'

  const whatsappNum = data.whatsapp.replace(/\D/g, '')
  const whatsappLink = `https://wa.me/55${whatsappNum}?text=${encodeURIComponent(data.whatsappMensagem)}`

  const systemPrompt = `Você é um expert em criar sites de alta conversão para pequenos negócios locais brasileiros. Você domina HTML5, CSS3, design responsivo mobile-first e técnicas de copywriting para conversão.

REGRAS ABSOLUTAS:
- Retorne APENAS o código HTML completo, começando com <!DOCTYPE html> e terminando com </html>
- Sem markdown, sem blocos de código (sem \`\`\`html), sem explicações
- CSS embutido em <style> dentro do <head>
- JavaScript mínimo inline em <script> no final do body se necessário
- Sem frameworks externos — apenas Google Fonts via @import no CSS`

  const userPrompt = `Gere um site completo e profissional de alta conversão para o seguinte negócio local:

NEGÓCIO:
- Nome: ${data.nomeNegocio}
- Segmento: ${data.segmento}
- Localização: ${data.bairro}, ${data.cidade}
- Serviço destaque: ${data.servicoDestaque}
- Resultado entregue ao cliente: ${data.resultadoCliente}

SERVIÇOS:
${services}

PÚBLICO E POSICIONAMENTO:
- Cliente ideal: ${data.clienteIdeal}
- Dor principal resolvida: ${data.dorPrincipal}

CREDIBILIDADE:
- Anos no mercado: ${data.anosNoMercado}
${data.totalClientes ? `- Clientes atendidos: ${data.totalClientes}+` : ''}
${data.certificados ? `- Certificações/Formações: ${data.certificados}` : ''}

DEPOIMENTOS:
${depoimentosList}

CONTATO:
- WhatsApp: ${data.whatsapp} | Link: ${whatsappLink}
- Mensagem padrão: ${data.whatsappMensagem}
${data.instagram ? `- Instagram: @${data.instagram.replace('@', '')}` : ''}
- Horário: ${data.horarioAtendimento}

IDENTIDADE VISUAL:
- Cor primária: ${paleta.primary}
- Cor secundária: ${'secondary' in paleta ? paleta.secondary : paleta.primary}
- Cor de fundo clara: ${'light' in paleta ? paleta.light : '#FFFFFF'}
- Cor escura/texto: ${'dark' in paleta ? paleta.dark : '#111827'}
${data.logoUrl ? `- Logo: ${data.logoUrl}` : ''}

ESTRUTURA OBRIGATÓRIA (nesta ordem):
1. <header> — nome do negócio, menu âncora (Serviços, Sobre, Contato)${data.logoUrl ? ', logo' : ''}
2. <section id="hero"> — headline impactante baseada na dor+resultado, subheadline, botão WhatsApp CTA grande
3. <section id="servicos"> — cards dos serviços com ícone emoji, título e descrição
4. <section id="sobre"> — números destacados (${data.anosNoMercado} anos, ${data.totalClientes ? data.totalClientes + '+ clientes' : 'experiência'})${data.certificados ? ', certificações' : ''}
5. ${data.depoimentos.length > 0 ? '<section id="depoimentos"> — cards de depoimentos com nome e texto' : '<!-- sem depoimentos -->'}
6. <section id="cta"> — seção CTA final com botão WhatsApp
7. <footer> — dados de contato, horário, Instagram (se houver), copyright

REQUISITOS TÉCNICOS:
- Mobile-first responsivo (breakpoint principal: 768px)
- Google Font 'Inter' via @import no CSS
- Botão WhatsApp flutuante fixo (canto inferior direito) com ícone ✉ ou 📱
- Efeito hover nos cards de serviços
- Gradiente suave no hero usando as cores da paleta
- Meta tags: title, description, viewport, og:title, og:description, og:type
- Schema.org LocalBusiness em JSON-LD dentro de <script type="application/ld+json">
- Suave scroll behavior: html { scroll-behavior: smooth }
- Cores de texto com contraste adequado para acessibilidade

Todos os links de WhatsApp devem usar exatamente: ${whatsappLink}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada da IA')

  return content.text
    .replace(/^```html\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}
