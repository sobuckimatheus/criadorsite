import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 })
  }

  try {
    const { destaque, texto, nicho } = await req.json()
    if (!destaque) {
      return NextResponse.json({ error: 'Prompt obrigatório' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `Professional editorial photography for an Instagram carousel post.
Theme: ${destaque}
Context: ${String(texto ?? '').replace(/\*\*/g, '').substring(0, 150)}
Niche: ${nicho ?? 'business'}
Style: photojournalistic, clean composition, dramatic lighting, high contrast, cinematic.
Requirements: no text, no watermarks, no logos, square aspect ratio 1:1.`

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: prompt,
    })

    const parts = response.candidates?.[0]?.content?.parts ?? []
    for (const part of parts) {
      if ((part as { inlineData?: { data: string; mimeType: string } }).inlineData) {
        const { data, mimeType } = (part as { inlineData: { data: string; mimeType: string } }).inlineData
        return NextResponse.json({ imageData: `data:${mimeType};base64,${data}` })
      }
    }

    return NextResponse.json({ error: 'IA não gerou imagem' }, { status: 500 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
