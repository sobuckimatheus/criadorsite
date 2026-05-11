import { NextRequest, NextResponse } from 'next/server'

const BASE_STYLE = 'no text, no letters, no watermarks, no logos, no numbers, no typography'
const CINEMATIC = 'cinematic lighting, ultra realistic, premium aesthetic, editorial photography, instagram viral style, high contrast, dramatic atmosphere, empty space for text, depth of field, visually striking, ultra detailed'

// ── Composition styles — rotate per slide so each image has a different framing ──
const COMPOSITIONS = [
  'extreme close-up macro portrait, intimate detail, shallow depth of field',
  'dramatic side profile portrait, strong directional shadow, editorial lighting',
  'full face direct gaze portrait, powerful eye contact, symmetrical composition',
  'wide cinematic establishing shot, environmental context, atmospheric depth',
  'overhead flat lay concept, minimalist dark background, luxury product aesthetic',
  'low angle dynamic shot, heroic perspective, dramatic foreground element',
  'silhouette against dramatic backlight, mysterious atmosphere, rim lighting',
  'medium shot with negative space, subject right-aligned, dark moody background',
  'abstract macro texture detail, bokeh background, artistic blur, conceptual',
  'environmental portrait, subject embedded in setting, narrative context',
  'split lighting portrait, half shadow half light, high contrast drama',
  'aerial or bird\'s eye cinematic perspective, graphic composition, bold',
]

function pickComposition(seed: string): string {
  const hash = seed.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0)
  return COMPOSITIONS[hash % COMPOSITIONS.length]
}

// ── Prompts para o tema Viral (Flux Pro, cinematográfico por slide) ──────────
function buildViralPrompt(destaque: string, texto: string, nicho: string): string {
  const tema = destaque?.trim()
    || String(texto ?? '').replace(/\*\*/g, '').substring(0, 60)
    || 'cinematic premium scene'
  const textoClean = String(texto ?? '').replace(/\*\*/g, '').substring(0, 100)
  const nichoLC = (nicho ?? '').toLowerCase()
  const temaLC = tema.toLowerCase()
  const conteudo = temaLC + ' ' + textoClean.toLowerCase()

  const comp = pickComposition(tema)

  // ── Semantic content concepts (highest priority — apply regardless of nicho) ──

  if (/transform|antes.*depois|resultado|mudanç|progressiv|evoluç/i.test(conteudo))
    return `visual metamorphosis concept, ${tema}, ${comp}, dramatic contrast between shadow and light representing change, cinematic dark-to-bright transition, premium editorial, ${CINEMATIC}, ${BASE_STYLE}`

  if (/autoestim|confianç|poder|empoderamento|segurança|autoam|se sentir/i.test(conteudo))
    return `empowered confident person, ${tema}, ${comp}, strong cinematic lighting from above, defiant upward gaze, luxury aspirational aesthetic, dark background with single dramatic light, ${CINEMATIC}, ${BASE_STYLE}`

  if (/expressão|natural|sutil|discreto|suave|preserv|autentic/i.test(conteudo))
    return `authentic natural expression portrait, ${tema}, ${comp}, soft diffused lighting, genuine emotion, no-makeup editorial look, minimalist premium aesthetic, warm skin tones, ${CINEMATIC}, ${BASE_STYLE}`

  if (/recuper|cicatriz|heal|curar|tratamento|processo|tempo de/i.test(conteudo))
    return `serene healing concept, ${tema}, ${comp}, gentle ethereal light rays, calm atmosphere, luxury spa aesthetic, soft warm tones against dark background, ${CINEMATIC}, ${BASE_STYLE}`

  if (/jovem|juventude|envelhecimento|tempo|anos|idade|anti.?aging/i.test(conteudo))
    return `timeless beauty concept, ${tema}, ${comp}, golden hour light, ethereal glow, age-defying aesthetic, time metaphor with soft light particles, luxury visual storytelling, ${CINEMATIC}, ${BASE_STYLE}`

  if (/procedimento|técnica|injeção|ácido|fio|toxina|protocolo/i.test(conteudo))
    return `precision luxury medical aesthetic, ${tema}, ${comp}, clinical-meets-editorial lighting, clean sharp focus on detail, premium healthcare visual, sophisticated dark background, ${CINEMATIC}, ${BASE_STYLE}`

  if (/dor|medo|mito|verdade|mentira|acredita|sabia que|surpreend/i.test(conteudo))
    return `revealing dramatic concept, ${tema}, ${comp}, single beam of light cutting through darkness, contrast and tension, cinematic revelation moment, premium visual storytelling, ${CINEMATIC}, ${BASE_STYLE}`

  if (/resultado|antes|depois|caso|cliente|história|funciona/i.test(conteudo))
    return `aspirational beauty result, ${tema}, ${comp}, glowing luminous skin, dramatic before-after lighting concept, premium beauty editorial, dark background with highlight, ${CINEMATIC}, ${BASE_STYLE}`

  if (/risco|cuidado|atenção|seguro|perigo|certo|errado/i.test(conteudo))
    return `warning dramatic concept, ${tema}, ${comp}, high contrast chiaroscuro lighting, tension and focus, editorial advisory visual, sophisticated dark atmosphere, ${CINEMATIC}, ${BASE_STYLE}`

  // ── Niche fallbacks with varied compositions ──────────────────────────────

  if (/empreend|negócio|startup|financ|contab|marketing|vendas|liderança|gestão/i.test(nichoLC + ' ' + temaLC)) {
    const biz = [
      `luxury modern office architecture, ${tema}, ${comp}, dramatic architectural lighting, premium corporate aesthetic, dark glass and steel, aspirational atmosphere, ${CINEMATIC}, ${BASE_STYLE}`,
      `powerful executive portrait, ${tema}, ${comp}, dramatic side lighting, dark premium office background, authority and confidence, luxury branding visual, ${CINEMATIC}, ${BASE_STYLE}`,
      `abstract success concept, ${tema}, ${comp}, golden light breaking through darkness, cinematic achievement visual, premium motivational aesthetic, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    const h = tema.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return biz[h % biz.length]
  }

  if (/estética|harmoniz|beleza|skincare|facial|pele|cosm|salão|barbearia|odont/i.test(nichoLC + ' ' + temaLC)) {
    const beauty = [
      `extreme close-up eye beauty art, ${tema}, ${comp}, gold dust particles floating, dramatic studio light, dark background, luxury beauty campaign, ${CINEMATIC}, ${BASE_STYLE}`,
      `side profile beauty portrait, ${tema}, ${comp}, strong rim lighting against black background, silk fabric texture, premium editorial, jawline and neck detail, ${CINEMATIC}, ${BASE_STYLE}`,
      `luminous skin texture close-up, ${tema}, ${comp}, dewy glow under soft studio light, minimalist luxury aesthetic, pearl and white tones, ${CINEMATIC}, ${BASE_STYLE}`,
      `full face luxury portrait, ${tema}, ${comp}, dramatic split lighting, bold eyes, fashion week editorial aesthetic, dark moody background, ${CINEMATIC}, ${BASE_STYLE}`,
      `abstract beauty concept, ${tema}, ${comp}, liquid gold falling through light, dark background, artistic luxury visual, high contrast, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    const h = tema.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0)
    return beauty[h % beauty.length]
  }

  if (/saúde|fitness|academia|treino|corpo|musculaç|esporte|nutriç/i.test(nichoLC + ' ' + temaLC)) {
    const fit = [
      `intense athletic portrait, ${tema}, ${comp}, dramatic hard light, defined muscles, dark gym background, premium sports editorial, ${CINEMATIC}, ${BASE_STYLE}`,
      `dynamic action concept, ${tema}, ${comp}, motion blur with sharp focal point, powerful energy, cinematic sports visual, ${CINEMATIC}, ${BASE_STYLE}`,
      `motivational dark concept, ${tema}, ${comp}, single spotlight on subject, dark atmosphere, determination and power, premium fitness aesthetic, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    const h = tema.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return fit[h % fit.length]
  }

  if (/psicolog|mental|ansied|emoç|relacionament|autoestima|terapia/i.test(nichoLC + ' ' + temaLC)) {
    const psych = [
      `introspective emotional portrait, ${tema}, ${comp}, soft chiaroscuro lighting, contemplative gaze, psychological depth, premium storytelling, ${CINEMATIC}, ${BASE_STYLE}`,
      `abstract mind concept, ${tema}, ${comp}, light and shadow symbolism, elegant dark atmosphere, premium emotional visual, artistic depth, ${CINEMATIC}, ${BASE_STYLE}`,
      `vulnerable authentic moment, ${tema}, ${comp}, single light source, raw emotion, premium documentary aesthetic, dark intimate atmosphere, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    const h = tema.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return psych[h % psych.length]
  }

  if (/tecnolog|software|digital|ia\b|intelig.*artif|programaç/i.test(nichoLC + ' ' + temaLC)) {
    const tech = [
      `futuristic neon concept, ${tema}, ${comp}, blue and purple neon light on dark background, advanced tech aesthetic, cinematic high-tech, ${CINEMATIC}, ${BASE_STYLE}`,
      `abstract data visualization, ${tema}, ${comp}, glowing geometric patterns, dark background, sophisticated digital aesthetic, ${CINEMATIC}, ${BASE_STYLE}`,
      `human meets technology, ${tema}, ${comp}, dramatic light from screen, modern and sleek, premium tech editorial, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    const h = tema.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return tech[h % tech.length]
  }

  if (/espirit|meditaç|mindful|bem.?estar|yoga/i.test(nichoLC + ' ' + temaLC)) {
    const spirit = [
      `mystical ethereal concept, ${tema}, ${comp}, soft golden light from above, serene premium atmosphere, spiritual visual storytelling, ${CINEMATIC}, ${BASE_STYLE}`,
      `meditative portrait, ${tema}, ${comp}, zen atmosphere, warm candlelight, peaceful and profound, luxury wellness aesthetic, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    const h = tema.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return spirit[h % spirit.length]
  }

  if (/arquitetura|interior|design|imóv|constru/i.test(nichoLC + ' ' + temaLC))
    return `luxury interior design, ${tema}, ${comp}, dramatic architectural lighting, premium real estate editorial, sophisticated minimal space, dark and warm tones, ${CINEMATIC}, ${BASE_STYLE}`

  if (/roupa|moda|calçad|joia|semi.joia|ótica|fashion/i.test(nichoLC + ' ' + temaLC))
    return `high fashion editorial, ${tema}, ${comp}, editorial magazine lighting, premium product aesthetic, elegant backdrop, fashion week quality, ${CINEMATIC}, ${BASE_STYLE}`

  if (/educaç|infoprodut|curso|aprend/i.test(nichoLC + ' ' + temaLC))
    return `aspirational achievement concept, ${tema}, ${comp}, dramatic motivational lighting, sophisticated modern atmosphere, inspiring premium visual, ${CINEMATIC}, ${BASE_STYLE}`

  return `${tema}, ${comp}, cinematic premium editorial scene, luxury dark aesthetic, dramatic professional lighting, sophisticated composition, aspirational visual, ${CINEMATIC}, ${BASE_STYLE}`
}

// ── Prompts padrão (Flux Dev) ────────────────────────────────────────────────
function buildPrompt(destaque: string, texto: string, nicho: string): string {
  const tema = destaque?.trim()
    || String(texto ?? '').replace(/\*\*/g, '').substring(0, 60)
    || 'professional editorial scene'
  const ctx = String(texto ?? '').replace(/\*\*/g, '').substring(0, 120)
  const combined = (nicho ?? '') + ' ' + ctx
  const baseQuality = 'ultra realistic, photorealistic 8k, sharp focus, no text, no watermarks, no logos, vertical 4:5 portrait'

  if (/estética|harmoniz|saúde|odont|salão|barbearia|beleza|skincare|facial|pele|cosm/i.test(combined))
    return `${tema}, luxury beauty portrait photography, dramatic cinematic studio lighting, dark elegant background, flawless skin, premium beauty campaign aesthetic, black and gold color palette, ${baseQuality}`

  if (/roupa|moda|calçad|joia|semi.joia|ótica|fashion/i.test(combined))
    return `${tema}, luxury fashion editorial photography, clean minimal background, premium product shot, cinematic lighting, high-end magazine style, ${baseQuality}`

  if (/arquitetura|interior|design|imóv/i.test(combined))
    return `${tema}, luxury interior architecture photography, dramatic natural lighting, premium real estate editorial, cinematic wide angle, ${baseQuality}`

  if (/intelig.*artif|tecnolog|software|digital|ia\b/i.test(combined))
    return `${tema}, futuristic technology concept, dark background with blue and purple neon accents, cinematic lighting, modern tech aesthetic, ${baseQuality}`

  if (/empreend|negócio|startup|financ|contab/i.test(combined))
    return `${tema}, professional business editorial photography, modern office environment, cinematic lighting, premium corporate aesthetic, ${baseQuality}`

  return `${tema}, ${ctx.substring(0, 80)}, professional editorial photography for Instagram carousel, cinematic dramatic lighting, high contrast, premium aesthetic, ${baseQuality}`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FAL_KEY não configurada' }, { status: 500 })
  }

  try {
    const { destaque, texto, nicho, estilo } = await req.json()
    const isViral = estilo === 'viral'

    const prompt = isViral
      ? buildViralPrompt(destaque ?? '', texto ?? '', nicho ?? '')
      : buildPrompt(destaque ?? '', texto ?? '', nicho ?? '')

    const falModel = isViral ? 'fal-ai/flux-pro' : 'fal-ai/flux/dev'

    const body = isViral
      ? {
          prompt,
          image_size: { width: 1080, height: 1350 },
          num_inference_steps: 35,
          guidance_scale: 7.5,
          num_images: 1,
          safety_tolerance: '2',
          output_format: 'jpeg',
        }
      : {
          prompt,
          image_size: { width: 1080, height: 1350 },
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
          output_format: 'jpeg',
        }

    const res = await fetch(`https://fal.run/${falModel}`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Fal.ai ${res.status}: ${err.substring(0, 200)}`)
    }

    const data = await res.json() as { images?: { url: string }[] }
    const imageUrl = data.images?.[0]?.url
    if (!imageUrl) throw new Error('Nenhuma imagem retornada pela Fal.ai')

    return NextResponse.json({ imageUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
