import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { nomeNegocio, segmento, cidade, estado, dorPrincipal, resultadoCliente, servicoDestaque } = await req.json()

  if (!dorPrincipal || !resultadoCliente) {
    return NextResponse.json({ error: 'Preencha pelo menos a dor principal e o resultado do cliente.' }, { status: 400 })
  }

  const client = new Anthropic()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Você é um especialista em copywriting de alta conversão para sites de pequenos negócios locais brasileiros.

Gere UMA headline e UMA subheadline para a seção hero do site com base nesses dados:
- Negócio: ${nomeNegocio}
- Segmento: ${segmento}
- Localização: ${cidade}${estado ? ` - ${estado}` : ''}
- Principal dor do cliente: ${dorPrincipal}
- Resultado que o cliente alcança: ${resultadoCliente}
- Serviço destaque: ${servicoDestaque}

REGRAS:
- Headline: máx 8 palavras, foca no resultado ou dor transformada, impactante, sem clichês como "bem-vindo"
- Subheadline: 1-2 frases curtas, complementa emocionalmente a headline, fala de benefício ou confiança de forma geral — NUNCA mencione cidade, estado, serviço específico ou nome do negócio

Responda APENAS com JSON válido neste formato exato, sem nenhum texto extra:
{"headline": "...", "subheadline": "..."}`,
      },
    ],
  })

  try {
    const text = (message.content[0] as { type: string; text: string }).text.trim()
    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ error: 'Erro ao processar resposta da IA.' }, { status: 500 })
  }
}
