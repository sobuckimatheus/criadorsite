import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function searchWikipediaImage(name: string): Promise<string | null> {
  for (const lang of ['pt', 'en']) {
    try {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=600&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'CriadorSite/1.0 (contact@criadorsite.com.br)' } })
      if (!res.ok) continue
      const data = await res.json()
      const pages = data.query?.pages
      if (!pages) continue
      const page = Object.values(pages)[0] as Record<string, unknown>
      const thumb = (page?.thumbnail as Record<string, unknown>)?.source
      if (thumb && typeof thumb === 'string') return thumb
    } catch {
      continue
    }
  }
  return null
}

async function searchPexelsImage(query: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`,
      { headers: { Authorization: key } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.photos?.[0]?.src?.large ?? data.photos?.[0]?.src?.medium ?? null
  } catch {
    return null
  }
}

// Flat schema: one field per slide instead of nested array.
// Avoids the model encoding the slides array as a JSON string.
function buildSchema() {
  const properties: Record<string, unknown> = {
    titulo:        { type: 'string' },
    nicho:         { type: 'string' },
    tipo_narrativa:{ type: 'string' },
    legenda:       { type: 'string' },
    hashtags:      { type: 'string', description: 'Hashtags separadas por vírgula, sem o símbolo #' },
    total_slides:  { type: 'integer', description: 'Número total de slides (entre 8 e 12)' },
  }
  for (let i = 1; i <= 12; i++) {
    properties[`slide_${i}_texto`]   = { type: 'string', description: `Texto do slide ${i} — use **negrito** para ênfase` }
    properties[`slide_${i}_imagem`]  = { type: 'string', description: `3-5 palavras em inglês descritivas para buscar foto de CENA/AMBIENTE/OBJETO no slide ${i} (ex: "modern office startup team", "luxury watch close-up"), ou: sem imagem. NUNCA use apenas nomes de marcas ou empresas aqui.` }
    properties[`slide_${i}_destaque`]= { type: 'string', description: `3-6 palavras que resumem o slide ${i}` }
    properties[`slide_${i}_pessoa`]  = { type: 'string', description: `Nome completo de uma PESSOA FAMOSA real mencionada no slide ${i} (ex: "Elon Musk", "Steve Jobs", "Cristiano Ronaldo"). Deixe vazio se não houver pessoa famosa real.` }
    properties[`slide_${i}_empresa`] = { type: 'string', description: `Nome oficial de uma EMPRESA ou MARCA mencionada no slide ${i} (ex: "Apple Inc.", "Tesla", "Nike", "Google"). Deixe vazio se não houver empresa/marca.` }
  }
  const required = ['titulo', 'nicho', 'tipo_narrativa', 'legenda', 'hashtags', 'total_slides',
    ...Array.from({length: 8}, (_, i) => [`slide_${i+1}_texto`, `slide_${i+1}_imagem`, `slide_${i+1}_destaque`]).flat()]
  return { type: 'object' as const, properties, required }
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
6. O slide 1 deve apresentar o resultado/surpresa ANTES de contar a história
7. Alterne slides de texto puro com slides que pedem imagem
8. Máximo 12 slides, mínimo 8
9. NUNCA coloque um ponto ( . ) sozinho em uma linha — isso não é usado

ESTRUTURA DOS SLIDES:
- Slide 1: Gancho de contraste — mostre o resultado surpreendente antes de explicar
- Slides 2-3: Contexto/origem — quem é, de onde veio, o que tornava diferente
- Slides 4-6: A ascensão ou o problema — o momento de virada, números concretos
- Slides 7-9: O conflito ou aprendizado — a parte que ninguém conta
- Slides 10-11: A resolução e resultado — o que aconteceu depois
- Slide 12: Frase de impacto isolada + CTA para comentar

Preencha a ferramenta create_carousel com um campo por slide (slide_1_texto, slide_2_texto, etc.).

REGRAS PARA IMAGENS (muito importante):
- slide_X_pessoa: preencha com nome completo de pessoa famosa real mencionada (ex: "Elon Musk", "Oprah Winfrey") → buscará foto real do Wikipedia
- slide_X_empresa: preencha com nome oficial de empresa/marca mencionada (ex: "Apple Inc.", "Tesla", "Google", "Nike") → buscará logo/imagem do Wikipedia
- slide_X_imagem: use APENAS para fotos de cena/ambiente/objeto. NUNCA use nomes de marcas ou empresas aqui (ex correto: "modern tech office", "electric car highway", "luxury sneakers close-up")
- Se o slide tiver pessoa famosa OU empresa conhecida, preencha o campo específico e deixe slide_X_imagem como "sem imagem"`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      tools: [{ name: 'create_carousel', description: 'Cria o carrossel viral', input_schema: buildSchema() }],
      tool_choice: { type: 'tool', name: 'create_carousel' },
      messages: [{ role: 'user', content: prompt }],
    })

    if (message.stop_reason === 'max_tokens') {
      return NextResponse.json({ error: 'Resposta muito longa. Tente um tema mais conciso.' }, { status: 500 })
    }

    const toolUse = message.content.find((c) => c.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ error: 'IA não retornou os dados esperados' }, { status: 500 })
    }

    const input = toolUse.input as Record<string, unknown>

    // Reconstruct slides from flat fields — no JSON parsing needed
    const totalSlides = Math.min(12, Math.max(1, Number(input.total_slides) || 8))
    const slides: { texto: string; imagem_sugerida: string; destaque: string; pessoa?: string; empresa?: string; imageUrl?: string; imageType?: 'pessoa' | 'empresa' | 'pexels' }[] = []
    for (let i = 1; i <= totalSlides; i++) {
      const texto = String(input[`slide_${i}_texto`] ?? '').trim()
      if (!texto) continue
      const pessoa = String(input[`slide_${i}_pessoa`] ?? '').trim()
      const empresa = String(input[`slide_${i}_empresa`] ?? '').trim()
      slides.push({
        texto,
        imagem_sugerida: String(input[`slide_${i}_imagem`] ?? 'sem imagem'),
        destaque: String(input[`slide_${i}_destaque`] ?? ''),
        pessoa: pessoa || undefined,
        empresa: empresa || undefined,
      })
    }

    if (slides.length === 0) {
      return NextResponse.json({ error: 'IA não gerou slides' }, { status: 500 })
    }

    const hashtags = String(input.hashtags ?? '')
      .split(/[,\s#]+/).map(h => h.trim()).filter(Boolean)

    const carrossel = {
      titulo: String(input.titulo ?? ''),
      nicho: String(input.nicho ?? ''),
      tipo_narrativa: String(input.tipo_narrativa ?? ''),
      legenda: String(input.legenda ?? ''),
      hashtags,
      slides,
    }

    // Fetch images: Wikipedia for people/brands, Pexels for scene/ambient photos
    await Promise.all(
      carrossel.slides.map(async (slide, i) => {
        if (slide.pessoa) {
          const url = await searchWikipediaImage(slide.pessoa)
          if (url) { carrossel.slides[i].imageUrl = url; carrossel.slides[i].imageType = 'pessoa'; return }
        }
        if (slide.empresa) {
          const url = await searchWikipediaImage(slide.empresa)
          if (url) { carrossel.slides[i].imageUrl = url; carrossel.slides[i].imageType = 'empresa'; return }
        }
        if (slide.imagem_sugerida && slide.imagem_sugerida !== 'sem imagem') {
          const url = await searchPexelsImage(slide.imagem_sugerida)
          if (url) { carrossel.slides[i].imageUrl = url; carrossel.slides[i].imageType = 'pexels' }
        }
      })
    )

    return NextResponse.json({ carrossel })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
