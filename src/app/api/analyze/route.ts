import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { detectNiche, NICHE_REFERENCES } from '@/lib/niches'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { profile, nicheId } = await req.json()
  if (!profile) return NextResponse.json({ error: 'Profile obrigatório' }, { status: 400 })

  const niche = nicheId
    ? (NICHE_REFERENCES.find((n) => n.id === nicheId) ?? detectNiche({
        biography: profile.biography,
        category: profile.category?.name ?? profile.category,
        full_name: profile.full_name,
        username: profile.username,
      }))
    : detectNiche({
        biography: profile.biography,
        category: profile.category?.name ?? profile.category,
        full_name: profile.full_name,
        username: profile.username,
      })

  const followers = profile.edge_followed_by?.count ?? profile.follower_count ?? 0
  const following = profile.edge_follow?.count ?? profile.following_count ?? 0
  const posts = profile.edge_owner_to_timeline_media?.count ?? profile.media_count ?? 0
  const isVerified = profile.is_verified ?? false
  const bio = profile.biography ?? ''
  const name = profile.full_name ?? profile.username ?? ''
  const profilePic = profile.profile_pic_url ?? null
  const externalUrl = profile.external_url ?? null
  const category = profile.category?.name ?? profile.category ?? ''

  const recentMedia = profile.edge_owner_to_timeline_media?.edges?.slice(0, 12) ?? []
  const avgLikes =
    recentMedia.length > 0
      ? Math.round(
          recentMedia.reduce((sum: number, e: { node: { edge_liked_by?: { count: number }; like_count?: number } }) => {
            return sum + (e.node?.edge_liked_by?.count ?? e.node?.like_count ?? 0)
          }, 0) / recentMedia.length
        )
      : 0
  const avgComments =
    recentMedia.length > 0
      ? Math.round(
          recentMedia.reduce((sum: number, e: { node: { edge_media_to_comment?: { count: number }; comment_count?: number } }) => {
            return sum + (e.node?.edge_media_to_comment?.count ?? e.node?.comment_count ?? 0)
          }, 0) / recentMedia.length
        )
      : 0

  const engagementRate = followers > 0 ? ((avgLikes + avgComments) / followers) * 100 : 0

  const nicheRef = JSON.stringify({
    label: niche.label,
    avgEngagementRate: niche.avgEngagementRate,
    benchmarks: niche.benchmarks,
    bestPostingFrequency: niche.bestPostingFrequency,
    bestFormats: niche.bestFormats,
    bestHashtags: niche.bestHashtags,
    contentPillars: niche.contentPillars,
    bioTips: niche.bioTips,
  })

  const allNicheIds = NICHE_REFERENCES.map((n) => n.id)

  const prompt = `Você é um especialista em marketing digital e Instagram para negócios locais brasileiros.

Analise o perfil do Instagram abaixo e forneça uma análise completa e acionável.

IMPORTANTE sobre os campos do perfil:
- O campo "Categoria" é exibido logo abaixo do @username no Instagram (visível para todos os visitantes). Informações presentes na Categoria NÃO precisam ser repetidas na Bio — considere-as complementares.
- A "Bio" é o texto de descrição livre que aparece abaixo da Categoria.
- Ao analisar a bio e apontar problemas, leve em conta o perfil COMPLETO (Nome + Categoria + Bio + Link), não só a bio isolada.

DADOS DO PERFIL:
- Nome: ${name}
- Username: @${profile.username}
- Categoria (visível no perfil): ${category || '(não informada)'}
- Bio (texto livre): ${bio || '(sem bio)'}
- Link externo: ${externalUrl || '(nenhum)'}
- Seguidores: ${followers.toLocaleString('pt-BR')}
- Seguindo: ${following.toLocaleString('pt-BR')}
- Posts: ${posts}
- Verificado: ${isVerified ? 'Sim' : 'Não'}
- Média de likes (últimos posts): ${avgLikes}
- Média de comentários: ${avgComments}
- Taxa de engajamento calculada: ${engagementRate.toFixed(2)}%

NICHO DETECTADO: ${niche.label}
REFERÊNCIAS DO NICHO:
${nicheRef}

Com base nesses dados, gere uma análise JSON completa com EXATAMENTE esta estrutura:

{
  "nichoDetectado": "${niche.id}",
  "nichoLabel": "${niche.label}",
  "scores": {
    "geral": <0-100>,
    "bio": <0-100>,
    "engajamento": <0-100>,
    "consistencia": <0-100>,
    "conversao": <0-100>
  },
  "diagnostico": {
    "pontosFortesResumo": "<2-3 frases sobre o que está funcionando bem>",
    "pontosDeAtencaoResumo": "<2-3 frases sobre o que precisa melhorar>",
    "pontosFortesLista": ["item1", "item2", "item3"],
    "pontosDeAtencaoLista": ["item1", "item2", "item3"]
  },
  "bioAnalise": {
    "bioAtual": "${bio.replace(/"/g, '\\"')}",
    "problemas": ["problema1", "problema2"],
    "bioSugerida1": "<bio otimizada opção 1, máx 150 chars>",
    "bioSugerida2": "<bio otimizada opção 2, máx 150 chars>",
    "bioSugerida3": "<bio otimizada opção 3, máx 150 chars>",
    "dicasGerais": ["dica1", "dica2", "dica3"]
  },
  "planoDeAcao": {
    "urgente": [
      {"acao": "<ação>", "motivo": "<por que fazer>", "prazo": "<hoje/esta semana>"},
      {"acao": "<ação>", "motivo": "<por que fazer>", "prazo": "<hoje/esta semana>"}
    ],
    "curto_prazo": [
      {"acao": "<ação>", "motivo": "<por que fazer>", "prazo": "<próximas 2 semanas>"},
      {"acao": "<ação>", "motivo": "<por que fazer>", "prazo": "<próximas 2 semanas>"}
    ],
    "medio_prazo": [
      {"acao": "<ação>", "motivo": "<por que fazer>", "prazo": "<próximo mês>"},
      {"acao": "<ação>", "motivo": "<por que fazer>", "prazo": "<próximo mês>"}
    ]
  },
  "ideiasDePost": [
    {"formato": "Reels", "titulo": "<título do conteúdo>", "descricao": "<o que mostrar>", "legenda": "<sugestão de legenda>"},
    {"formato": "Carrossel", "titulo": "<título do conteúdo>", "descricao": "<o que mostrar>", "legenda": "<sugestão de legenda>"},
    {"formato": "Stories", "titulo": "<título do conteúdo>", "descricao": "<o que mostrar>", "legenda": "<sugestão de legenda>"},
    {"formato": "Reels", "titulo": "<título do conteúdo>", "descricao": "<o que mostrar>", "legenda": "<sugestão de legenda>"},
    {"formato": "Carrossel", "titulo": "<título do conteúdo>", "descricao": "<o que mostrar>", "legenda": "<sugestão de legenda>"}
  ],
  "hashtags": {
    "nicho": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "local": ["#tag1", "#tag2", "#tag3"],
    "tendencia": ["#tag1", "#tag2", "#tag3"],
    "engajamento": ["#tag1", "#tag2", "#tag3"],
    "estrategiaSugerida": "<como usar as hashtags, quantas por post, qual mix>"
  },
  "comparacao": {
    "posicaoNicho": "<micro/médio/macro influenciador>",
    "engajamentoVsMedia": "<acima/abaixo/na média do nicho>",
    "percentualEngajamento": ${engagementRate.toFixed(2)},
    "mediaDoNicho": ${niche.avgEngagementRate},
    "analiseComparativa": "<parágrafo comparando com benchmarks do nicho>",
    "metasSugeridas": {
      "seguidores3meses": <número realista>,
      "engajamentoAlvo": <percentual alvo>,
      "frequenciaPostagem": "${niche.bestPostingFrequency}"
    }
  }
}

Responda APENAS com o JSON válido, sem markdown, sem explicações.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada')

  const raw = content.text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()

  let analysis
  try {
    analysis = JSON.parse(raw)
  } catch {
    return NextResponse.json(
      { error: `Erro ao processar resposta da IA. stop_reason: ${message.stop_reason}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    analysis,
    profileSummary: {
      username: profile.username,
      name,
      bio,
      followers,
      following,
      posts,
      isVerified,
      externalUrl,
      profilePic,
      avgLikes,
      avgComments,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      category,
    },
  })
}
