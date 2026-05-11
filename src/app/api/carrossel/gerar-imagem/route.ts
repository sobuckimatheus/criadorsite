import { NextRequest, NextResponse } from 'next/server'

const BASE_STYLE = 'no text, no letters, no watermarks, no logos, no numbers, no typography'
const CINEMATIC = 'cinematic lighting, ultra realistic, premium aesthetic, editorial photography, instagram viral style, high contrast, dramatic atmosphere, empty space for text, depth of field, visually striking, ultra detailed'

// ── Portrait compositions for beauty/people niches ───────────────────────────
const PORTRAIT_ANGLES = [
  'extreme close-up of eyes and brows, shallow depth of field, bokeh background',
  'dramatic side profile, strong rim light on cheekbone and jawline',
  'three-quarter face portrait, direct confident gaze into camera',
  'close-up lips and lower face, soft golden background light',
  'full face symmetrical beauty portrait, direct eye contact',
  'over-the-shoulder glance back portrait, hair movement, dark background',
  'chin slightly raised, dramatic overhead light, strong jaw definition',
  'tilted head portrait, soft diffused light, relaxed serene expression',
]

// ── General cinematic compositions for non-portrait slides ───────────────────
const SCENE_ANGLES = [
  'wide cinematic shot, dramatic foreground element, atmospheric depth',
  'low angle heroic perspective, strong upward diagonal',
  'medium shot, subject right-aligned, large negative dark space left',
  'environmental portrait, subject embedded in rich setting',
  'split lighting portrait, half face in shadow half in light',
  'close-up detail shot, sharp focus on texture, blurred background',
]

function pickAngle(seed: string, pool: string[]): string {
  const hash = seed.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0)
  return pool[hash % pool.length]
}

// ── Prompts para o tema Viral (Flux Pro, fotorrealista por slide) ─────────────
function buildViralPrompt(destaque: string, texto: string, nicho: string): string {
  const tema = destaque?.trim()
    || String(texto ?? '').replace(/\*\*/g, '').substring(0, 60)
    || 'cinematic premium scene'
  const textoClean = String(texto ?? '').replace(/\*\*/g, '').substring(0, 100)
  const nichoLC = (nicho ?? '').toLowerCase()
  const temaLC = tema.toLowerCase()
  const conteudo = temaLC + ' ' + textoClean.toLowerCase()

  const isBeautyNiche = /saúde.*estética|estética|harmoniz|beleza|skincare|facial|pele|cosm|odontolog|salão/i.test(nichoLC)
  const isMasculineNiche = /barbearia/i.test(nichoLC)
  const angle = pickAngle(tema, (isBeautyNiche || isMasculineNiche) ? PORTRAIT_ANGLES : SCENE_ANGLES)

  // ── Universal content rules — run FIRST, before any niche logic ──────────
  // These fire based on what the slide is ABOUT, regardless of nicho

  if (/floresta|amazônia|amazon|selva|mata|bioma|biodiversidade|natureza|ecossistema|savana|cerrado|pantanal|caatinga/i.test(conteudo))
    return `lush tropical rainforest, dramatic shafts of golden light through dense canopy, rich green vegetation layers, atmospheric depth, photorealistic nature photography, ${CINEMATIC}, ${BASE_STYLE}`

  if (/fauna|animal|jaguar|onça|macaco|tucano|arara|cobra|boto|baleia|peixe|ave|pássaro|inseto|borboleta|espécie/i.test(conteudo))
    return `${tema}, dramatic wildlife close-up in natural habitat, cinematic nature photography, sharp detail, rich environment, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/oceano|mar|praia|coral|rio|cachoeira|lago|aquático|marinho|mangue/i.test(conteudo))
    return `dramatic tropical waterscape, powerful natural light, vivid colors, cinematic landscape photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/carnaval|festival|samba|dança|música|celebraç|colorido|fantasia|folclore/i.test(conteudo))
    return `vibrant Brazilian carnival scene, explosion of colors, dramatic festive lighting, cinematic documentary photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/cidade|skyline|capital|metrópole|urbano|monumento|cristo redentor|pão de açúcar|arquitetura histórica/i.test(conteudo))
    return `iconic Brazilian city landmark or skyline, dramatic golden hour or blue hour light, cinematic landscape photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/gastronomia|culinária|prato|receita|ingrediente|sabor|fruta|alimento|comida/i.test(conteudo))
    return `${tema}, premium food photography, dramatic side lighting, dark elegant surface, rich textures and colors, photorealistic culinary photography, ${CINEMATIC}, ${BASE_STYLE}`

  if (/ciência|pesquisa|descoberta|experimento|laboratório|fórmula|elemento|átomo|célula|dna|genética/i.test(conteudo))
    return `scientific research close-up, laboratory equipment with dramatic lighting, cinematic editorial photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/espaço|planeta|estrela|galáxia|universo|lua|sol|cosmos|astro/i.test(conteudo))
    return `dramatic space photography, ${tema}, deep cosmos with stars and nebula, cinematic astrophotography style, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/história|colonial|império|guerra|revolução|descobrimento|período|século|antiguidade|civilizaç/i.test(conteudo))
    return `dramatic historical monument or ancient architecture, cinematic documentary photography, moody atmospheric light, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  if (/economia|pib|riqueza|mercado|bolsa|dinheiro|ouro|recurso|mineral|petróleo/i.test(conteudo))
    return `dramatic financial or commodity visual, ${tema}, cinematic editorial photography, professional dramatic lighting, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

  // ── Beauty-niche content rules (only fire when nicho is beauty) ───────────

  if (isBeautyNiche) {
    if (/transform|antes.*depois|progressiv|evoluç|colágeno|estímul/i.test(conteudo))
      return `beautiful woman showing radiant glowing skin, ${angle}, warm golden light, luminous complexion, dark studio background, photorealistic beauty photography, ${CINEMATIC}, ${BASE_STYLE}`

    if (/autoestim|confianç|poder|empoderamento|se sentir/i.test(conteudo))
      return `confident beautiful woman looking directly into camera, ${angle}, strong dramatic overhead studio light, subtle empowered smile, dark background, photorealistic portrait photography, ${CINEMATIC}, ${BASE_STYLE}`

    if (/expressão|natural|sutil|discreto|suave|preserv|autentic/i.test(conteudo))
      return `beautiful woman with natural relaxed expression, ${angle}, soft diffused warm lighting, minimal makeup, genuine authentic look, dark warm background, photorealistic portrait photography, ${CINEMATIC}, ${BASE_STYLE}`

    if (/recuper|cicatriz|curar|tratamento|pouco tempo|retorno imediato/i.test(conteudo))
      return `serene beautiful woman with eyes gently closed, peaceful expression, ${angle}, warm soft golden light, luxury spa setting, dark background, photorealistic beauty photography, ${CINEMATIC}, ${BASE_STYLE}`

    if (/jovem|juventude|envelhecimento|tempo|anos|idade|anti.?aging/i.test(conteudo))
      return `beautiful woman with flawless luminous skin, ${angle}, golden warm studio light highlighting smooth skin texture, dark background, photorealistic editorial photography, ${CINEMATIC}, ${BASE_STYLE}`

    if (/procedimento|técnica|injeção|ácido hialurônico|toxina|botox|fio|protocolo/i.test(conteudo))
      return `luxury aesthetic medicine serum vials and syringe on dark marble surface, golden light reflection, premium medical products close-up, photorealistic product photography, ${CINEMATIC}, ${BASE_STYLE}`

    if (/matemática|proporção|áurea|simetria|medida|mapa/i.test(conteudo))
      return `beautiful woman face with subtle golden geometric proportion lines, ${angle}, dramatic studio lighting, symmetrical elegant portrait, dark background, photorealistic beauty photography, ${CINEMATIC}, ${BASE_STYLE}`

    if (/resultado|antes|depois|caso|cliente|funciona|diferença/i.test(conteudo))
      return `stunning woman with perfect glowing skin, ${angle}, premium beauty lighting, flawless complexion, luxury editorial photography, dark sophisticated background, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`

    if (/cuidado|atenção|escolha|profissional|qualificado|risco|seguro|mito|verdade|origem/i.test(conteudo))
      return `professional female aesthetician in modern luxury clinic, ${angle}, clean clinical setting, confident expert expression, photorealistic editorial photography, ${CINEMATIC}, ${BASE_STYLE}`

    // Beauty generic fallback
    const beauty = [
      `beautiful woman portrait, ${angle}, dramatic studio lighting, flawless skin, luxury beauty campaign, dark background, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `close-up woman face, ${angle}, warm golden rim light on cheekbone, dewy luminous skin, dark studio, premium editorial beauty photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
      `elegant woman side profile, ${angle}, strong contour lighting, silk against dark background, high fashion beauty editorial, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `beautiful woman with bold eye makeup, ${angle}, dramatic split studio lighting, dark moody background, luxury fashion week aesthetic, photorealistic portrait, ${CINEMATIC}, ${BASE_STYLE}`,
      `woman's face close-up showing perfect skin texture, ${angle}, soft beauty dish lighting, premium skincare campaign, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    const hb = tema.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0)
    return beauty[hb % beauty.length]
  }

  // ── Niche-specific fallbacks (covers all 21 niches in the platform) ─────────

  const h = tema.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0)

  // Odontologia
  if (/odontolog/i.test(nichoLC)) {
    const opts = [
      `extreme close-up of perfect white teeth and smile, ${angle}, dramatic studio lighting, premium dental aesthetic, dark background, photorealistic dental photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `beautiful person with radiant confident smile, ${angle}, bright clean studio light, premium oral health aesthetic, dark background, photorealistic portrait, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury dental clinic interior, modern equipment, clean white and dark tones, dramatic architectural lighting, photorealistic editorial photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Barbearia
  if (/barbearia/i.test(nichoLC)) {
    const opts = [
      `handsome man with sharp beard and fresh haircut, ${angle}, dramatic barber studio lighting, dark masculine background, premium grooming portrait, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `close-up straight razor and barber tools on dark marble surface, golden light, premium barbershop aesthetic, photorealistic product photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury barbershop interior, leather chairs, dark wood, dramatic warm lighting, masculine premium atmosphere, photorealistic editorial photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Psicologia
  if (/psicolog/i.test(nichoLC)) {
    const opts = [
      `introspective person in contemplative pose, ${angle}, soft chiaroscuro lighting, psychological depth, dark warm background, photorealistic portrait photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `person with closed eyes in peaceful moment, ${angle}, single soft light source, intimate atmosphere, premium documentary portrait, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `person with thoughtful emotional expression, ${angle}, low key dramatic lighting, honest vulnerable portrait, dark intimate background, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Direito
  if (/direito/i.test(nichoLC)) {
    const opts = [
      `confident lawyer in premium suit, ${angle}, dramatic side lighting, dark wood office background, books and scales of justice, authority and expertise, photorealistic portrait, ${CINEMATIC}, ${BASE_STYLE}`,
      `scales of justice on dark marble desk, dramatic golden side light, premium legal aesthetic, photorealistic editorial photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury law firm office interior, dark wood bookshelves, dramatic architectural lighting, prestigious atmosphere, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Contabilidade
  if (/contabil/i.test(nichoLC)) {
    const opts = [
      `confident accountant professional portrait, ${angle}, dramatic office lighting, premium business environment, dark background, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `financial charts and documents on premium dark desk, dramatic side light, golden pens, luxury business aesthetic, photorealistic product photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `modern accounting office interior, dramatic architectural lighting, premium corporate atmosphere, dark tones, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Empreendedorismo / Posicionamento
  if (/empreend|posicionamento/i.test(nichoLC)) {
    const opts = [
      `confident entrepreneur portrait, ${angle}, dramatic side lighting, dark glass and steel background, premium corporate aesthetic, authority and confidence, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury modern office interior, large windows, dramatic natural light, premium business environment, photorealistic architectural photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `successful professional in premium suit, ${angle}, dramatic window light, luxury office background, photorealistic portrait photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Infoprodutos / Educação
  if (/infoproduto|educaç/i.test(nichoLC)) {
    const opts = [
      `person confidently working on laptop in premium home office, ${angle}, dramatic side light, dark modern background, aspirational digital lifestyle, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `premium laptop and notepad on dark desk, dramatic golden side light, successful online creator aesthetic, photorealistic product photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `confident content creator recording video, ${angle}, ring light and dark studio background, modern digital creator setup, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Arquitetura / Design de Interiores
  if (/arquitetura|design.*interior|interior.*design/i.test(nichoLC)) {
    const opts = [
      `luxury interior design living room, dramatic natural light through floor-to-ceiling windows, sophisticated minimal dark tones, photorealistic architectural photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `stunning modern architectural exterior, dramatic golden hour light, premium real estate editorial, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury kitchen or bathroom interior detail, dark marble and gold accents, dramatic accent lighting, photorealistic editorial photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Inteligência Artificial
  if (/inteligência artificial|intelig.*artif|ia\b/i.test(nichoLC)) {
    const opts = [
      `person interacting with futuristic holographic AI interface, ${angle}, blue and purple neon light, dark background, cinematic high-tech, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `abstract neural network visualization with glowing nodes, dark background, sophisticated tech aesthetic, dramatic lighting, photorealistic editorial, ${CINEMATIC}, ${BASE_STYLE}`,
      `developer portrait with multiple screen data displays background, ${angle}, dramatic screen light, modern tech environment, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Estética Automotiva
  if (/automotiv/i.test(nichoLC)) {
    const opts = [
      `luxury sports car with perfect shine and reflection, dramatic studio lighting, dark background, premium automotive photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
      `close-up of polished car paint with light reflection, dramatic studio light, premium detailing aesthetic, photorealistic automotive photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury car detailing scene, professional applying ceramic coating, dramatic workshop lighting, premium automotive aesthetic, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Estúdio de Tatuagem
  if (/tatuagem/i.test(nichoLC)) {
    const opts = [
      `dramatic close-up of detailed tattoo art on skin, strong directional light, dark moody background, premium tattoo editorial photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
      `tattoo artist at work, close-up tattooing hand with needle, dramatic studio lighting, dark artistic atmosphere, photorealistic documentary photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `person showing premium tattoo artwork, ${angle}, dramatic moody lighting, dark background, editorial tattoo photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Joias e Semi-joias
  if (/joia|semi.?joia/i.test(nichoLC)) {
    const opts = [
      `luxury diamond ring or necklace close-up on dark velvet, dramatic golden studio light, premium jewelry photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
      `elegant woman wearing luxury jewelry, ${angle}, dramatic studio lighting, dark background, high-end jewelry campaign aesthetic, photorealistic portrait, ${CINEMATIC}, ${BASE_STYLE}`,
      `gemstone close-up with light refraction, macro photography, dark background, luxury jewelry editorial, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Óticas
  if (/ótica|otica/i.test(nichoLC)) {
    const opts = [
      `stylish person wearing premium eyeglasses, ${angle}, dramatic editorial lighting, dark background, luxury eyewear campaign, photorealistic portrait photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury eyeglasses frames close-up on dark surface, dramatic golden light reflection, premium optical product photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
      `extreme close-up of eye with premium eyeglasses, ${angle}, dramatic studio light, sharp detail, luxury eyewear editorial, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Pet Shop
  if (/pet/i.test(nichoLC)) {
    const opts = [
      `adorable dog or cat with expressive eyes, ${angle}, dramatic warm studio light, dark background, premium pet editorial photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
      `close-up portrait of beautiful dog or cat, ${angle}, soft dramatic side light, luxury pet campaign aesthetic, dark background, photorealistic animal photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `happy pet owner with dog or cat, ${angle}, warm natural light, authentic emotional moment, premium lifestyle photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // E-commerce
  if (/e.?commerce/i.test(nichoLC)) {
    const opts = [
      `premium product packaging on dark surface, dramatic golden side light, luxury e-commerce aesthetic, photorealistic product photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `person unboxing premium product, ${angle}, dramatic lifestyle photography, modern home background, photorealistic editorial, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury product flat lay on dark marble, multiple items styled elegantly, dramatic overhead light, photorealistic product photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Roupas e Calçados
  if (/roupa|calçado/i.test(nichoLC)) {
    const opts = [
      `high fashion model wearing premium outfit, ${angle}, editorial magazine studio lighting, elegant dark backdrop, photorealistic fashion photography, ${CINEMATIC}, ${BASE_STYLE}`,
      `luxury sneaker or shoe close-up on dark surface, dramatic golden side light, premium footwear product photography, photorealistic, ${CINEMATIC}, ${BASE_STYLE}`,
      `fashion detail shot of premium clothing texture, dramatic directional light, dark background, luxury fashion editorial, photorealistic photography, ${CINEMATIC}, ${BASE_STYLE}`,
    ]
    return opts[h % opts.length]
  }

  // Generic fallback — use tema directly as the image subject
  return `${tema}, photorealistic editorial photography, dramatic cinematic lighting, dark premium background, ${CINEMATIC}, ${BASE_STYLE}`
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
