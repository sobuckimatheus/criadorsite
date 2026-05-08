'use client'

import { useState, useRef } from 'react'

interface Slide {
  texto: string
  imagem_sugerida: string
  destaque: string
  pessoa?: string
  empresa?: string
  imageType?: 'pessoa' | 'empresa' | 'pexels'
  imageUrl?: string
}

interface Carrossel {
  titulo: string
  nicho: string
  slides: Slide[]
  legenda: string
  hashtags: string[]
  tipo_narrativa: string
}

const NICHOS = [
  'Saúde e Estética', 'Odontologia', 'Psicologia', 'Direito',
  'Infoprodutos', 'Arquitetura', 'Barbearia', 'Contabilidade',
  'Design de Interiores', 'E-commerce', 'Educação', 'Estética Automotiva',
  'Estúdio de Tatuagem', 'Inteligência Artificial', 'Joias e Semi-joias',
  'Óticas', 'Pet Shop', 'Posicionamento', 'Roupas e Calçados', 'Salão de Beleza',
]

const TIPOS_NARRATIVA = [
  { id: 'origem', emoji: '📖', label: 'História de Origem', desc: 'Sua jornada do zero até aqui' },
  { id: 'caso_sucesso', emoji: '🏆', label: 'Caso de Sucesso', desc: 'Transformação real de cliente' },
  { id: 'educativo', emoji: '💡', label: 'Conteúdo Educativo', desc: 'Ensine algo valioso do seu nicho' },
  { id: 'polemica', emoji: '🔥', label: 'Polêmica do Nicho', desc: 'Quebre uma crença do mercado' },
  { id: 'bastidor', emoji: '🎬', label: 'Bastidor', desc: 'Mostre o que acontece por trás' },
  { id: 'lista', emoji: '📋', label: 'Lista Poderosa', desc: 'X coisas que ninguém te conta' },
]

const TONS = [
  { id: 'narrativo', label: '📚 Narrativo', desc: 'Conta uma história envolvente' },
  { id: 'direto', label: '⚡ Direto', desc: 'Objetivo e sem rodeios' },
  { id: 'emocional', label: '💛 Emocional', desc: 'Conecta com sentimentos' },
  { id: 'provocativo', label: '😤 Provocativo', desc: 'Questiona e desafia' },
]

type ThemeId = 'thread' | 'roxo' | 'dark' | 'gradiente' | 'minimal'

interface ThemeDef {
  label: string
  swatch: string
  cardStyle: React.CSSProperties
  headerStyle: React.CSSProperties
  bodyStyle: React.CSSProperties
  footerStyle: React.CSSProperties
  textColor: string
  mutedColor: string
  accentColor: string
  avatarStyle: React.CSSProperties
}

const THEMES: Record<ThemeId, ThemeDef> = {
  thread: {
    label: 'Simples',
    swatch: 'linear-gradient(135deg,#ffffff,#f3f4f6)',
    cardStyle: { background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e7e7', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
    headerStyle: { background: '#ffffff', padding: '14px 20px 10px', display: 'flex', alignItems: 'center', gap: '12px' },
    bodyStyle: { background: '#ffffff', flex: 1, padding: '0 20px 14px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' },
    footerStyle: { display: 'none' } as React.CSSProperties,
    textColor: '#0f1419',
    mutedColor: '#536471',
    accentColor: '#1d9bf0',
    avatarStyle: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' },
  },
  roxo: {
    label: 'Roxo',
    swatch: 'linear-gradient(135deg,#7c3aed,#ec4899)',
    cardStyle: { background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
    headerStyle: { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
    bodyStyle: { background: '#ffffff', flex: 1, padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' },
    footerStyle: { background: '#ffffff', borderTop: '1px solid #f3f4f6', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    textColor: '#111827',
    mutedColor: '#9333ea',
    accentColor: '#7c3aed',
    avatarStyle: { background: 'rgba(255,255,255,0.25)', color: '#fff' },
  },
  dark: {
    label: 'Dark',
    swatch: 'linear-gradient(135deg,#1e1b4b,#4c1d95)',
    cardStyle: { background: '#0f0f1a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
    headerStyle: { background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
    bodyStyle: { background: '#0f0f1a', flex: 1, padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' },
    footerStyle: { background: '#0f0f1a', borderTop: '1px solid #1e1b4b', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    textColor: '#e2e8f0',
    mutedColor: '#a78bfa',
    accentColor: '#a78bfa',
    avatarStyle: { background: 'rgba(139,92,246,0.3)', color: '#c4b5fd' },
  },
  gradiente: {
    label: 'Grad.',
    swatch: 'linear-gradient(135deg,#7c3aed,#a21caf,#ec4899)',
    cardStyle: { background: 'linear-gradient(135deg,#6d28d9,#a21caf,#db2777)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(124,58,237,0.4)' },
    headerStyle: { background: 'rgba(0,0,0,0.25)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
    bodyStyle: { flex: 1, padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' },
    footerStyle: { borderTop: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.75)',
    accentColor: 'rgba(255,255,255,0.9)',
    avatarStyle: { background: 'rgba(255,255,255,0.2)', color: '#fff' },
  },
  minimal: {
    label: 'Minimal',
    swatch: 'linear-gradient(135deg,#111827,#374151)',
    cardStyle: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    headerStyle: { background: '#111827', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
    bodyStyle: { background: '#f9fafb', flex: 1, padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' },
    footerStyle: { background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    textColor: '#111827',
    mutedColor: '#6b7280',
    accentColor: '#374151',
    avatarStyle: { background: 'rgba(255,255,255,0.15)', color: '#fff' },
  },
}

const THEME_IDS = Object.keys(THEMES) as ThemeId[]

export default function CarrosselPage() {
  const [nicho, setNicho] = useState('')
  const [tipo, setTipo] = useState('')
  const [tom, setTom] = useState('narrativo')
  const [tema, setTema] = useState('')
  const [nome, setNome] = useState('')
  const [estilo, setEstilo] = useState<ThemeId>('thread')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [carrossel, setCarrossel] = useState<Carrossel | null>(null)
  const [slideAtivo, setSlideAtivo] = useState(0)
  const [copiado, setCopiado] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [error, setError] = useState('')
  const slideRef = useRef<HTMLDivElement>(null)

  const msgs = [
    '✍️ Construindo o gancho perfeito...',
    '🎯 Criando tensão narrativa...',
    '💥 Adicionando viradas dramáticas...',
    '📱 Formatando slides virais...',
    '🚀 Finalizando sua copy...',
  ]

  async function gerarCarrossel() {
    if (!nicho || !tipo || !tema.trim()) return
    setLoading(true)
    setError('')
    setCarrossel(null)
    setSlideAtivo(0)

    const tipoObj = TIPOS_NARRATIVA.find(t => t.id === tipo)
    const tomObj = TONS.find(t => t.id === tom)

    let idx = 0
    setLoadingMsg(msgs[0])
    const interval = setInterval(() => {
      idx = (idx + 1) % msgs.length
      setLoadingMsg(msgs[idx])
    }, 2200)

    try {
      const res = await fetch('/api/carrossel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, nome, tipo, tipoLabel: tipoObj?.label, tipoDesc: tipoObj?.desc, tom, tomLabel: tomObj?.label, tomDesc: tomObj?.desc, tema }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar')
      setCarrossel(data.carrossel)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar carrossel. Tente novamente.')
    } finally {
      clearInterval(interval)
      setLoading(false)
      setLoadingMsg('')
    }
  }

  async function exportarSlide() {
    if (!slideRef.current || !carrossel) return
    setExportando(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(slideRef.current, { scale: 2.5, useCORS: true, allowTaint: true })
      const link = document.createElement('a')
      link.download = `slide-${slideAtivo + 1}-de-${carrossel.slides.length}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExportando(false)
    }
  }

  function copiarLegenda() {
    if (!carrossel) return
    const texto = `${carrossel.legenda}\n\n${(carrossel.hashtags ?? []).map(h => `#${h.replace('#', '')}`).join(' ')}`
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function renderSlide(slide: Slide, idx: number) {
    const t = THEMES[estilo]
    const isThread = estilo === 'thread'
    const linhas = slide.texto.split(/\n\n|\n/).filter(Boolean)
    const handle = (nome || nicho).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    const initial = (nome || nicho)[0]?.toUpperCase() ?? '?'
    const fontFamily = isThread
      ? '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'
      : 'Georgia, serif'

    const isWikipediaBrand = slide.imageType === 'empresa'

    // ── THREAD / SIMPLES ──────────────────────────────────────────────────
    if (isThread) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column',
          background: '#ffffff', borderRadius: '16px', overflow: 'hidden',
          width: '100%', aspectRatio: '1 / 1',
          border: '1px solid #e7e7e7', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          fontFamily,
        }}>
          {/* Header */}
          <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ ...t.avatarStyle, width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, fontFamily: 'system-ui' }}>
              {initial}
            </div>
            <div>
              <p style={{ color: '#0f1419', fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1.2, fontFamily: 'system-ui' }}>{nome || nicho}</p>
              <p style={{ color: '#536471', fontSize: 12, margin: '2px 0 0', fontFamily: 'system-ui' }}>@{handle}</p>
            </div>
          </div>

          {/* Texto — não cresce; quem cresce é a imagem */}
          <div style={{ padding: '16px 20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', ...(slide.imageUrl ? {} : { flex: 1 }) }}>
            {linhas.map((linha, i) => (
              <p key={i} style={{ color: '#0f1419', fontSize: 15, lineHeight: 1.6, margin: 0, fontFamily }}
                dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f1419;font-weight:800">$1</strong>') }}
              />
            ))}
          </div>

          {/* Imagem — alinhada com o texto (mesma margem lateral), cresce para preencher espaço restante */}
          {slide.imageUrl && (
            <div style={{ flex: 1, marginTop: '14px', marginBottom: '16px', marginLeft: '20px', marginRight: '20px', minHeight: '80px', overflow: 'hidden', borderRadius: '10px' }}>
              <img
                src={`/api/proxy-image?url=${encodeURIComponent(slide.imageUrl)}`}
                alt="" crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: isWikipediaBrand ? 'contain' : 'cover',
                  objectPosition: 'center top',
                  background: isWikipediaBrand ? '#f5f5f5' : 'transparent',
                }}
              />
            </div>
          )}
        </div>
      )
    }

    // ── OUTROS TEMAS ──────────────────────────────────────────────────────
    const isWikipediaPerson = slide.imageType === 'pessoa'
    const isWikipedia = isWikipediaPerson || isWikipediaBrand
    const isPexels = slide.imageType === 'pexels'

    const nonThreadWikiEl = isWikipedia && slide.imageUrl ? (
      <div style={{ width: '100%', height: isWikipediaBrand ? '80px' : '160px', overflow: 'hidden', flexShrink: 0, background: isWikipediaBrand ? '#fff' : 'transparent' }}>
        <img src={`/api/proxy-image?url=${encodeURIComponent(slide.imageUrl)}`}
          alt="" crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: isWikipediaBrand ? 'contain' : 'cover', objectPosition: 'center top' }} />
      </div>
    ) : null

    const nonThreadPexelsEl = isPexels && slide.imageUrl ? (
      <div style={{ width: '100%', height: '140px', overflow: 'hidden', flexShrink: 0 }}>
        <img src={`/api/proxy-image?url=${encodeURIComponent(slide.imageUrl)}`}
          alt="" crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
      </div>
    ) : null

    return (
      <div style={{ ...t.cardStyle, width: '100%', aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', fontFamily, overflow: 'hidden' }}>

        {/* Header */}
        <div style={t.headerStyle}>
          <div style={{ ...t.avatarStyle, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, fontFamily: 'system-ui' }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1.2, fontFamily: 'system-ui' }}>{nome || nicho}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '2px 0 0', fontFamily: 'system-ui' }}>@{handle}</p>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />)}
          </div>
        </div>

        {nonThreadWikiEl}
        {nonThreadPexelsEl}

        {/* Text body */}
        <div style={{ ...t.bodyStyle, overflow: 'hidden' }}>
          {linhas.map((linha, i) => (
            <p key={i} style={{ color: t.textColor, fontSize: 15, lineHeight: 1.7, margin: 0, fontFamily }}
              dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${t.textColor};font-weight:800">$1</strong>`) }}
            />
          ))}
        </div>

        {/* Footer (hidden for thread) */}
        {!isThread && (
          <div style={t.footerStyle}>
            <span style={{ color: t.accentColor, fontSize: 11, fontWeight: 700, fontFamily: 'system-ui' }}>
              {idx + 1} / {carrossel?.slides.length}
            </span>
            <span style={{ color: t.mutedColor, fontSize: 11, fontStyle: 'italic', fontFamily: 'system-ui' }}>
              {slide.destaque}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0">✨</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Criador de Carrossel Viral</h1>
            <p className="text-sm text-gray-500">Gere carrosséis que param o scroll — no estilo das maiores threads do Brasil</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Painel esquerdo */}
          <div className="lg:col-span-2 space-y-4">

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seu nome ou negócio</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: Dr. Carlos • Clínica Smile"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nicho</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {NICHOS.map(n => (
                  <button key={n} onClick={() => setNicho(n)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${nicho === n ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de Carrossel</label>
              <div className="space-y-1.5">
                {TIPOS_NARRATIVA.map(t => (
                  <button key={t.id} onClick={() => setTipo(t.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border flex items-start gap-2.5 ${tipo === t.id ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <span className="text-base mt-0.5">{t.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${tipo === t.id ? 'text-purple-700' : 'text-gray-700'}`}>{t.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tom de voz</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TONS.map(t => (
                  <button key={t.id} onClick={() => setTom(t.id)}
                    className={`px-3 py-2.5 rounded-lg text-xs text-left transition-colors border ${tom === t.id ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-gray-400 mt-0.5 text-[10px]">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visual do Slide</label>
              <div className="grid grid-cols-4 gap-2">
                {THEME_IDS.map(id => (
                  <button key={id} onClick={() => setEstilo(id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${estilo === id ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="w-9 h-9 rounded-lg flex-shrink-0 border border-gray-200" style={{ background: THEMES[id].swatch }} />
                    <span className={`text-[10px] font-medium ${estilo === id ? 'text-purple-700' : 'text-gray-600'}`}>{THEMES[id].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tema / Assunto</label>
              <textarea value={tema} onChange={e => setTema(e.target.value)} rows={3}
                placeholder={
                  tipo === 'origem' ? 'Ex: Como saí de R$800/mês para R$20k atendendo em casa'
                  : tipo === 'caso_sucesso' ? 'Ex: Paciente com medo de dentista há 15 anos. O que aconteceu.'
                  : tipo === 'polemica' ? 'Ex: Por que plano odontológico destrói sua saúde bucal'
                  : 'Descreva o tema do seu carrossel...'
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm resize-none" />
            </div>

            <button onClick={gerarCarrossel} disabled={loading || !nicho || !tipo || !tema.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-sm">
              {loading ? '⏳ Gerando...' : '🚀 Gerar Carrossel Viral'}
            </button>
          </div>

          {/* Painel direito */}
          <div className="lg:col-span-3 space-y-5">

            {loading && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-5">
                <div className="text-5xl animate-pulse">✨</div>
                <div className="space-y-1.5">
                  <p className="text-purple-600 font-medium">{loadingMsg}</p>
                  <p className="text-gray-400 text-sm">A IA está construindo sua narrativa viral...</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 text-sm">❌ {error}</p>
              </div>
            )}

            {!loading && !carrossel && !error && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
                <div className="text-5xl opacity-20">📱</div>
                <p className="text-gray-400 text-sm">Preencha os campos ao lado e clique em<br /><span className="font-medium text-gray-600">Gerar Carrossel Viral</span></p>
              </div>
            )}

            {carrossel && !loading && (
              <div className="space-y-4">

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{carrossel.titulo}</p>
                    <p className="text-purple-600 text-xs mt-0.5">{carrossel.tipo_narrativa} • {carrossel.slides.length} slides • {carrossel.nicho}</p>
                  </div>
                  <span className="text-2xl">🔥</span>
                </div>

                {/* Slide preview */}
                <div ref={slideRef}>
                  {renderSlide(carrossel.slides[slideAtivo], slideAtivo)}
                </div>

                {/* Controles de navegação */}
                <div className="flex items-center justify-between">
                  <button onClick={() => setSlideAtivo(Math.max(0, slideAtivo - 1))} disabled={slideAtivo === 0}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors">
                    ← Anterior
                  </button>
                  <div className="flex gap-1.5">
                    {(carrossel.slides ?? []).map((_, i) => (
                      <button key={i} onClick={() => setSlideAtivo(i)}
                        className="rounded-full transition-all"
                        style={{ width: i === slideAtivo ? '20px' : '8px', height: '8px', background: i === slideAtivo ? 'linear-gradient(135deg,#a855f7,#ec4899)' : '#e5e7eb' }} />
                    ))}
                  </div>
                  <button onClick={() => setSlideAtivo(Math.min(carrossel.slides.length - 1, slideAtivo + 1))} disabled={slideAtivo === carrossel.slides.length - 1}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors">
                    Próximo →
                  </button>
                </div>

                {/* Export */}
                <button onClick={exportarSlide} disabled={exportando}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {exportando ? '⏳ Exportando...' : '⬇️ Baixar slide como PNG'}
                </button>

                {/* Lista de slides */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Todos os slides</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {(carrossel.slides ?? []).map((slide, i) => (
                      <button key={i} onClick={() => setSlideAtivo(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors border ${slideAtivo === i ? 'bg-purple-50 border-purple-200' : 'border-transparent hover:bg-gray-50'}`}>
                        <span className={`text-xs font-bold w-5 text-center flex-shrink-0 mt-0.5 ${slideAtivo === i ? 'text-purple-600' : 'text-gray-300'}`}>{i + 1}</span>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{slide.destaque}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legenda */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Legenda + Hashtags</p>
                    <button onClick={copiarLegenda}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${copiado ? 'bg-green-50 border-green-200 text-green-700' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'}`}>
                      {copiado ? '✅ Copiado!' : '📋 Copiar tudo'}
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{carrossel.legenda}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                    {(carrossel.hashtags ?? []).map((tag, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600">
                        #{tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={gerarCarrossel}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  🔄 Gerar nova versão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
