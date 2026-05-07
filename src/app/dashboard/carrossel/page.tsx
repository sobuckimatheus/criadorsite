'use client'

import { useState } from 'react'

interface Slide {
  texto: string
  imagem_sugerida: string
  destaque: string
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

export default function CarrosselPage() {
  const [nicho, setNicho] = useState('')
  const [tipo, setTipo] = useState('')
  const [tom, setTom] = useState('narrativo')
  const [tema, setTema] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [carrossel, setCarrossel] = useState<Carrossel | null>(null)
  const [slideAtivo, setSlideAtivo] = useState(0)
  const [copiado, setCopiado] = useState(false)
  const [error, setError] = useState('')

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
        body: JSON.stringify({
          nicho, nome, tipo,
          tipoLabel: tipoObj?.label,
          tipoDesc: tipoObj?.desc,
          tom,
          tomLabel: tomObj?.label,
          tomDesc: tomObj?.desc,
          tema,
        }),
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

  function copiarLegenda() {
    if (!carrossel) return
    const texto = `${carrossel.legenda}\n\n${carrossel.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}`
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function renderSlide(slide: Slide, idx: number) {
    const linhas = slide.texto.split('\n\n').filter(Boolean)
    return (
      <div className="bg-white rounded-2xl p-7 min-h-[340px] flex flex-col justify-between shadow-2xl select-none"
        style={{ fontFamily: "'Georgia', serif", border: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {nome ? nome[0].toUpperCase() : nicho[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm leading-none">{nome || nicho}</p>
            <p className="text-gray-400 text-xs mt-0.5">@{(nome || nicho).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {linhas.map((linha, i) => (
            <p key={i} className="text-gray-900 text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          ))}
        </div>

        {slide.imagem_sugerida && slide.imagem_sugerida !== 'sem imagem' && (
          <div className="mt-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-lg">🖼️</span>
            <p className="text-gray-400 text-xs italic">{slide.imagem_sugerida}</p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
          <span className="text-gray-300 text-xs">{idx + 1} / {carrossel?.slides.length}</span>
          <span className="text-purple-400 text-xs font-medium">{slide.destaque}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 50%, #0a0f0a 100%)' }}>
      <div className="border-b border-white/5 px-6 py-5"
        style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            ✨
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Criador de Carrossel Viral</h1>
            <p className="text-white/40 text-sm">Gere carrosséis que param o scroll — no estilo das maiores threads do Brasil</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Painel esquerdo */}
          <div className="lg:col-span-2 space-y-6">

            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="text-white/60 text-xs uppercase tracking-widest font-semibold">Seu nome ou negócio</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: Dr. Carlos • Clínica Smile"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 text-sm transition-all"
              />
            </div>

            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="text-white/60 text-xs uppercase tracking-widest font-semibold">Nicho</label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {NICHOS.map(n => (
                  <button key={n} onClick={() => setNicho(n)}
                    className="text-left px-3 py-2 rounded-lg text-xs transition-all"
                    style={{
                      background: nicho === n ? 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))' : 'rgba(255,255,255,0.04)',
                      border: nicho === n ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.06)',
                      color: nicho === n ? '#e879f9' : 'rgba(255,255,255,0.6)',
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="text-white/60 text-xs uppercase tracking-widest font-semibold">Tipo de Carrossel</label>
              <div className="space-y-2">
                {TIPOS_NARRATIVA.map(t => (
                  <button key={t.id} onClick={() => setTipo(t.id)}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3"
                    style={{
                      background: tipo === t.id ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))' : 'rgba(255,255,255,0.03)',
                      border: tipo === t.id ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <span className="text-lg mt-0.5">{t.emoji}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: tipo === t.id ? '#e879f9' : 'rgba(255,255,255,0.8)' }}>{t.label}</p>
                      <p className="text-xs text-white/30 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="text-white/60 text-xs uppercase tracking-widest font-semibold">Tom de voz</label>
              <div className="grid grid-cols-2 gap-2">
                {TONS.map(t => (
                  <button key={t.id} onClick={() => setTom(t.id)}
                    className="px-3 py-3 rounded-xl text-xs transition-all text-left"
                    style={{
                      background: tom === t.id ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                      border: tom === t.id ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      color: tom === t.id ? '#e879f9' : 'rgba(255,255,255,0.6)',
                    }}>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-white/30 mt-0.5" style={{ fontSize: '10px' }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="text-white/60 text-xs uppercase tracking-widest font-semibold">Tema / Assunto do Carrossel</label>
              <textarea value={tema} onChange={e => setTema(e.target.value)} rows={3}
                placeholder={
                  tipo === 'origem' ? 'Ex: Como saí de R$800/mês para R$20k atendendo em casa'
                  : tipo === 'caso_sucesso' ? 'Ex: Paciente com medo de dentista há 15 anos. O que aconteceu na primeira consulta.'
                  : tipo === 'polemica' ? 'Ex: Por que plano odontológico destrói sua saúde bucal'
                  : 'Descreva o tema do seu carrossel...'
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 text-sm transition-all resize-none"
              />
            </div>

            <button onClick={gerarCarrossel} disabled={loading || !nicho || !tipo || !tema.trim()}
              className="w-full py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: loading || !nicho || !tipo || !tema.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                boxShadow: !loading && nicho && tipo && tema ? '0 0 40px rgba(168,85,247,0.4)' : 'none',
              }}>
              {loading ? '⏳ Gerando...' : '🚀 Gerar Carrossel Viral'}
            </button>
          </div>

          {/* Painel direito */}
          <div className="lg:col-span-3 space-y-6">

            {loading && (
              <div className="rounded-2xl p-12 text-center space-y-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-6xl animate-pulse">✨</div>
                <div className="space-y-2">
                  <p className="text-purple-400 font-medium text-lg">{loadingMsg}</p>
                  <p className="text-white/20 text-sm">A IA está construindo sua narrativa viral...</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-red-400">❌ {error}</p>
              </div>
            )}

            {!loading && !carrossel && !error && (
              <div className="rounded-2xl p-12 text-center space-y-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-5xl opacity-30">📱</div>
                <p className="text-white/30 text-sm">Preencha os campos ao lado e clique em <br /><strong className="text-white/50">Gerar Carrossel Viral</strong></p>
              </div>
            )}

            {carrossel && !loading && (
              <div className="space-y-5">
                <div className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <div>
                    <p className="font-bold text-white">{carrossel.titulo}</p>
                    <p className="text-purple-300 text-xs mt-0.5">{carrossel.tipo_narrativa} • {carrossel.slides.length} slides • {carrossel.nicho}</p>
                  </div>
                  <span className="text-2xl">🔥</span>
                </div>

                <div className="space-y-3">
                  {renderSlide(carrossel.slides[slideAtivo], slideAtivo)}

                  <div className="flex items-center justify-between">
                    <button onClick={() => setSlideAtivo(Math.max(0, slideAtivo - 1))} disabled={slideAtivo === 0}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-20 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      ← Anterior
                    </button>

                    <div className="flex gap-1.5">
                      {carrossel.slides.map((_, i) => (
                        <button key={i} onClick={() => setSlideAtivo(i)}
                          className="rounded-full transition-all"
                          style={{
                            width: i === slideAtivo ? '20px' : '8px',
                            height: '8px',
                            background: i === slideAtivo ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.2)',
                          }} />
                      ))}
                    </div>

                    <button onClick={() => setSlideAtivo(Math.min(carrossel.slides.length - 1, slideAtivo + 1))} disabled={slideAtivo === carrossel.slides.length - 1}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-20 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Próximo →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl p-4 space-y-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Todos os slides</p>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {carrossel.slides.map((slide, i) => (
                      <button key={i} onClick={() => setSlideAtivo(i)}
                        className="w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-all"
                        style={{
                          background: slideAtivo === i ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                          border: slideAtivo === i ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
                        }}>
                        <span className="text-xs font-bold w-5 text-center flex-shrink-0 mt-0.5"
                          style={{ color: slideAtivo === i ? '#e879f9' : 'rgba(255,255,255,0.3)' }}>
                          {i + 1}
                        </span>
                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{slide.destaque}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-5 space-y-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Legenda + Hashtags</p>
                    <button onClick={copiarLegenda}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: copiado ? 'rgba(34,197,94,0.2)' : 'rgba(168,85,247,0.2)',
                        border: copiado ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(168,85,247,0.4)',
                        color: copiado ? '#86efac' : '#e879f9',
                      }}>
                      {copiado ? '✅ Copiado!' : '📋 Copiar tudo'}
                    </button>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{carrossel.legenda}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {carrossel.hashtags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full"
                        style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
                        #{tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={gerarCarrossel}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
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
