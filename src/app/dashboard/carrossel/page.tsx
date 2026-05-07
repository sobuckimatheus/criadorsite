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
      <div className="bg-white rounded-2xl p-7 min-h-[340px] flex flex-col justify-between shadow-md border border-gray-200 select-none"
        style={{ fontFamily: "'Georgia', serif" }}>
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
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-gray-300 text-xs">{idx + 1} / {carrossel?.slides.length}</span>
          <span className="text-purple-500 text-xs font-medium">{slide.destaque}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0">
            ✨
          </div>
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nicho</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {NICHOS.map(n => (
                  <button key={n} onClick={() => setNicho(n)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      nicho === n
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
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
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border flex items-start gap-2.5 ${
                      tipo === t.id
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
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
                    className={`px-3 py-2.5 rounded-lg text-xs text-left transition-colors border ${
                      tom === t.id
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-gray-400 mt-0.5 text-[10px]">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tema / Assunto</label>
              <textarea value={tema} onChange={e => setTema(e.target.value)} rows={3}
                placeholder={
                  tipo === 'origem' ? 'Ex: Como saí de R$800/mês para R$20k atendendo em casa'
                  : tipo === 'caso_sucesso' ? 'Ex: Paciente com medo de dentista há 15 anos. O que aconteceu na primeira consulta.'
                  : tipo === 'polemica' ? 'Ex: Por que plano odontológico destrói sua saúde bucal'
                  : 'Descreva o tema do seu carrossel...'
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm resize-none"
              />
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
                    <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }} />
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

                {renderSlide(carrossel.slides[slideAtivo], slideAtivo)}

                <div className="flex items-center justify-between">
                  <button onClick={() => setSlideAtivo(Math.max(0, slideAtivo - 1))} disabled={slideAtivo === 0}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors">
                    ← Anterior
                  </button>
                  <div className="flex gap-1.5">
                    {carrossel.slides.map((_, i) => (
                      <button key={i} onClick={() => setSlideAtivo(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === slideAtivo ? '20px' : '8px',
                          height: '8px',
                          background: i === slideAtivo ? 'linear-gradient(135deg, #a855f7, #ec4899)' : '#e5e7eb',
                        }} />
                    ))}
                  </div>
                  <button onClick={() => setSlideAtivo(Math.min(carrossel.slides.length - 1, slideAtivo + 1))} disabled={slideAtivo === carrossel.slides.length - 1}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors">
                    Próximo →
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Todos os slides</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {carrossel.slides.map((slide, i) => (
                      <button key={i} onClick={() => setSlideAtivo(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors border ${
                          slideAtivo === i ? 'bg-purple-50 border-purple-200' : 'border-transparent hover:bg-gray-50'
                        }`}>
                        <span className={`text-xs font-bold w-5 text-center flex-shrink-0 mt-0.5 ${slideAtivo === i ? 'text-purple-600' : 'text-gray-300'}`}>{i + 1}</span>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{slide.destaque}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Legenda + Hashtags</p>
                    <button onClick={copiarLegenda}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        copiado ? 'bg-green-50 border-green-200 text-green-700' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                      }`}>
                      {copiado ? '✅ Copiado!' : '📋 Copiar tudo'}
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{carrossel.legenda}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                    {carrossel.hashtags.map((tag, i) => (
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
