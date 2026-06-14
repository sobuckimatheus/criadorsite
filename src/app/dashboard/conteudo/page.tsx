'use client'

import { useState, useEffect } from 'react'
import {
  getContentProfile,
  saveContentProfile,
  saveContentPiece,
  listContentPieces,
  getContentPiece,
  deleteContentPiece,
  type ContentProfileInput,
  type ContentPieceListItem,
  type ContentPiecePayload,
} from '@/app/actions/conteudo'

type Estrutura = { secao: string; conteudo: string }
interface Conteudo {
  titulo: string
  gancho: string
  estrutura: Estrutura[]
  legenda: string
  cta: string
  hashtags: string[]
  dicas?: string
  usouTendencias?: boolean
}

const FUNIS = [
  { id: 'topo', label: 'Topo', desc: 'Alcance / descoberta' },
  { id: 'meio', label: 'Meio', desc: 'Relacionamento' },
  { id: 'fundo', label: 'Fundo', desc: 'Venda' },
]

const CATEGORIAS = [
  { id: 'conexao', emoji: '💛', label: 'Conexão', desc: 'Identificação e confiança' },
  { id: 'educacional', emoji: '💡', label: 'Educacional', desc: 'Autoridade ensinando' },
  { id: 'viral', emoji: '🔥', label: 'Viral', desc: 'Parar o scroll (busca tendências)' },
  { id: 'venda', emoji: '🎯', label: 'Venda direta', desc: 'Converter' },
]

const FORMATOS = [
  { id: 'reels', emoji: '🎬', label: 'Reels' },
  { id: 'carrossel', emoji: '🖼️', label: 'Carrossel' },
  { id: 'imagem', emoji: '📸', label: 'Imagem' },
]

const EMPTY_PROFILE: ContentProfileInput = {
  negocio: '', nicho: '', publico: '', idadePublico: '', essencia: '',
  transformacao: '', tomVoz: '', crencas: '', objecoes: '', provas: '', servicos: '',
}

export default function ConteudoPage() {
  // Perfil
  const [profile, setProfile] = useState<ContentProfileInput>(EMPTY_PROFILE)
  const [profileSalvo, setProfileSalvo] = useState(false)
  const [profileAberto, setProfileAberto] = useState(false)
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [carregandoPerfil, setCarregandoPerfil] = useState(true)

  // Gerador
  const [funil, setFunil] = useState('topo')
  const [categoria, setCategoria] = useState('educacional')
  const [formato, setFormato] = useState('carrossel')
  const [servico, setServico] = useState('')
  const [tema, setTema] = useState('')
  const [gerando, setGerando] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [erro, setErro] = useState('')
  const [conteudo, setConteudo] = useState<Conteudo | null>(null)
  const [salvandoPeca, setSalvandoPeca] = useState(false)
  const [salvoPeca, setSalvoPeca] = useState(false)
  const [copiado, setCopiado] = useState('')

  // Histórico
  const [showHistorico, setShowHistorico] = useState(false)
  const [historico, setHistorico] = useState<ContentPieceListItem[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

  useEffect(() => {
    (async () => {
      const res = await getContentProfile()
      if (res.success && res.data) {
        setProfile({ ...EMPTY_PROFILE, ...res.data })
        // Se já tem perfil salvo de verdade (não só pré-preenchido), considera salvo
        setProfileSalvo(true)
      } else {
        setProfileAberto(true)
      }
      setCarregandoPerfil(false)
    })()
  }, [])

  async function salvarPerfil() {
    setSalvandoPerfil(true)
    setErro('')
    try {
      const res = await saveContentProfile(profile)
      if (res.success) {
        setProfileSalvo(true)
        setProfileAberto(false)
      } else {
        setErro(res.error)
      }
    } finally {
      setSalvandoPerfil(false)
    }
  }

  async function gerar() {
    if (!profile.negocio || !profile.nicho) {
      setErro('Preencha o perfil de conteúdo primeiro.')
      setProfileAberto(true)
      return
    }
    setGerando(true)
    setErro('')
    setConteudo(null)
    setSalvoPeca(false)

    const msgs = categoria === 'viral'
      ? ['🔎 Buscando tendências em alta...', '🧠 Adaptando ao seu nicho...', '✍️ Escrevendo o roteiro...', '🚀 Finalizando...']
      : ['🧠 Analisando seu negócio...', '✍️ Escrevendo o roteiro...', '🎯 Ajustando o gancho...', '🚀 Finalizando...']
    let i = 0
    setLoadingMsg(msgs[0])
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setLoadingMsg(msgs[i]) }, 2500)

    try {
      const res = await fetch('/api/conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, funil, categoria, formato, servico, tema }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar')
      setConteudo(data.conteudo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar conteúdo')
    } finally {
      clearInterval(interval)
      setGerando(false)
      setLoadingMsg('')
    }
  }

  async function salvarPeca() {
    if (!conteudo) return
    setSalvandoPeca(true)
    try {
      const res = await saveContentPiece({
        funil, categoria, formato, servico, tema,
        titulo: conteudo.titulo,
        conteudo: conteudo as unknown as ContentPiecePayload['conteudo'],
      })
      if (res.success) setSalvoPeca(true)
      else setErro(res.error)
    } finally {
      setSalvandoPeca(false)
    }
  }

  async function abrirHistorico() {
    setShowHistorico(true)
    setCarregandoHistorico(true)
    try {
      const res = await listContentPieces()
      if (res.success) setHistorico(res.data)
    } finally {
      setCarregandoHistorico(false)
    }
  }

  async function carregarPeca(id: string) {
    const res = await getContentPiece(id)
    if (!res.success) { alert(res.error); return }
    const d = res.data as {
      funil: string; categoria: string; formato: string; tema: string; servico: string; conteudo: Conteudo
    }
    setFunil(d.funil); setCategoria(d.categoria); setFormato(d.formato)
    setTema(d.tema); setServico(d.servico)
    setConteudo(d.conteudo)
    setSalvoPeca(true)
    setShowHistorico(false)
    setErro('')
  }

  async function excluirPeca(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Excluir este roteiro?')) return
    const res = await deleteContentPiece(id)
    if (res.success) setHistorico(prev => prev.filter(p => p.id !== id))
    else alert(res.error)
  }

  function copiar(texto: string, tag: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(tag)
    setTimeout(() => setCopiado(''), 2000)
  }

  function copiarTudo() {
    if (!conteudo) return
    const txt = [
      `GANCHO: ${conteudo.gancho}`,
      '',
      ...conteudo.estrutura.map(s => `${s.secao}: ${s.conteudo}`),
      '',
      `CTA: ${conteudo.cta}`,
      '',
      'LEGENDA:',
      conteudo.legenda,
      '',
      conteudo.hashtags.map(h => `#${h}`).join(' '),
    ].join('\n')
    copiar(txt, 'tudo')
  }

  const formatoLabel = FORMATOS.find(f => f.id === formato)?.label ?? formato

  const field = (
    label: string, key: keyof ContentProfileInput, placeholder: string, textarea = false,
  ) => (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      {textarea ? (
        <textarea
          value={profile[key] ?? ''} rows={2}
          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
      ) : (
        <input
          value={profile[key] ?? ''}
          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      )}
    </div>
  )

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-xl flex-shrink-0">✨</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerador de Conteúdo</h1>
            <p className="text-sm text-gray-500">Roteiros de Reels, carrosséis e imagens — por etapa do funil</p>
          </div>
          <button onClick={abrirHistorico}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            📁 Meus roteiros
          </button>
        </div>

        {/* Perfil / cérebro da marca */}
        <div className="bg-white border border-gray-200 rounded-xl mb-6">
          <button onClick={() => setProfileAberto(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Perfil de conteúdo do negócio</p>
                <p className="text-xs text-gray-500">
                  {carregandoPerfil ? 'Carregando...' : profileSalvo ? '✅ Preenchido — usado para personalizar tudo' : '⚠️ Preencha para gerar conteúdo de qualidade'}
                </p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">{profileAberto ? '▲ fechar' : '▼ editar'}</span>
          </button>

          {profileAberto && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {field('Nome do negócio *', 'negocio', 'Ex: Clínica Sorria')}
                {field('Nicho *', 'nicho', 'Ex: Odontologia')}
              </div>
              {field('Público / cliente ideal *', 'publico', 'Quem é o cliente ideal e qual a dor principal dele', true)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {field('Faixa etária do público', 'idadePublico', 'Ex: 25-45 anos')}
                {field('Tom de voz', 'tomVoz', 'Ex: próximo e acolhedor / técnico / provocador')}
              </div>
              {field('Essência / diferencial', 'essencia', 'O que torna esse profissional único', true)}
              {field('Transformação que entrega (antes → depois)', 'transformacao', 'Ex: de inseguro com o sorriso a confiante', true)}
              {field('Crenças / opiniões fortes', 'crencas', 'Opiniões do profissional que geram conteúdo autoral', true)}
              {field('Objeções comuns dos clientes', 'objecoes', 'Ex: "é caro", "dói", "não tenho tempo"', true)}
              {field('Provas (casos, números, depoimentos)', 'provas', 'Resultados reais que pode citar', true)}
              {field('Serviços / produtos / procedimentos', 'servicos', 'Liste separados por vírgula', true)}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={salvarPerfil} disabled={salvandoPerfil}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all">
                  {salvandoPerfil ? '⏳ Salvando...' : '💾 Salvar perfil'}
                </button>
                <p className="text-xs text-gray-400">Quanto mais completo, mais únicos e melhores os roteiros.</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Painel esquerdo — gerador */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Etapa do funil</label>
              <div className="grid grid-cols-3 gap-1.5">
                {FUNIS.map(f => (
                  <button key={f.id} onClick={() => setFunil(f.id)}
                    className={`px-2 py-2.5 rounded-lg text-center transition-colors border ${funil === f.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</label>
              <div className="space-y-1.5">
                {CATEGORIAS.map(c => (
                  <button key={c.id} onClick={() => setCategoria(c.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border flex items-start gap-2.5 ${categoria === c.id ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <span className="text-base mt-0.5">{c.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${categoria === c.id ? 'text-indigo-700' : 'text-gray-700'}`}>{c.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formato</label>
              <div className="grid grid-cols-3 gap-1.5">
                {FORMATOS.map(f => (
                  <button key={f.id} onClick={() => setFormato(f.id)}
                    className={`px-2 py-2.5 rounded-lg text-center transition-colors border ${formato === f.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                    <p className="text-lg leading-none">{f.emoji}</p>
                    <p className="text-xs font-medium mt-1">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Serviço/produto foco (opcional)</label>
                <input value={servico} onChange={e => setServico(e.target.value)}
                  placeholder="Ex: clareamento dental"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tema / assunto (opcional)</label>
                <textarea value={tema} onChange={e => setTema(e.target.value)} rows={2}
                  placeholder="Deixe em branco para a IA sugerir, ou diga o tema"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
            </div>

            <button onClick={gerar} disabled={gerando}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-sm">
              {gerando ? '⏳ Gerando...' : '✨ Gerar roteiro'}
            </button>
          </div>

          {/* Painel direito — resultado */}
          <div className="lg:col-span-3 space-y-4">
            {gerando && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-5">
                <div className="text-5xl animate-pulse">✨</div>
                <p className="text-indigo-600 font-medium">{loadingMsg}</p>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 text-sm">❌ {erro}</p>
              </div>
            )}

            {!gerando && !conteudo && !erro && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
                <div className="text-5xl opacity-20">📱</div>
                <p className="text-gray-400 text-sm">Escolha funil, categoria e formato<br />e clique em <span className="font-medium text-gray-600">Gerar roteiro</span></p>
              </div>
            )}

            {conteudo && !gerando && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{conteudo.titulo}</p>
                    <p className="text-indigo-600 text-xs mt-0.5">
                      {formatoLabel} • {CATEGORIAS.find(c => c.id === categoria)?.label}
                      {conteudo.usouTendencias && ' • 🔥 com tendências atuais'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copiarTudo}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${copiado === 'tudo' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
                      {copiado === 'tudo' ? '✅ Copiado' : '📋 Copiar tudo'}
                    </button>
                    <button onClick={salvarPeca} disabled={salvandoPeca || salvoPeca}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50">
                      {salvandoPeca ? '⏳' : salvoPeca ? '✅ Salvo' : '💾 Salvar'}
                    </button>
                  </div>
                </div>

                {/* Gancho */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">🎣 Gancho</p>
                  <p className="text-gray-900 font-medium leading-relaxed">{conteudo.gancho}</p>
                </div>

                {/* Estrutura */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">📝 Roteiro</p>
                  {conteudo.estrutura.map((s, i) => (
                    <div key={i} className="border-l-2 border-indigo-200 pl-3">
                      <p className="text-xs font-semibold text-indigo-600">{s.secao}</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{s.conteudo}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">🎯 CTA</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{conteudo.cta}</p>
                </div>

                {/* Legenda */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">📄 Legenda</p>
                    <button onClick={() => copiar(`${conteudo.legenda}\n\n${conteudo.hashtags.map(h => `#${h}`).join(' ')}`, 'legenda')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${copiado === 'legenda' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'}`}>
                      {copiado === 'legenda' ? '✅' : '📋 Copiar'}
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{conteudo.legenda}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                    {conteudo.hashtags.map((tag, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Dicas */}
                {conteudo.dicas && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">💡 Dicas de execução</p>
                    <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{conteudo.dicas}</p>
                  </div>
                )}

                <button onClick={gerar}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  🔄 Gerar outra versão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal histórico */}
      {showHistorico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowHistorico(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-gray-900">Meus roteiros</p>
              <button onClick={() => setShowHistorico(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-3 overflow-y-auto">
              {carregandoHistorico ? (
                <p className="text-center text-gray-400 text-sm py-8">Carregando...</p>
              ) : historico.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Nenhum roteiro salvo ainda.</p>
              ) : (
                <div className="space-y-1.5">
                  {historico.map(p => (
                    <div key={p.id} onClick={() => carregarPeca(p.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer flex items-center gap-3 group">
                      <span className="text-lg flex-shrink-0">{FORMATOS.find(f => f.id === p.formato)?.emoji ?? '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.titulo}</p>
                        <p className="text-xs text-gray-400">
                          {CATEGORIAS.find(c => c.id === p.categoria)?.label} • {FORMATOS.find(f => f.id === p.formato)?.label} • {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button onClick={e => excluirPeca(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0 px-2 text-lg">🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
