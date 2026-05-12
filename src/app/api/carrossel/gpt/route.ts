import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

async function searchWikipediaImage(name: string): Promise<string | null> {
  for (const domain of ['pt.wikipedia.org', 'en.wikipedia.org', 'commons.wikimedia.org']) {
    try {
      const url = `https://${domain}/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=600&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'CriadorSite/1.0 (contact@criadorsite.com.br)' } })
      if (!res.ok) continue
      const data = await res.json()
      const pages = data.query?.pages
      if (!pages) continue
      const page = Object.values(pages)[0] as Record<string, unknown>
      const thumb = (page?.thumbnail as Record<string, unknown>)?.source
      if (thumb && typeof thumb === 'string') return thumb
    } catch { continue }
  }
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&gsrlimit=3`
    const res = await fetch(url, { headers: { 'User-Agent': 'CriadorSite/1.0 (contact@criadorsite.com.br)' } })
    if (res.ok) {
      const data = await res.json()
      const pages = data.query?.pages
      if (pages) {
        for (const page of Object.values(pages) as Record<string, unknown>[]) {
          const thumb = ((page.imageinfo as Record<string, unknown>[])?.[0])?.thumburl as string | undefined
          if (thumb && thumb.startsWith('http')) return thumb
        }
      }
    }
  } catch { /* silent */ }
  return null
}

async function searchPexelsImage(query: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
      { headers: { Authorization: key } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const pick = data.photos?.[Math.floor(Math.random() * Math.min(5, data.photos?.length ?? 1))]
    return pick?.src?.portrait ?? pick?.src?.large ?? null
  } catch { return null }
}

function buildSchema() {
  const properties: Record<string, unknown> = {
    titulo:         { type: 'string' },
    nicho:          { type: 'string' },
    tipo_narrativa: { type: 'string' },
    legenda:        { type: 'string' },
    hashtags:       { type: 'string', description: 'Hashtags separadas por vírgula, sem o símbolo #' },
    total_slides:   { type: 'integer', description: 'Número total de slides (entre 8 e 12)' },
  }
  for (let i = 1; i <= 12; i++) {
    properties[`slide_${i}_texto`]    = { type: 'string', description: `Texto do slide ${i} — use **negrito** para ênfase` }
    properties[`slide_${i}_imagem`]   = { type: 'string', description: `3-6 palavras em inglês para buscar foto de stock para o slide ${i}. Descreva a cena/objeto/ambiente visual. Ex: "amazon rainforest golden light rays", "luxury dental clinic modern interior". Se o slide tiver pessoa famosa ou empresa, escreva: sem imagem.` }
    properties[`slide_${i}_destaque`] = { type: 'string', description: `3-6 palavras que resumem o slide ${i}` }
    properties[`slide_${i}_pessoa`]   = { type: 'string', description: `Nome completo de pessoa famosa real no slide ${i} (ex: "Elon Musk"). Deixe vazio se não houver.` }
    properties[`slide_${i}_empresa`]  = { type: 'string', description: `Nome oficial de empresa/marca no slide ${i} (ex: "Apple Inc."). Deixe vazio se não houver.` }
  }
  const required = ['titulo', 'nicho', 'tipo_narrativa', 'legenda', 'hashtags', 'total_slides',
    ...Array.from({ length: 8 }, (_, i) => [`slide_${i + 1}_texto`, `slide_${i + 1}_imagem`, `slide_${i + 1}_destaque`]).flat()]
  return { type: 'object' as const, properties, required }
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY não configurada' }, { status: 500 })
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

REGRAS OBRIGATÓRIAS DE ESTILO:
1. Frases CURTAS — máximo 15 palavras por frase
2. Uma ideia por parágrafo — nunca agrupe dois pensamentos
3. Use NEGRITO nas palavras de maior impacto (números, nomes, viradas)
4. Termine cada slide com uma frase que OBRIGA o leitor a passar pro próximo
5. Use datas, números reais e nomes quando possível
6. O slide 1 deve apresentar o resultado/surpresa ANTES de contar a história
7. Máximo 12 slides, mínimo 8
8. NUNCA coloque um ponto ( . ) sozinho em uma linha

ESTRUTURA DOS SLIDES:
- Slide 1: Gancho de contraste — mostre o resultado surpreendente antes de explicar
- Slides 2-3: Contexto/origem — quem é, de onde veio, o que tornava diferente
- Slides 4-6: A ascensão ou o problema — o momento de virada, números concretos
- Slides 7-9: O conflito ou aprendizado — a parte que ninguém conta
- Slides 10-11: A resolução e resultado — o que aconteceu depois
- Slide 12: Frase de impacto isolada + CTA para comentar

REGRAS PARA IMAGENS:
- slide_X_pessoa: nome completo de pessoa famosa real mencionada → foto Wikipedia
- slide_X_empresa: nome oficial de empresa/marca mencionada → imagem Wikipedia
- slide_X_imagem: query em inglês para Pexels/Unsplash. Seja VISUAL e ESPECÍFICO. Pense: "o que eu procuraria no Google Imagens para ilustrar esse slide?"
- Se tiver pessoa famosa OU empresa, deixe slide_X_imagem como "sem imagem"`

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      tools: [{
        type: 'function',
        function: {
          name: 'create_carousel',
          description: 'Cria o carrossel viral para Instagram',
          parameters: buildSchema(),
        },
      }],
      tool_choice: { type: 'function', function: { name: 'create_carousel' } },
      max_tokens: 8192,
    })

    if (response.choices[0]?.finish_reason === 'length') {
      return NextResponse.json({ error: 'Resposta muito longa. Tente um tema mais conciso.' }, { status: 500 })
    }

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (!toolCall || toolCall.type !== 'function') {
      return NextResponse.json({ error: 'GPT não retornou os dados esperados' }, { status: 500 })
    }

    const input = JSON.parse(toolCall.function.arguments) as Record<string, unknown>

    const totalSlides = Math.min(12, Math.max(1, Number(input.total_slides) || 8))
    const slides: {
      texto: string; imagem_sugerida: string; destaque: string
      pessoa?: string; empresa?: string; imageUrl?: string
      imageType?: 'pessoa' | 'empresa' | 'pexels'
    }[] = []

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
      return NextResponse.json({ error: 'GPT não gerou slides' }, { status: 500 })
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

    const usedUrls = new Set<string>()

    async function tryPexels(query: string, idx: number, type: 'pessoa' | 'empresa' | 'pexels') {
      if (!query || query === 'sem imagem') return
      const url = await searchPexelsImage(query)
      if (url && !usedUrls.has(url)) {
        usedUrls.add(url)
        carrossel.slides[idx].imageUrl = url
        carrossel.slides[idx].imageType = type
      }
    }

    for (let i = 0; i < carrossel.slides.length; i++) {
      const slide = carrossel.slides[i]
      if (slide.pessoa) {
        const url = await searchWikipediaImage(slide.pessoa)
        if (url && !usedUrls.has(url)) {
          usedUrls.add(url); carrossel.slides[i].imageUrl = url; carrossel.slides[i].imageType = 'pessoa'; continue
        }
        await tryPexels(slide.pessoa, i, 'pessoa'); continue
      }
      if (slide.empresa) {
        const url = await searchWikipediaImage(slide.empresa)
        if (url && !usedUrls.has(url)) {
          usedUrls.add(url); carrossel.slides[i].imageUrl = url; carrossel.slides[i].imageType = 'empresa'; continue
        }
        await tryPexels(slide.empresa, i, 'empresa'); continue
      }
      if (slide.imagem_sugerida && slide.imagem_sugerida !== 'sem imagem') {
        await tryPexels(slide.imagem_sugerida, i, 'pexels')
      }
    }

    return NextResponse.json({ carrossel })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
