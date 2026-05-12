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

    const systemPrompt = `Você é o melhor copywriter de carrosséis virais do Brasil.
Seu trabalho é criado por grandes agências de conteúdo premium, creators com milhões de seguidores e marcas de luxo.
Você pensa como um diretor criativo: cada slide é uma cena cinematográfica com emoção, tensão e progressão.
Você nunca escreve conteúdo genérico. Cada palavra tem peso. Cada frase tem propósito.`

    const userPrompt = `Crie um carrossel viral e PROFISSIONAL para Instagram com os dados abaixo.

DADOS:
- Nicho: ${nicho}
- Nome/Negócio: ${nome || 'o profissional'}
- Tipo: ${tipoLabel} — ${tipoDesc}
- Tom: ${tomLabel} — ${tomDesc}
- Tema: ${tema}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FÓRMULAS DE HEADLINE QUE FUNCIONAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use UMA dessas fórmulas para cada headline (máx 9 palavras):

• CONTRASTE: "De [situação ruim] a [resultado incrível] em [tempo]"
  Ex: "De R$200 no vermelho a R$50 mil em 8 meses"

• SEGREDO REVELADO: "O que [grupo] não quer que você saiba sobre [tema]"
  Ex: "O que seu banco não quer que você saiba"

• NÚMERO ESPECÍFICO: "[N] [coisas] que [resultado surpreendente]"
  Ex: "7 erros que destroem seu resultado sem você perceber"

• PERGUNTA DISRUPTIVA: "E se [crença comum] for mentira?"
  Ex: "E se trabalhar mais for o seu maior erro?"

• AFIRMAÇÃO PROVOCADORA: "[Verdade chocante] sobre [tema]"
  Ex: "Você está perdendo dinheiro todo mês sem saber"

• PROMESSA ESPECÍFICA: "Como [resultado concreto] em [tempo real]"
  Ex: "Como dobrei meu faturamento sem gastar mais"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS DO BODY TEXT (OBRIGATÓRIAS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEVE ter:
✓ 3 a 5 frases curtas (máx 12 palavras cada)
✓ Números reais, datas, porcentagens, nomes (especificidade = credibilidade)
✓ Uma frase de gancho no FINAL que force o próximo slide
✓ Variação de ritmo: frase longa → frase impactante curta
✓ Linguagem direta, sem rodeios — como se fosse um amigo contando algo urgente

PROIBIDO:
✗ Adjetivos vagos: "incrível", "fantástico", "maravilhoso", "excelente"
✗ Clichês: "se você quer mudar de vida", "chegou a hora", "não perca essa chance"
✗ Frases genéricas que poderiam ir em qualquer slide de qualquer nicho
✗ Conclusões no meio — cada slide deve terminar com tensão

EXEMPLO BOM (slide sobre fracasso antes do sucesso):
"Em 2019, ele perdeu R$180 mil em 3 meses.
A empresa foi à falência. Os sócios sumiram.
Só sobrou uma coisa.
E foi exatamente ela que mudou tudo."

EXEMPLO RUIM:
"Todo empreendedor passa por momentos difíceis.
É importante não desistir e continuar tentando.
Com dedicação, os resultados aparecem."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCO EMOCIONAL DOS SLIDES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 1 — GANCHO (layout: impact_cover)
Mostre o resultado final ANTES da história. Crie dissonância cognitiva.
O leitor deve pensar: "Como isso foi possível?"
Headline: use fórmula CONTRASTE ou AFIRMAÇÃO PROVOCADORA
CTA: "A história começa no próximo slide"

SLIDES 2-3 — CONTEXTO (layout: full_dark)
Quem é essa pessoa/marca? Qual era a realidade anterior?
Use detalhes sensoriais: lugar, ano, situação concreta.
Termine com: apresente o problema principal que vai ser resolvido.

SLIDES 4-6 — ESCALADA (layout: full_dark)
O momento de virada. Decisões arriscadas. Números concretos.
Mostre o que aconteceu — não o que "poderia" acontecer.
Use datas reais: "Em março de 2022...", "Após 47 dias..."
Cada slide deve aumentar a tensão.

SLIDES 7-9 — CONFLITO / REVELAÇÃO (layout: full_dark)
O que ninguém conta. A parte que a maioria pula.
Quebre uma crença do nicho. Revele um erro comum.
Este é o momento mais retentivo — o leitor PRECISA ver o próximo.

SLIDES 10-11 — RESOLUÇÃO (layout: full_dark)
O que aconteceu depois. Resultados com números.
Mostre a transformação com especificidade: não "cresceu muito", mas "cresceu 340% em 6 meses".

SLIDE FINAL — IMPACTO + CTA (layout: text_focus)
Uma frase de impacto que resuma a lição maior.
CTA direto: peça para comentar, salvar ou marcar alguém.
Ex: "Qual dessas lições você precisava ouvir hoje? Comenta aqui."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS PARA IMAGE PROMPT (INGLÊS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual base do nicho: ${visualAdapt}

Cada slide deve ter um image_prompt DIFERENTE e ESPECÍFICO para aquele conteúdo.
NÃO repita o mesmo conceito visual em slides diferentes.

Varie entre:
- Close-up de detalhe (mãos, objeto, textura)
- Ambiente wide (escritório, clínica, estúdio, paisagem)
- Retrato ambiental (pessoa em contexto, sem nome)
- Objeto simbólico (contrato, produto, equipamento)
- Cena emocional (conquista, tensão, reflexão)

Formato obrigatório:
[cena/objeto específico], [emoção/atmosfera], cinematic lighting, ultra realistic, premium editorial photography, ${visualAdapt}, high contrast, dramatic shadows, empty space for text overlay, depth of field, instagram premium aesthetic

EXEMPLOS por tipo:
Slide de fracasso → "businessman sitting alone in empty office late night, cinematic blue light, dramatic shadows, ultra realistic, empty space for text"
Slide de virada → "single bright light at end of dark corridor, cinematic dramatic, editorial photography, high contrast, depth of field"
Slide de resultado → "luxury penthouse view at golden hour, aspirational atmosphere, premium editorial, empty space for text, cinematic lighting"
Slide de aprendizado → "open book on dark wooden desk with single lamp, intimate atmosphere, cinematic warm light, depth of field"

NUNCA use nomes de pessoas ou marcas no image_prompt.
Se o slide citar pessoa famosa → slide_X_pessoa com nome completo.
Se o slide citar empresa/marca → slide_X_empresa com nome oficial.
Nesses casos: "sem imagem" em image_prompt.

Gere entre 9 e 12 slides.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
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
