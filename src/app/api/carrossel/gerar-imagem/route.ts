import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana'
const POLL_INTERVAL_MS = 3000
const MAX_WAIT_MS = 90_000

async function submitGeneration(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, type: 'TEXTTOIAMGE', numImages: 1 }),
  })
  const data = await res.json()
  if (!res.ok || data.code !== 200) throw new Error(data.msg ?? 'Falha ao criar tarefa')
  return data.data.taskId as string
}

async function pollResult(apiKey: string, taskId: string): Promise<string> {
  const deadline = Date.now() + MAX_WAIT_MS
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    const res = await fetch(`${BASE_URL}/record-info?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    const data = await res.json()
    const flag = data.successFlag ?? data.data?.successFlag
    if (flag === 1) {
      const url = data.response?.resultImageUrl ?? data.data?.response?.resultImageUrl
      if (url) return url as string
      throw new Error('URL da imagem não encontrada na resposta')
    }
    if (flag === 2 || flag === 3) throw new Error('Geração falhou na NanoBanana')
  }
  throw new Error('Tempo limite excedido (90s)')
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.NANOBANANA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'NANOBANANA_API_KEY não configurada' }, { status: 500 })
  }

  try {
    const { destaque, texto, nicho } = await req.json()
    if (!destaque) return NextResponse.json({ error: 'Prompt obrigatório' }, { status: 400 })

    const prompt = `Professional editorial photography for an Instagram carousel post.
Theme: ${destaque}.
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
