import { NextRequest, NextResponse } from 'next/server'

const FAL_URL = 'https://fal.run/fal-ai/flux/dev'

function buildPrompt(destaque: string, texto: string, nicho: string): string {
  const tema = destaque?.trim()
    || String(texto ?? '').replace(/\*\*/g, '').substring(0, 60)
    || 'professional editorial scene'

  const ctx = String(texto ?? '').replace(/\*\*/g, '').substring(0, 120)
  const combined = (nicho ?? '') + ' ' + ctx

  const baseQuality = 'ultra realistic, photorealistic 8k, sharp focus, no text, no watermarks, no logos, square 1:1'

  if (/estética|harmoniz|saúde|odont|salão|barbearia|beleza|skincare|facial|pele|cosm/i.test(combined)) {
    return `${tema}, luxury beauty portrait photography, dramatic cinematic studio lighting, dark elegant background, flawless skin, premium beauty campaign aesthetic, black and gold color palette, ${baseQuality}`
  }

  if (/roupa|moda|calçad|joia|semi.joia|ótica|fashion/i.test(combined)) {
    return `${tema}, luxury fashion editorial photography, clean minimal background, premium product shot, cinematic lighting, high-end magazine style, ${baseQuality}`
  }

  if (/arquitetura|interior|design|imóv/i.test(combined)) {
    return `${tema}, luxury interior architecture photography, dramatic natural lighting, premium real estate editorial, cinematic wide angle, ${baseQuality}`
  }

  if (/intelig.*artif|tecnolog|software|digital|ia\b/i.test(combined)) {
    return `${tema}, futuristic technology concept, dark background with blue and purple neon accents, cinematic lighting, modern tech aesthetic, ${baseQuality}`
  }

  if (/empreend|negócio|startup|financ|contab/i.test(combined)) {
    return `${tema}, professional business editorial photography, modern office environment, cinematic lighting, premium corporate aesthetic, ${baseQuality}`
  }

  return `${tema}, ${ctx.substring(0, 80)}, professional editorial photography for Instagram carousel, cinematic dramatic lighting, high contrast, premium aesthetic, ${baseQuality}`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FAL_KEY não configurada' }, { status: 500 })
  }

  try {
    const { destaque, texto, nicho } = await req.json()
    const prompt = buildPrompt(destaque ?? '', texto ?? '', nicho ?? '')

    const res = await fetch(FAL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square_hd',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'jpeg',
      }),
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
