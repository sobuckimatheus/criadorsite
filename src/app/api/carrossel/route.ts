import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function repairLiteralNewlines(str: string): string {
  let out = ''
  let inStr = false
  let esc = false
  for (const ch of str) {
    if (esc) { out += ch; esc = false; continue }
    if (ch === '\\' && inStr) { out += ch; esc = true; continue }
    if (ch === '"') { inStr = !inStr; out += ch; continue }
    if (inStr && ch === '\n') { out += '\\n'; continue }
    if (inStr && ch === '\r') { out += '\\r'; continue }
    if (inStr && ch === '\t') { out += '\\t'; continue }
    out += ch
  }
  return out
}

async function searchPexelsImage(query: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`,
      { headers: { Authorization: key } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.photos?.[0]?.src?.large ?? data.photos?.[0]?.src?.medium ?? null
  } catch {
    return null
  }
}


export async function POST(req: NextRequest) {
  try {
  const { nicho, nome, tipo, tipoLabel, tipoDesc, tom, tomLabel, tomDesc, tema } = await req.json()

  if (!nicho || !tipo || !tema?.trim()) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const prompt = `Você é um especialista em copywriting viral para Instagram, com domínio absoluto do estilo de thread narrativa que para o scroll.

Crie um carrossel viral completo para Instagram seguindo RIGOROSAMENTE a estrutura abaixo.

DADOS DO PROFISSIONAL:
- Nicho: ${nicho}
- Nome/Negócio: ${nome || 'o profissional'}
- Tipo de carrossel: ${tipoLabel} — ${tipoDesc}
- Tom: ${tomLabel} — ${tomDesc}
- Tema/Assunto: ${tema}

REGRAS OBRIGATÓRIAS DE ESTILO (baseadas nos melhores carrosséis virais brasileiros):
1. Frases CURTAS — máximo 15 palavras por frase
2. Uma ideia por parágrafo — nunca agrupe dois pensamentos
3. Use NEGRITO nas palavras de maior impacto (números, nomes, viradas)
4. Termine cada slide com uma frase que OBRIGA o leitor a passar pro próximo
5. Use datas, números reais e nomes quando possível — especificidade gera credibilidade
6. Ponto final sozinho numa linha dá peso: "Não era." / "Ela se recusou." — use essa técnica
7. O slide 1 deve apresentar o resultado/surpresa ANTES de contar a história
8. Alterne slides de texto puro com slides que pedem imagem
9. Máximo 12 slides, mínimo 8

ESTRUTURA DOS SLIDES:
- Slide 1: Gancho de contraste — mostre o resultado surpreendente antes de explicar
- Slides 2-3: Contexto/origem — quem é, de onde veio, o que tornava diferente
- Slides 4-6: A ascensão ou o problema — o momento de virada, números concretos
- Slides 7-9: O conflito ou aprendizado — a parte que ninguém conta
- Slides 10-11: A resolução e resultado — o que aconteceu depois
- Slide 12: Frase de impacto isolada + CTA para comentar

Use a ferramenta create_carousel para retornar o carrossel completo. Para diálogos ou citações dentro do texto dos slides, use aspas curvas (") ou travessão (—) em vez de aspas retas.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    tools: [
      {
        name: 'create_carousel',
        description: 'Cria o carrossel viral completo',
        input_schema: {
          type: 'object' as const,
          properties: {
            titulo: { type: 'string' },
            nicho: { type: 'string' },
            tipo_narrativa: { type: 'string' },
            slides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  texto: { type: 'string', description: 'Texto do slide com **negrito** e \\n\\n entre parágrafos' },
                  imagem_sugerida: { type: 'string', description: '3-5 palavras em inglês para busca de foto, ou "sem imagem"' },
                  destaque: { type: 'string', description: 'Frase de 3-6 palavras resumindo o slide' },
                },
                required: ['texto', 'imagem_sugerida', 'destaque'],
              },
            },
            legenda: { type: 'string' },
            hashtags: { type: 'array', items: { type: 'string' } },
          },
          required: ['titulo', 'nicho', 'tipo_narrativa', 'slides', 'legenda', 'hashtags'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'create_carousel' },
    messages: [{ role: 'user', content: prompt }],
  })

  const toolUse = message.content.find((c) => c.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return NextResponse.json({ error: 'IA não retornou os dados esperados' }, { status: 500 })
  }

  // toolUse.input may arrive as a JSON string in some SDK/runtime combos
  let carrossel: Record<string, unknown>
  if (typeof toolUse.input === 'string') {
    try { carrossel = JSON.parse(toolUse.input as string) }
    catch { return NextResponse.json({ error: 'Falha ao parsear input da ferramenta' }, { status: 500 }) }
  } else {
    carrossel = toolUse.input as Record<string, unknown>
  }

  // slides may arrive as a JSON-encoded string with literal newlines; unwrap until it's an array
  let slidesVal: unknown = carrossel.slides
  let attempts = 0
  while (typeof slidesVal === 'string' && attempts < 4) {
    try {
      slidesVal = JSON.parse(slidesVal)
    } catch {
      try { slidesVal = JSON.parse(repairLiteralNewlines(slidesVal as string)) } catch { break }
    }
    attempts++
  }
  // Handle object-with-numeric-keys (non-standard array serialization)
  if (slidesVal !== null && typeof slidesVal === 'object' && !Array.isArray(slidesVal)) {
    const keys = Object.keys(slidesVal as object)
    if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
      slidesVal = Object.values(slidesVal as object)
    }
  }
  carrossel.slides = slidesVal

  if (!Array.isArray(carrossel.slides)) {
    return NextResponse.json({ error: 'IA retornou slides em formato inválido' }, { status: 500 })
  }

  // Normalize hashtags: Claude sometimes returns as a space-separated string
  if (typeof carrossel.hashtags === 'string') {
    carrossel.hashtags = (carrossel.hashtags as string).split(/[\s,#]+/).filter(Boolean)
  } else if (!Array.isArray(carrossel.hashtags)) {
    carrossel.hashtags = []
  }

  // Fetch Pexels images in parallel for slides that need one
  const slides = carrossel.slides as { texto: string; imagem_sugerida: string; destaque: string; imageUrl?: string }[]
  await Promise.all(
    slides.map(async (slide, i) => {
      if (slide.imagem_sugerida && slide.imagem_sugerida !== 'sem imagem') {
        const url = await searchPexelsImage(slide.imagem_sugerida)
        if (url) slides[i].imageUrl = url
      }
    })
  )

  return NextResponse.json({ carrossel })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
