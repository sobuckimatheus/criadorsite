'use client'

import { useState } from 'react'
import { Search, Loader2, Instagram, CheckCircle2, AlertCircle, ChevronRight, Zap, Target, Hash, BarChart2, FileText, Lightbulb, User, Star, Pin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NICHE_REFERENCES } from '@/lib/niches'

type ProfileSummary = {
  username: string
  name: string
  bio: string
  followers: number
  following: number
  posts: number
  isVerified: boolean
  externalUrl: string | null
  profilePic: string | null
  avgLikes: number
  avgComments: number
  engagementRate: number
  category: string
}

type Analysis = {
  nichoDetectado: string
  nichoLabel: string
  scores: { geral: number; bio: number; engajamento: number; consistencia: number; conversao: number }
  diagnostico: {
    pontosFortesResumo: string
    pontosDeAtencaoResumo: string
    pontosFortesLista: string[]
    pontosDeAtencaoLista: string[]
  }
  bioAnalise: {
    bioAtual: string
    problemas: string[]
    bioSugerida1: string
    bioSugerida2: string
    bioSugerida3: string
    dicasGerais: string[]
  }
  planoDeAcao: {
    urgente: { acao: string; motivo: string; prazo: string }[]
    curto_prazo: { acao: string; motivo: string; prazo: string }[]
    medio_prazo: { acao: string; motivo: string; prazo: string }[]
  }
  ideiasDePost: { formato: string; titulo: string; descricao: string; legenda: string }[]
  hashtags: {
    nicho: string[]
    local: string[]
    tendencia: string[]
    engajamento: string[]
    estrategiaSugerida: string
  }
  comparacao: {
    posicaoNicho: string
    engajamentoVsMedia: string
    percentualEngajamento: number
    mediaDoNicho: number
    analiseComparativa: string
    metasSugeridas: { seguidores3meses: number; engajamentoAlvo: number; frequenciaPostagem: string }
  }
  destaques: {
    quantidade: number
    avaliacao: string
    listaAnalise: { titulo: string; tituloOk: boolean; sugestao: string }[]
    coberturas: string
    sugestoesTitulos: string[]
    recomendacoes: string[]
  }
  postsFixados: {
    quantidade: number
    avaliacao: string
    temApresentacao: boolean
    temResultado: boolean
    analise: string
    recomendacoes: { posicao: number; tipo: string; descricao: string }[]
  }
}

function ScoreCircle({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const r = size * 0.38
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const progress = (score / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size * 0.09} />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.09}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.22} fontWeight="700" fill="#111827">
          {score}
        </text>
      </svg>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? 'bg-green-500' : value >= 45 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

type Tab = 'diagnostico' | 'bio' | 'plano' | 'posts' | 'hashtags' | 'comparacao' | 'destaques'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'diagnostico', label: 'Diagnóstico', icon: BarChart2 },
  { id: 'bio', label: 'Bio', icon: FileText },
  { id: 'destaques', label: 'Destaques & Fixados', icon: Star },
  { id: 'plano', label: 'Plano de Ação', icon: Target },
  { id: 'posts', label: 'Ideias de Post', icon: Lightbulb },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
  { id: 'comparacao', label: 'Comparação', icon: Zap },
]

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export default function InstagramPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'fetching' | 'analyzing'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileSummary | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [selectedNiche, setSelectedNiche] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('diagnostico')
  const [copiedBio, setCopiedBio] = useState<number | null>(null)

  async function handleAnalyze() {
    if (!username.trim()) return
    setLoading(true)
    setError(null)
    setProfile(null)
    setAnalysis(null)
    setStep('fetching')

    try {
      const igRes = await fetch('/api/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const igData = await igRes.json()
      if (!igRes.ok) throw new Error(igData.error ?? 'Erro ao buscar perfil')

      setStep('analyzing')
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: igData.profile,
          nicheId: selectedNiche || undefined,
          highlights: igData.highlights,
          pinnedPosts: igData.pinnedPosts,
        }),
      })
      const analyzeData = await analyzeRes.json()
      if (!analyzeRes.ok) throw new Error(analyzeData.error ?? 'Erro ao analisar')

      setProfile(analyzeData.profileSummary)
      setAnalysis(analyzeData.analysis)
      setActiveTab('diagnostico')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  function copyBio(text: string, idx: number) {
    navigator.clipboard.writeText(text)
    setCopiedBio(idx)
    setTimeout(() => setCopiedBio(null), 2000)
  }

  return (
    <div className="py-8 px-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Instagram className="w-5 h-5 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Analisador de Instagram</h1>
        </div>
        <p className="text-sm text-gray-500">Diagnóstico completo do perfil com recomendações personalizadas por nicho</p>
      </div>

      {/* Search */}
      <div className="space-y-3 mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
              placeholder="usuario do instagram"
              className="pl-8"
              disabled={loading}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading || !username.trim()} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? (step === 'fetching' ? 'Buscando...' : 'Analisando...') : 'Analisar'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Nicho do perfil:</label>
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            disabled={loading}
            className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">Detectar automaticamente pela bio</option>
            {NICHE_REFERENCES.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-sm text-gray-500">
            {step === 'fetching' ? 'Buscando dados do perfil...' : 'Analisando com IA...'}
          </p>
        </div>
      )}

      {profile && analysis && !loading && (
        <>
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-100 flex items-center justify-center">
              {profile.profilePic ? (
                <img
                  src={`/api/proxy-image?url=${encodeURIComponent(profile.profilePic)}`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <User className="w-7 h-7 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{profile.name}</span>
                {profile.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                <span className="text-sm text-gray-400">@{profile.username}</span>
              </div>
              {profile.category && <p className="text-xs text-pink-600 mt-0.5">{profile.category}</p>}
              {profile.bio && <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{profile.bio}</p>}
              <div className="flex gap-5 mt-3">
                {[
                  { label: 'Seguidores', value: formatNumber(profile.followers) },
                  { label: 'Seguindo', value: formatNumber(profile.following) },
                  { label: 'Posts', value: formatNumber(profile.posts) },
                  { label: 'Engajamento', value: `${profile.engagementRate.toFixed(1)}%` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="font-semibold text-gray-900 text-sm">{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score Overview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Pontuação Geral</h2>
              <span className="text-xs px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full">{analysis.nichoLabel}</span>
            </div>
            <div className="flex justify-around mb-5">
              <ScoreCircle score={analysis.scores.geral} label="Geral" size={90} />
              <ScoreCircle score={analysis.scores.bio} label="Bio" size={70} />
              <ScoreCircle score={analysis.scores.engajamento} label="Engajamento" size={70} />
              <ScoreCircle score={analysis.scores.consistencia} label="Consistência" size={70} />
              <ScoreCircle score={analysis.scores.conversao} label="Conversão" size={70} />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-none">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === id
                      ? 'border-b-2 border-pink-500 text-pink-600 font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Diagnóstico */}
              {activeTab === 'diagnostico' && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <ScoreBar label="Bio" value={analysis.scores.bio} />
                    <ScoreBar label="Engajamento" value={analysis.scores.engajamento} />
                    <ScoreBar label="Consistência" value={analysis.scores.consistencia} />
                    <ScoreBar label="Conversão" value={analysis.scores.conversao} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Pontos Fortes
                      </h3>
                      <ul className="space-y-1.5">
                        {(analysis.diagnostico.pontosFortesLista ?? []).map((item, i) => (
                          <li key={i} className="text-sm text-green-700 flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Pontos de Atenção
                      </h3>
                      <ul className="space-y-1.5">
                        {(analysis.diagnostico.pontosDeAtencaoLista ?? []).map((item, i) => (
                          <li key={i} className="text-sm text-red-700 flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Bio */}
              {activeTab === 'bio' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Bio Atual</h3>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200 whitespace-pre-wrap">
                      {analysis.bioAnalise.bioAtual || '(sem bio)'}
                    </div>
                  </div>

                  {(analysis.bioAnalise.problemas ?? []).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-700 mb-2">Problemas identificados</h3>
                      <ul className="space-y-1">
                        {(analysis.bioAnalise.problemas ?? []).map((p, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Sugestões de Bio</h3>
                    <div className="space-y-3">
                      {[analysis.bioAnalise.bioSugerida1, analysis.bioAnalise.bioSugerida2, analysis.bioAnalise.bioSugerida3].map((bio, i) => (
                        bio && (
                          <div key={i} className="border border-gray-200 rounded-lg p-3 hover:border-pink-300 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-gray-800 flex-1 whitespace-pre-wrap">{bio}</p>
                              <button
                                onClick={() => copyBio(bio, i)}
                                className="text-xs text-pink-600 hover:text-pink-700 flex-shrink-0 font-medium"
                              >
                                {copiedBio === i ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-1.5">{bio.length}/150 chars</div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Dicas Gerais</h3>
                    <ul className="space-y-1.5">
                      {(analysis.bioAnalise.dicasGerais ?? []).map((d, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-pink-400" />{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Plano de Ação */}
              {activeTab === 'plano' && (
                <div className="space-y-5">
                  {[
                    { key: 'urgente', label: 'Urgente', color: 'red', items: analysis.planoDeAcao.urgente },
                    { key: 'curto_prazo', label: 'Curto Prazo', color: 'amber', items: analysis.planoDeAcao.curto_prazo },
                    { key: 'medio_prazo', label: 'Médio Prazo', color: 'blue', items: analysis.planoDeAcao.medio_prazo },
                  ].map(({ key, label, color, items }) => (
                    items?.length > 0 && (
                      <div key={key}>
                        <h3 className={`text-sm font-semibold mb-2 text-${color}-700`}>{label}</h3>
                        <div className="space-y-2">
                          {items.map((item, i) => (
                            <div key={i} className={`border border-${color}-100 bg-${color}-50 rounded-lg p-3`}>
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium text-${color}-900`}>{item.acao}</p>
                                <span className={`text-xs text-${color}-600 flex-shrink-0 bg-${color}-100 px-2 py-0.5 rounded`}>{item.prazo}</span>
                              </div>
                              <p className={`text-xs text-${color}-700 mt-1`}>{item.motivo}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Ideias de Post */}
              {activeTab === 'posts' && (
                <div className="space-y-3">
                  {(analysis.ideiasDePost ?? []).map((post, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">{post.titulo}</h3>
                        <span className="text-xs px-2 py-0.5 bg-pink-50 text-pink-700 rounded">{post.formato}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.descricao}</p>
                      <div className="bg-gray-50 rounded p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Sugestão de legenda:</p>
                        <p className="text-xs text-gray-700">{post.legenda}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtags */}
              {activeTab === 'hashtags' && (
                <div className="space-y-5">
                  {[
                    { label: 'Nicho', tags: analysis.hashtags.nicho, color: 'pink' },
                    { label: 'Local', tags: analysis.hashtags.local, color: 'blue' },
                    { label: 'Tendência', tags: analysis.hashtags.tendencia, color: 'purple' },
                    { label: 'Engajamento', tags: analysis.hashtags.engajamento, color: 'green' },
                  ].map(({ label, tags, color }) => (
                    <div key={label}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
                      <div className="flex flex-wrap gap-2">
                        {tags?.map((tag, i) => (
                          <span key={i} className={`text-sm px-2.5 py-1 bg-${color}-50 text-${color}-700 rounded-full border border-${color}-100`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1.5">Estratégia de uso</h3>
                    <p className="text-sm text-gray-600">{analysis.hashtags.estrategiaSugerida}</p>
                  </div>
                </div>
              )}

              {/* Comparação */}
              {activeTab === 'comparacao' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Engajamento atual', value: `${analysis.comparacao.percentualEngajamento}%` },
                      { label: 'Média do nicho', value: `${analysis.comparacao.mediaDoNicho}%` },
                      { label: 'Posição', value: analysis.comparacao.posicaoNicho },
                      { label: 'Status', value: analysis.comparacao.engajamentoVsMedia },
                      { label: 'Meta 3 meses', value: formatNumber(analysis.comparacao.metasSugeridas.seguidores3meses) },
                      { label: 'Engajamento alvo', value: `${analysis.comparacao.metasSugeridas.engajamentoAlvo}%` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                        <div className="text-sm font-semibold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1.5">Análise Comparativa</h3>
                    <p className="text-sm text-blue-800">{analysis.comparacao.analiseComparativa}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Frequência de postagem sugerida</h3>
                    <p className="text-sm text-gray-600">{analysis.comparacao.metasSugeridas.frequenciaPostagem}</p>
                  </div>
                </div>
              )}

              {/* Destaques & Fixados */}
              {activeTab === 'destaques' && (
                <div className="space-y-6">

                  {/* Destaques */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-500" />
                      <h2 className="font-semibold text-gray-900">Destaques (Highlights)</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        analysis.destaques?.avaliacao === 'ótimo' ? 'bg-green-100 text-green-700' :
                        analysis.destaques?.avaliacao === 'bom' ? 'bg-blue-100 text-blue-700' :
                        analysis.destaques?.avaliacao === 'regular' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{analysis.destaques?.avaliacao ?? '—'}</span>
                    </div>

                    {analysis.destaques?.quantidade === 0 ? (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-700">
                        Nenhum destaque encontrado. Destaques são essenciais para organizar seu conteúdo e manter visitantes engajados.
                      </div>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {(analysis.destaques?.listaAnalise ?? []).map((d, i) => (
                          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${d.tituloOk ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50'}`}>
                            <div className="mt-0.5">
                              {d.tituloOk
                                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                : <AlertCircle className="w-4 h-4 text-amber-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">"{d.titulo || '(sem título)'}"</p>
                              {!d.tituloOk && <p className="text-xs text-amber-700 mt-0.5">{d.sugestao}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {analysis.destaques?.coberturas && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Capas dos destaques</h3>
                        <p className="text-sm text-gray-700">{analysis.destaques.coberturas}</p>
                      </div>
                    )}

                    {(analysis.destaques?.sugestoesTitulos ?? []).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Sugestões de títulos</h3>
                        <div className="flex flex-wrap gap-2">
                          {(analysis.destaques.sugestoesTitulos ?? []).map((t, i) => (
                            <span key={i} className="text-sm px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-100">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(analysis.destaques?.recomendacoes ?? []).length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Recomendações</h3>
                        <ul className="space-y-1.5">
                          {(analysis.destaques.recomendacoes ?? []).map((r, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                              <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    {/* Posts Fixados */}
                    <div className="flex items-center gap-2 mb-3">
                      <Pin className="w-4 h-4 text-blue-500" />
                      <h2 className="font-semibold text-gray-900">Posts Fixados</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        analysis.postsFixados?.avaliacao === 'ótimo' ? 'bg-green-100 text-green-700' :
                        analysis.postsFixados?.avaliacao === 'bom' ? 'bg-blue-100 text-blue-700' :
                        analysis.postsFixados?.avaliacao === 'regular' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{analysis.postsFixados?.avaliacao ?? '—'}</span>
                      <span className="text-xs text-gray-400">{analysis.postsFixados?.quantidade ?? 0}/3 fixados</span>
                    </div>

                    {analysis.postsFixados?.analise && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                        <p className="text-sm text-gray-700">{analysis.postsFixados.analise}</p>
                      </div>
                    )}

                    {analysis.postsFixados?.quantidade > 0 && (
                      <div className="flex gap-3 mb-4">
                        {[
                          { label: 'Post de apresentação', ok: analysis.postsFixados.temApresentacao },
                          { label: 'Post de resultado', ok: analysis.postsFixados.temResultado },
                        ].map(({ label, ok }) => (
                          <div key={label} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                            {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            {label}
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Posts ideais para fixar</h3>
                      <div className="space-y-2">
                        {(analysis.postsFixados?.recomendacoes ?? []).map((r, i) => (
                          <div key={i} className="border border-blue-100 bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{r.posicao}</span>
                              <span className="text-sm font-semibold text-blue-900">{r.tipo}</span>
                            </div>
                            <p className="text-sm text-blue-800 ml-7">{r.descricao}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
