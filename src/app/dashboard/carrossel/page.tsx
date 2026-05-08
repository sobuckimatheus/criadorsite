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
  'Design de Interiores', 'E-commerce', 'Educação', 'Empreendedorismo',
  'Estética Automotiva', 'Estúdio de Tatuagem', 'Inteligência Artificial',
  'Joias e Semi-joias', 'Óticas', 'Pet Shop', 'Posicionamento',
  'Roupas e Calçados', 'Salão de Beleza',
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

type ThemeId = 'thread' | 'roxo' | 'dark' | 'gradiente' | 'minimal' | 'bold' | 'clean' | 'luxury' | 'luxofoto'

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
  bold: {
    label: 'Bold',
    swatch: 'linear-gradient(135deg,#7C3AED,#EC4899)',
    cardStyle: { borderRadius: '16px', overflow: 'hidden' },
    headerStyle: {},
    bodyStyle: {},
    footerStyle: {},
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.7)',
    accentColor: '#ffffff',
    avatarStyle: { background: 'rgba(255,255,255,0.2)', color: '#fff' },
  },
  clean: {
    label: 'Clean',
    swatch: 'linear-gradient(135deg,#f0f4ff 50%,#7C3AED 50%)',
    cardStyle: { borderRadius: '16px', overflow: 'hidden', background: '#ffffff', border: '1px solid #e5e7eb' },
    headerStyle: {},
    bodyStyle: {},
    footerStyle: {},
    textColor: '#111827',
    mutedColor: '#6b7280',
    accentColor: '#7C3AED',
    avatarStyle: { background: '#7C3AED', color: '#fff' },
  },
  luxofoto: {
    label: 'Luxo+',
    swatch: 'linear-gradient(135deg,#0a0a0a,#D4AF37)',
    cardStyle: { borderRadius: '16px', overflow: 'hidden', background: '#0a0a0a' },
    headerStyle: {},
    bodyStyle: {},
    footerStyle: {},
    textColor: '#ffffff',
    mutedColor: 'rgba(212,175,55,0.7)',
    accentColor: '#D4AF37',
    avatarStyle: { background: 'rgba(212,175,55,0.15)', color: '#D4AF37' },
  },
  luxury: {
    label: 'Luxury',
    swatch: 'linear-gradient(135deg,#0a0a0a 65%,#D4AF37 65%)',
    cardStyle: { borderRadius: '16px', overflow: 'hidden', background: '#0a0a0a' },
    headerStyle: {},
    bodyStyle: {},
    footerStyle: {},
    textColor: '#e5e5e5',
    mutedColor: 'rgba(212,175,55,0.7)',
    accentColor: '#D4AF37',
    avatarStyle: { background: 'rgba(212,175,55,0.15)', color: '#D4AF37' },
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
  const [gerandoImagem, setGerandoImagem] = useState(false)
  const [gerandoTodas, setGerandoTodas] = useState(false)
  const [progressoIA, setProgressoIA] = useState<{ atual: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const slideRef = useRef<HTMLDivElement>(null)
  const isVisualTheme = estilo === 'bold' || estilo === 'clean' || estilo === 'luxury'

  const msgs = [
    '✍️ Construindo o gancho perfeito...',
    '🎯 Criando tensão narrativa...',
    '💥 Adicionando viradas dramáticas...',
    '📱 Formatando slides virais...',
    '🚀 Finalizando sua copy...',
  ]

  async function gerarImagemIA() {
    if (!carrossel || gerandoImagem) return
    const slide = carrossel.slides[slideAtivo]
    setGerandoImagem(true)
    try {
      const res = await fetch('/api/carrossel/gerar-imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destaque: slide.destaque, texto: slide.texto, nicho }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar imagem')
      const url: string = data.imageUrl ?? data.imageData
      setCarrossel(prev => {
        if (!prev) return prev
        const slides = [...prev.slides]
        slides[slideAtivo] = { ...slides[slideAtivo], imageUrl: url, imageType: 'pexels' }
        return { ...prev, slides }
      })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao gerar imagem')
    } finally {
      setGerandoImagem(false)
    }
  }

  async function gerarTodasImagensIA() {
    if (!carrossel || gerandoTodas) return
    setGerandoTodas(true)
    setProgressoIA({ atual: 0, total: carrossel.slides.length })

    const semImagem = carrossel.slides.map((s, i) => ({ s, i })).filter(({ s }) => !s.imageUrl)
    if (semImagem.length === 0) {
      setGerandoTodas(false); setProgressoIA(null); return
    }
    setProgressoIA({ atual: 0, total: semImagem.length })

    for (const { s: slide, i } of semImagem) {
      setProgressoIA(prev => prev ? { ...prev, atual: prev.atual + 1 } : null)

      // Tenta até 2 vezes por slide antes de pular
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch('/api/carrossel/gerar-imagem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destaque: slide.destaque, texto: slide.texto, nicho }),
          })
          const data = await res.json()
          const url: string | undefined = data.imageUrl ?? data.imageData
          if (res.ok && url) {
            setCarrossel(prev => {
              if (!prev) return prev
              const slides = [...prev.slides]
              slides[i] = { ...slides[i], imageUrl: url, imageType: 'pexels' }
              return { ...prev, slides }
            })
            break  // sucesso — passa para o próximo slide
          }
        } catch {
          if (attempt === 0) await new Promise(r => setTimeout(r, 2000))
        }
      }
    } // fim for semImagem

    setGerandoTodas(false)
    setProgressoIA(null)
  }

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
                src={slide.imageUrl.startsWith('data:') ? slide.imageUrl : `/api/proxy-image?url=${encodeURIComponent(slide.imageUrl)}`}
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

    // ── BOLD (tipografia + cores vibrantes) ──────────────────────────────
    if (estilo === 'bold') {
      const BOLD_GRADIENTS = [
        'linear-gradient(135deg,#7C3AED 0%,#4F46E5 100%)',
        'linear-gradient(135deg,#EC4899 0%,#EF4444 100%)',
        'linear-gradient(135deg,#F59E0B 0%,#EF4444 100%)',
        'linear-gradient(135deg,#10B981 0%,#059669 100%)',
        'linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)',
        'linear-gradient(135deg,#0EA5E9 0%,#6366F1 100%)',
        'linear-gradient(135deg,#EC4899 0%,#8B5CF6 100%)',
        'linear-gradient(135deg,#F59E0B 0%,#10B981 100%)',
        'linear-gradient(135deg,#EF4444 0%,#F97316 100%)',
        'linear-gradient(135deg,#3B82F6 0%,#06B6D4 100%)',
        'linear-gradient(135deg,#8B5CF6 0%,#EC4899 100%)',
        'linear-gradient(135deg,#14B8A6 0%,#3B82F6 100%)',
      ]
      const bg = BOLD_GRADIENTS[idx % BOLD_GRADIENTS.length]
      return (
        <div style={{
          background: bg, borderRadius: '16px', width: '100%', aspectRatio: '1/1',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}>
          <div style={{
            position: 'absolute', right: 16, top: 8, fontSize: 130, fontWeight: 900,
            color: 'rgba(255,255,255,0.10)', lineHeight: 1, userSelect: 'none', fontFamily: 'Georgia,serif',
          }}>{idx + 1}</div>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '36px 32px 16px', position: 'relative', zIndex: 1, overflow: 'hidden',
          }}>
            {linhas.map((linha, i) => (
              <p key={i} style={{ color: '#fff', fontSize: i === 0 ? 19 : 15, lineHeight: 1.6, margin: '0 0 10px', fontWeight: i === 0 ? 800 : 400 }}
                dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;font-weight:900">$1</strong>') }}
              />
            ))}
          </div>
          <div style={{ padding: '0 32px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600 }}>@{handle}</span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {Array.from({ length: carrossel?.slides.length ?? 1 }, (_, i) => (
                <div key={i} style={{ width: i === idx ? 18 : 5, height: 5, borderRadius: 3, background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)' }} />
              ))}
            </div>
          </div>
        </div>
      )
    }

    // ── CLEAN (tipografia limpa + acento colorido) ────────────────────────
    if (estilo === 'clean') {
      const CLEAN_ACCENTS = ['#7C3AED','#EC4899','#F59E0B','#10B981','#6366F1','#0EA5E9','#EF4444','#8B5CF6','#F97316','#06B6D4','#84CC16','#14B8A6']
      const accent = CLEAN_ACCENTS[idx % CLEAN_ACCENTS.length]
      return (
        <div style={{
          background: '#ffffff', borderRadius: '16px', width: '100%', aspectRatio: '1/1',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        }}>
          <div style={{ height: 5, background: accent, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 30px 12px', overflow: 'hidden' }}>
            <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 12, color: accent, opacity: 0.1, fontFamily: 'Georgia,serif' }}>
              {String(idx + 1).padStart(2, '0')}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, overflow: 'hidden' }}>
              {linhas.map((linha, i) => (
                <p key={i} style={{ color: '#111827', fontSize: i === 0 ? 17 : 14, lineHeight: 1.65, margin: 0, fontWeight: i === 0 ? 700 : 400 }}
                  dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${accent};font-weight:800">$1</strong>`) }}
                />
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${accent}` }}>
            <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600 }}>@{handle}</span>
            <span style={{ color: accent, fontSize: 11, fontWeight: 700 }}>{idx + 1} / {carrossel?.slides.length}</span>
          </div>
        </div>
      )
    }

    // ── LUXO+FOTO (dark + dourado + foto lateral com fade) ───────────────
    if (estilo === 'luxofoto') {
      const hasImage = !!slide.imageUrl
      const isWikiBrand = slide.imageType === 'empresa'
      const imgSrc = slide.imageUrl
        ? (slide.imageUrl.startsWith('data:') ? slide.imageUrl : `/api/proxy-image?url=${encodeURIComponent(slide.imageUrl)}`)
        : null
      return (
        <div style={{
          background: '#0a0a0a', borderRadius: '16px', width: '100%', aspectRatio: '1/1',
          position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
          boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
        }}>
          {/* Imagem lateral direita */}
          {imgSrc && (
            <>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%', overflow: 'hidden' }}>
                <img src={imgSrc} alt="" crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: isWikiBrand ? 'contain' : 'cover', objectPosition: 'center top', display: 'block', background: isWikiBrand ? '#111' : 'transparent' }}
                />
              </div>
              {/* Fade horizontal para blend com fundo */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '70%', background: 'linear-gradient(90deg,#0a0a0a 25%,rgba(10,10,10,0.65) 55%,transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
              {/* Fade vertical no rodapé */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%', background: 'linear-gradient(0deg,#0a0a0a 30%,transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
            </>
          )}

          {/* Conteúdo de texto */}
          <div style={{
            position: 'relative', zIndex: 2, flex: 1,
            display: 'flex', flexDirection: 'column',
            padding: '28px 28px 16px',
            width: hasImage ? '62%' : '100%',
            overflow: 'hidden',
          }}>
            {/* Número do slide */}
            <div style={{ color: '#D4AF37', fontSize: 60, fontWeight: 900, lineHeight: 1, marginBottom: 10, fontFamily: 'Georgia,serif' }}>
              {idx + 1}
            </div>
            {/* Linhas de texto */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
              {linhas.map((linha, i) => (
                <p key={i} style={{
                  color: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.82)',
                  fontSize: i === 0 ? 19 : 13,
                  lineHeight: i === 0 ? 1.2 : 1.65,
                  margin: 0,
                  fontWeight: i === 0 ? 800 : 400,
                  textTransform: i === 0 ? 'uppercase' : 'none',
                  letterSpacing: i === 0 ? '0.03em' : '0',
                }}
                  dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#D4AF37;font-weight:800">$1</strong>') }}
                />
              ))}
            </div>
          </div>

          {/* Rodapé */}
          <div style={{ position: 'relative', zIndex: 2, padding: '0 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(212,175,55,0.65)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{nome || nicho}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {Array.from({ length: carrossel?.slides.length ?? 1 }, (_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? '#D4AF37' : 'rgba(212,175,55,0.3)', border: i === idx ? 'none' : '1px solid rgba(212,175,55,0.4)' }} />
              ))}
            </div>
          </div>
        </div>
      )
    }

    // ── LUXURY (dark + tipografia serifada + dourado) ─────────────────────
    if (estilo === 'luxury') {
      return (
        <div style={{
          background: '#0a0a0a', borderRadius: '16px', width: '100%', aspectRatio: '1/1',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
          fontFamily: 'Georgia,"Times New Roman",serif',
          boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#D4AF37,transparent)', flexShrink: 0 }} />
          <div style={{
            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
            fontSize: 200, fontWeight: 900, color: 'rgba(212,175,55,0.04)', lineHeight: 1,
            userSelect: 'none', fontFamily: 'Georgia,serif',
          }}>{idx + 1}</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '36px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
            <div style={{ width: 36, height: 1, background: '#D4AF37', marginBottom: 24 }} />
            {linhas.map((linha, i) => (
              <p key={i} style={{ color: '#e2e2e2', fontSize: 15, lineHeight: 1.8, margin: '0 0 10px', fontStyle: i === 0 ? 'italic' : 'normal', fontWeight: i === 0 ? 400 : 300, letterSpacing: '0.01em' }}
                dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#D4AF37;font-weight:600;font-style:normal">$1</strong>') }}
              />
            ))}
          </div>
          <div style={{ padding: '0 36px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <span style={{ color: 'rgba(212,175,55,0.6)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: '-apple-system,sans-serif' }}>{nome || nicho}</span>
            <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: 10, letterSpacing: '0.08em', fontFamily: '-apple-system,sans-serif' }}>{idx + 1} / {carrossel?.slides.length}</span>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#D4AF37,transparent)', flexShrink: 0 }} />
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

                {/* Ações do slide */}
                {isVisualTheme ? (
                  <button onClick={exportarSlide} disabled={exportando}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {exportando ? '⏳ Exportando...' : '⬇️ Baixar PNG'}
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={gerarImagemIA} disabled={gerandoImagem || gerandoTodas}
                        className="py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                        {gerandoImagem ? '⏳ Gerando...' : '✨ Imagem com IA'}
                      </button>
                      <button onClick={exportarSlide} disabled={exportando}
                        className="py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                        {exportando ? '⏳ Exportando...' : '⬇️ Baixar PNG'}
                      </button>
                    </div>
                    <button onClick={gerarTodasImagensIA} disabled={gerandoTodas || gerandoImagem}
                      className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-violet-400 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                      {gerandoTodas && progressoIA
                        ? `⏳ Gerando imagens... ${progressoIA.atual} / ${progressoIA.total}`
                        : `🎨 Gerar imagens sem foto com IA${carrossel ? ` (${carrossel.slides.filter(s => !s.imageUrl).length} slides)` : ''}`}
                    </button>
                  </>
                )}

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
