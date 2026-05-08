import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana'
const POLL_INTERVAL_MS = 3000
const MAX_WAIT_MS = 120_000

// Extracts successFlag from any known response shape
function extractFlag(data: Record<string, unknown>): number | undefined {
  const v = data.successFlag ?? (data.data as Record<string, unknown>)?.successFlag
  return typeof v === 'number' ? v : undefined
}

// Extracts image URL from any known response shape
function extractUrl(data: Record<string, unknown>): string | undefined {
  const candidates = [
    (data.response as Record<string, unknown>)?.resultImageUrl,
    (data.data as Record<string, unknown>)?.resultImageUrl,
    ((data.data as Record<string, unknown>)?.response as Record<string, unknown>)?.resultImageUrl,
    data.resultImageUrl,
    data.imageUrl,
  ]
  return candidates.find(u => typeof u === 'string' && u.startsWith('http')) as string | undefined
}

async function submitGeneration(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type: 'TEXTTOIAMGE', numImages: 1 }),
  })
  const data = await res.json() as Record<string, unknown>
  if (!res.ok || data.code !== 200) {
    throw new Error(String(data.msg ?? data.message ?? 'Falha ao criar tarefa'))
  }
  const taskId = (data.data as Record<string, unknown>)?.taskId
  if (!taskId) throw new Error('taskId não retornado')
  return String(taskId)
}

async function pollResult(apiKey: string, taskId: string): Promise<string> {
  const deadline = Date.now() + MAX_WAIT_MS
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    const res = await fetch(`${BASE_URL}/record-info?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    if (!res.ok) continue  // network hiccup — retry

    const data = await res.json() as Record<string, unknown>
    const flag = extractFlag(data)
    const url = extractUrl(data)

    if (flag === 1 && url) return url
    if (flag === 1 && !url) throw new Error('Imagem gerada mas URL não encontrada — verifique resposta da API')
    if (flag === 2 || flag === 3) throw new Error('Geração falhou na NanaBanana (flag ' + flag + ')')
    // flag === 0 ou undefined → ainda gerando, continua polling
  }
  throw new Error('Tempo limite excedido (120s)')
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.NANOBANANA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'NANOBANANA_API_KEY não configurada' }, { status: 500 })
  }

  try {
    const { destaque, texto, nicho } = await req.json()

    // Garante prompt mesmo quando destaque está vazio
    const tema = destaque?.trim()
      || String(texto ?? '').replace(/\*\*/g, '').substring(0, 60)
      || 'professional business scene'

    const prompt = `Professional editorial photography for an Instagram carousel post.
Theme: ${tema}.
Context: ${String(texto ?? '').replace(/\*\*/g, '').substring(0, 150)}.
Niche: ${nicho ?? 'business'}.
Style: photojournalistic, clean composition, dramatic lighting, cinematic, high contrast.
No text, no watermarks, no logos. Square 1:1 aspect ratio.`

    const taskId = await submitGeneration(apiKey, prompt)
    const imageUrl = await pollResult(apiKey, taskId)

    return NextResponse.json({ imageUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
