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

async function searchPexelsImage(query: string, page = 1): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&page=${page}&orientation=portrait`,
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
    carousel_theme:  { type: 'string', description: 'Tema geral do carrossel em 3-5 palavras' },
    visual_style:    { type: 'string', description: 'Estilo visual em inglês (ex: "dark luxury cinematic premium")' },
    titulo:          { type: 'string', description: 'Título do carrossel' },
    nicho:           { type: 'string' },
    legenda:         { type: 'string', description: 'Legenda completa para o post no Instagram em PT-BR, com emojis e CTA final' },
    hashtags:        { type: 'string', description: 'Hashtags separadas por vírgula, sem o símbolo #' },
    total_slides:    { type: 'integer', description: 'Número total de slides (entre 8 e 12)' },
  }

  for (let i = 1; i <= 12; i++) {
    properties[`slide_${i}_headline`] = {
      type: 'string',
      description: `Headline do slide ${i} — curta (máx 8 palavras), forte, impactante, viral, em PT-BR`,
    }
    properties[`slide_${i}_body`] = {
      type: 'string',
      description: `Corpo do slide ${i} — 2 a 4 frases curtas (máx 15 palavras cada), retentivas, emocionais, em PT-BR. Use \\n entre parágrafos.`,
    }
    properties[`slide_${i}_highlight_words`] = {
      type: 'string',
      description: `Palavras-chave do slide ${i} para destacar em negrito dourado, separadas por vírgula (ex: "produtividade,hábitos,resultados"). Máx 4 palavras.`,
    }
    properties[`slide_${i}_cta`] = {
      type: 'string',
      description: `CTA sutil do slide ${i} — frase curta que convida continuar (ex: "Arraste →", "Continua no próximo", "Você não vai acreditar"). Vazio se não precisar.`,
    }
    properties[`slide_${i}_image_prompt`] = {
      type: 'string',
      description: `Prompt cinematográfico em INGLÊS para buscar foto de stock no Pexels. Formato: [assunto visual concreto], cinematic lighting, ultra realistic, premium aesthetic, editorial photography, [estilo do nicho], high contrast, dramatic atmosphere, professional photography, empty space for text, depth of field. NUNCA use nomes de pessoas/marcas. Se houver pessoa famosa ou empresa no slide, escreva: sem imagem.`,
    }
    properties[`slide_${i}_layout_style`] = {
      type: 'string',
      enum: ['full_dark', 'impact_cover', 'text_focus'],
      description: `Layout do slide ${i}: full_dark=foto full-bleed com overlay escuro e texto embaixo (padrão), impact_cover=headline enorme sobre a foto (use no slide 1 e slides de impacto), text_focus=fundo sólido escuro sem foto (use no slide final/CTA)`,
    }
    properties[`slide_${i}_pessoa`] = {
      type: 'string',
      description: `Nome completo de pessoa famosa real mencionada no slide ${i} (ex: "Elon Musk"). Vazio se não houver.`,
    }
    properties[`slide_${i}_empresa`] = {
      type: 'string',
      description: `Nome oficial de empresa/marca mencionada no slide ${i} (ex: "Apple Inc."). Vazio se não houver.`,
    }
  }

  const required = [
    'carousel_theme', 'visual_style', 'titulo', 'nicho', 'legenda', 'hashtags', 'total_slides',
    ...Array.from({ length: 8 }, (_, i) => [
      `slide_${i + 1}_headline`,
      `slide_${i + 1}_body`,
      `slide_${i + 1}_image_prompt`,
    ]).flat(),
  ]

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

    const nichoVisual: Record<string, string> = {
      'Negócios': 'luxury office environment, executive power, aspirational atmosphere',
      'Empreendedorismo': 'luxury office environment, executive power, aspirational atmosphere',
      'Infoprodutos': 'modern laptop workspace, digital success, clean minimal desk',
      'Fitness': 'dynamic athletic movement, dramatic gym lighting, strength and power',
      'Saúde e Estética': 'luxury medical clinic, pristine white interior, modern aesthetic',
      'Odontologia': 'luxury dental clinic, white modern interior, professional healthcare',
      'Psicologia': 'introspective emotional atmosphere, warm cinematic light, depth',
      'Relacionamentos': 'emotional intimacy, warm bokeh light, authentic connection',
      'Motivação': 'epic dramatic landscape, sunrise achievement, cinematic sky',
      'Espiritualidade': 'soft mystical light, ethereal peaceful atmosphere, divine glow',
      'Marketing': 'modern digital workspace, sleek tech environment, branding premium',
      'Inteligência Artificial': 'futuristic neon elegant, high-tech digital environment',
      'Arquitetura': 'luxury interior design, dramatic architectural lines, premium space',
      'Design de Interiores': 'luxury interior design, dramatic architectural lines, premium space',
      'Barbearia': 'premium barbershop, masculine dark aesthetic, professional grooming',
      'Salão de Beleza': 'luxury beauty salon, elegant feminine aesthetic, premium glow',
      'Joias e Semi-joias': 'luxury jewelry macro, elegant dark background, diamond sparkle',
      'Direito': 'prestigious law office, professional dark wood, authoritative atmosphere',
      'Contabilidade': 'modern corporate office, professional business aesthetic',
      'Pet Shop': 'adorable pets, warm natural light, cozy loving atmosphere',
      'Educação': 'modern learning environment, books and knowledge, inspirational study',
    }

    const visualAdapt = nichoVisual[nicho] ?? 'premium professional environment, cinematic atmosphere'

    const prompt = `Você é um diretor criativo e estrategista especialista em criar carrosséis virais premium para Instagram em QUALQUER NICHO.

Sua função é gerar carrosséis COMPLETOS e PROFISSIONAIS que pareçam criados por grandes creators, agências premium e ferramentas SaaS de alto nível.

==================================================
DADOS DO PROFISSIONAL
==================================================
- Nicho: ${nicho}
- Nome/Negócio: ${nome || 'o profissional'}
- Tipo de carrossel: ${tipoLabel} — ${tipoDesc}
- Tom: ${tomLabel} — ${tomDesc}
- Tema/Assunto: ${tema}

==================================================
OBJETIVO
==================================================
Criar slides extremamente profissionais, cinematográficos, emocionalmente envolventes, modernos e visualmente premium. Feitos para prender atenção e gerar retenção total.

==================================================
REGRAS DE HEADLINE
==================================================
- Máx 8 palavras
- Forte, viral, escaneável
- Gera curiosidade imediata
- Em português brasileiro

==================================================
REGRAS DO BODY TEXT
==================================================
- 2 a 4 frases curtas
- Máx 15 palavras por frase
- Uma ideia por frase
- Ritmo rápido, retentivo
- Gera cliffhanger pro próximo slide
- Usa números, datas, nomes quando possível
- Em português brasileiro

==================================================
ESTRUTURA DOS SLIDES
==================================================
- Slide 1: Gancho de contraste — resultado surpreendente ANTES de explicar. Layout: impact_cover
- Slides 2-3: Contexto/origem — quem é, de onde veio. Layout: full_dark
- Slides 4-6: Ascensão ou problema — virada, números concretos. Layout: full_dark
- Slides 7-9: Conflito ou aprendizado — a parte que ninguém conta. Layout: full_dark
- Slides 10-11: Resolução e resultado. Layout: full_dark
- Slide final: Frase de impacto + CTA para comentar. Layout: text_focus

==================================================
ESTRATÉGIA DE RETENÇÃO
==================================================
- Crie curiosidade progressiva
- Use cliffhangers sutis em cada slide
- Mantenha ritmo rápido e viciante
- Incentive compartilhamento no slide final

==================================================
REGRAS PARA IMAGE PROMPT (em inglês)
==================================================
Adapte ao nicho: ${visualAdapt}

Formato obrigatório:
[assunto visual concreto], cinematic lighting, ultra realistic, premium aesthetic, editorial photography, instagram viral style, [${visualAdapt}], high contrast, dramatic atmosphere, professional photography, empty space for text, depth of field, modern branding aesthetic, visually striking, ultra detailed

NUNCA use nomes de pessoas ou marcas no image_prompt.
Se o slide mencionar pessoa famosa → preencha slide_X_pessoa com o nome completo.
Se o slide mencionar empresa/marca → preencha slide_X_empresa com o nome oficial.
Nesses casos escreva "sem imagem" em slide_X_image_prompt.

Mínimo 8 slides, máximo 12.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      tools: [{
        type: 'function',
        function: {
          name: 'create_carousel',
          description: 'Cria o carrossel viral premium para Instagram',
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
      texto: string
      imagem_sugerida: string
      destaque: string
      pessoa?: string
      empresa?: string
      imageUrl?: string
      imageType?: 'pessoa' | 'empresa' | 'pexels'
      headline?: string
      body?: string
      highlight_words?: string[]
      cta?: string
      layout_style?: string
    }[] = []

    for (let i = 1; i <= totalSlides; i++) {
      const headline = String(input[`slide_${i}_headline`] ?? '').trim()
      const body = String(input[`slide_${i}_body`] ?? '').trim()
      if (!headline && !body) continue

      const highlightRaw = String(input[`slide_${i}_highlight_words`] ?? '')
      const highlight_words = highlightRaw.split(/[,،]+/).map(w => w.trim()).filter(Boolean)

      const pessoa = String(input[`slide_${i}_pessoa`] ?? '').trim()
      const empresa = String(input[`slide_${i}_empresa`] ?? '').trim()
      const imagePrompt = String(input[`slide_${i}_image_prompt`] ?? 'sem imagem').trim()
      const layoutStyle = String(input[`slide_${i}_layout_style`] ?? 'full_dark').trim()
      const cta = String(input[`slide_${i}_cta`] ?? '').trim()

      slides.push({
        texto: [headline, body].filter(Boolean).join('\n\n'),
        imagem_sugerida: imagePrompt,
        destaque: headline,
        pessoa: pessoa || undefined,
        empresa: empresa || undefined,
        headline,
        body,
        highlight_words,
        cta: cta || undefined,
        layout_style: layoutStyle,
      })
    }

    if (slides.length === 0) {
      return NextResponse.json({ error: 'GPT não gerou slides' }, { status: 500 })
    }

    const hashtags = String(input.hashtags ?? '')
      .split(/[,\s#]+/).map(h => h.trim()).filter(Boolean)

    const carrossel = {
      titulo: String(input.titulo ?? ''),
      nicho: String(input.nicho ?? nicho),
      tipo_narrativa: String(input.carousel_theme ?? ''),
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
      if (slide.layout_style === 'text_focus') continue

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
