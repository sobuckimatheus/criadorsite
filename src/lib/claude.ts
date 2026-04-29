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
  foto1Url?: string | null
  foto2Url?: string | null
  foto3Url?: string | null
  fotoProfissionalUrl?: string | null
  depoimentos: { nomeCliente: string; texto: string }[]
  whatsapp: string
  whatsappMensagem: string
  instagram?: string | null
  horarioAtendimento: string
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / 360, sNorm = s / 100, lNorm = l / 100
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  let r, g, b
  if (s === 0) { r = g = b = lNorm } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q
    r = hue2rgb(p, q, hNorm + 1/3); g = hue2rgb(p, q, hNorm); b = hue2rgb(p, q, hNorm - 1/3)
  }
  return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`
}

function getPaleta(corPaleta: string) {
  const preset = PALETAS.find((p) => p.id === corPaleta)
  if (preset) return preset

  // corPaleta is a raw hex color (from logo extraction)
  if (/^#[0-9a-fA-F]{6}$/.test(corPaleta)) {
    const [h, s, l] = hexToHsl(corPaleta)
    return {
      primary: hslToHex(h, s, Math.min(Math.max(l, 25), 45)),
      secondary: hslToHex(h, Math.max(s - 10, 40), Math.min(l + 20, 65)),
      light: hslToHex(h, Math.min(s, 40), 95),
      dark: hslToHex(h, s, Math.max(l - 20, 10)),
    }
  }

  return { primary: '#1E40AF', secondary: '#3B82F6', light: '#EFF6FF', dark: '#1E3A8A' }
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
- Sem frameworks externos — apenas Google Fonts via @import no CSS
- CRÍTICO: Gere TODAS as seções antes de encerrar. Não pare no meio. O site deve estar 100% completo com </html> no final.
- Use CSS conciso com variáveis CSS (:root) para não desperdiçar tokens em repetição`

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
${data.fotoProfissionalUrl ? `- Foto do profissional: ${data.fotoProfissionalUrl}` : ''}

FOTOS DO NEGÓCIO:
${[data.foto1Url, data.foto2Url, data.foto3Url].filter(Boolean).length > 0
  ? [data.foto1Url, data.foto2Url, data.foto3Url].filter(Boolean).map((url, i) => `- Foto ${i + 1}: ${url}`).join('\n')
  : '- Nenhuma foto fornecida'}

DEPOIMENTOS:
${depoimentosList}

CONTATO:
- WhatsApp: ${data.whatsapp} | Link: ${whatsappLink}
- Mensagem padrão: ${data.whatsappMensagem}
${data.instagram ? `- Instagram: @${data.instagram.replace('@', '')}` : ''}
- Horário: ${data.horarioAtendimento}

IDENTIDADE VISUAL:
- Cor primária: ${paleta.primary}
- Cor secundária: ${paleta.secondary}
- Cor de fundo clara: ${paleta.light}
- Cor escura/texto: ${paleta.dark}
${data.logoUrl ? `- Logo: ${data.logoUrl}` : ''}

ESTRUTURA OBRIGATÓRIA (nesta ordem):
1. <header> — nome do negócio, menu âncora (Serviços, Sobre, Espaço, Contato)${data.logoUrl ? ', logo' : ''}
2. <section id="hero"> — headline impactante baseada na dor+resultado, subheadline, botão WhatsApp CTA grande
3. <section id="servicos"> — cards dos serviços com ícone emoji, título e descrição
4. <section id="sobre"> — números destacados (${data.anosNoMercado} anos, ${data.totalClientes ? data.totalClientes + '+ clientes' : 'experiência'})${data.certificados ? ', certificações' : ''}${data.fotoProfissionalUrl ? `, foto do profissional em destaque com object-fit:cover border-radius:12px` : ''}
5. ${[data.foto1Url, data.foto2Url, data.foto3Url].filter(Boolean).length > 0 ? `<section id="espaco"> — galeria com as fotos do negócio em grid responsivo (use as URLs exatas fornecidas com object-fit:cover, aspect-ratio:4/3, border-radius:12px)` : '<!-- sem galeria de fotos -->'}
6. ${data.depoimentos.length > 0 ? '<section id="depoimentos"> — cards de depoimentos com nome e texto' : '<!-- sem depoimentos -->'}
7. <section id="cta"> — seção CTA final com botão WhatsApp
8. <footer> — dados de contato, horário, Instagram (se houver), copyright

REQUISITOS TÉCNICOS:
- Mobile-first responsivo (breakpoint principal: 768px)
- Google Font 'Inter' via @import no CSS
- Botão WhatsApp flutuante fixo (canto inferior direito): position:fixed; bottom:24px; right:24px; width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:28px; com ícone 💬
- Efeito hover nos cards de serviços
- Gradiente suave no hero usando as cores da paleta
- Meta tags: title, description, viewport, og:title, og:description, og:type
- Schema.org LocalBusiness em JSON-LD dentro de <script type="application/ld+json">
- Suave scroll behavior: html { scroll-behavior: smooth }
- Cores de texto com contraste adequado para acessibilidade
- Use as URLs das fotos EXATAMENTE como fornecidas, sem modificar

Todos os links de WhatsApp devem usar exatamente: ${whatsappLink}

IMPORTANTE: Certifique-se de gerar TODAS as seções acima e fechar corretamente com </body></html>. Priorize completude sobre detalhamento de CSS.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
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

  console.log(`stop_reason: ${message.stop_reason} | tokens usados: ${message.usage.output_tokens} | tamanho HTML: ${content.text.length} chars`)
  if (message.stop_reason === 'max_tokens') {
    console.warn('HTML gerado foi cortado pelo limite de tokens — aumente max_tokens')
  }

  return content.text
    .replace(/^```html\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}
