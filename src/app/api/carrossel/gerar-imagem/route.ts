import { NextRequest, NextResponse } from 'next/server'

const BASE_STYLE = 'no text, no letters, no watermarks, no logos, no numbers, no typography'
const CINEMATIC = 'cinematic lighting, ultra realistic, premium aesthetic, editorial photography, instagram viral style, high contrast, dramatic atmosphere, empty space for text, depth of field, visually striking, ultra detailed'

// ── Prompts para o tema Viral (Flux Pro, cinematográfico por nicho) ──────────
function buildViralPrompt(destaque: string, texto: string, nicho: string): string {
  const tema = destaque?.trim()
    || String(texto ?? '').replace(/\*\*/g, '').substring(0, 60)
    || 'cinematic premium scene'
  const combined = (nicho ?? '') + ' ' + tema

  if (/empreend|negócio|startup|financ|contab|marketing|vendas|liderança|gestão/i.test(combined))
    return `successful entrepreneur in luxury modern office, premium business environment, ${tema}, dramatic cinematic lighting, dark elegant atmosphere, aspirational success visual, luxury corporate branding, sophisticated composition, ${CINEMATIC}, ${BASE_STYLE}`

  if (/estética|harmoniz|beleza|skincare|facial|pele|cosm|salão|barbearia|odont/i.test(combined))
    return `luxury beauty portrait, ${tema}, ultra realistic skin texture, sophisticated glow effect, dark studio background, dramatic cinematic lighting, premium beauty campaign, black and gold palette, ${CINEMATIC}, ${BASE_STYLE}`

  if (/saúde|fitness|academia|treino|corpo|musculaç|esporte|nutriç/i.test(combined))
    return `dramatic fitness scene, ${tema}, intense athletic aesthetic, powerful cinematic lighting, strong contrast, motivational visual, premium sports editorial, dynamic composition, ${CINEMATIC}, ${BASE_STYLE}`

  if (/psicolog|mental|ansied|emoç|relacionament|autoestima|terapia/i.test(combined))
    return `emotional cinematic portrait, ${tema}, elegant dark atmosphere, psychological depth, dramatic shadows, premium emotional storytelling, modern mental health aesthetic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/tecnolog|software|digital|ia\b|intelig.*artif|programaç/i.test(combined))
    return `futuristic technology scene, ${tema}, sophisticated neon lighting, premium tech aesthetic, modern digital branding, cinematic high-tech composition, ${CINEMATIC}, ${BASE_STYLE}`

  if (/espirit|meditaç|mindful|bem.?estar|yoga/i.test(combined))
    return `mystical spiritual scene, ${tema}, soft ethereal lighting, cinematic emotional atmosphere, serene premium aesthetic, emotional visual storytelling, ${CINEMATIC}, ${BASE_STYLE}`

  if (/arquitetura|interior|design|imóv|constru/i.test(combined))
    return `luxury interior architecture, ${tema}, dramatic natural lighting, premium real estate editorial, cinematic wide angle, sophisticated space, ${CINEMATIC}, ${BASE_STYLE}`

  if (/roupa|moda|calçad|joia|semi.joia|ótica|fashion/i.test(combined))
    return `luxury fashion editorial, ${tema}, cinematic studio lighting, premium product aesthetic, high fashion composition, elegant modern backdrop, ${CINEMATIC}, ${BASE_STYLE}`

  if (/educaç|infoprodut|curso|aprend|empreend/i.test(combined))
    return `premium aspirational environment, ${tema}, motivational visual, cinematic lighting, sophisticated composition, modern inspiring aesthetic, ${CINEMATIC}, ${BASE_STYLE}`

  return `${tema}, cinematic premium editorial scene, luxury aesthetic, dramatic professional lighting, sophisticated composition, aspirational emotionally engaging visual, ${CINEMATIC}, ${BASE_STYLE}`
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
