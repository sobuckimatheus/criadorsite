import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { nicho, nome, tipo, tipoLabel, tipoDesc, tom, tomLabel, tomDesc, tema } = await req.json()

  if (!nicho || !tipo || !tema?.trim()) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const prompt = `Você é um especialista em copywriting viral para Instagram, com domínio absoluto do estilo de thread narrativa que para o scroll.

Crie um carrossel viral completo para Instagram seguindo RIGOROSAMENTE a estrutura abaixo.

DADOS DO PROFISSIONAL:
- Nicho: ${nicho}
- Nome/Negócio: ${nome || 'o profissional'}
- Tipo de carrossel: ${tipoLabel} — ${tipoDesc}
- Tom: ${tomLabel} — ${tomDesc}
- Tema/Assunto: ${tema}

REGRAS OBRIGATÓRIAS DE ESTILO (baseadas nos melhores carrosséis virais brasileiros):
1. Frases CURTAS — máximo 15 palavras por frase
2. Uma ideia por parágrafo — nunca agrupe dois pensamentos
3. Use NEGRITO nas palavras de maior impacto (números, nomes, viradas)
4. Termine cada slide com uma frase que OBRIGA o leitor a passar pro próximo
5. Use datas, números reais e nomes quando possível — especificidade gera credibilidade
6. Ponto final sozinho numa linha dá peso: "Não era." / "Ela se recusou." — use essa técnica
7. O slide 1 deve apresentar o resultado/surpresa ANTES de contar a história
8. Alterne slides de texto puro com slides que pedem imagem
9. Máximo 12 slides, mínimo 8

ESTRUTURA DOS SLIDES:
- Slide 1: Gancho de contraste — mostre o resultado surpreendente antes de explicar
- Slides 2-3: Contexto/origem — quem é, de onde veio, o que tornava diferente
- Slides 4-6: A ascensão ou o problema — o momento de virada, números concretos
- Slides 7-9: O conflito ou aprendizado — a parte que ninguém conta
- Slides 10-11: A resolução e resultado — o que aconteceu depois
- Slide 12: Frase de impacto isolada + CTA para comentar

CRÍTICO: Retorne APENAS JSON válido. Dentro das strings use \\n para quebrar linha, NUNCA quebras de linha literais. Sem markdown, sem texto fora do JSON.

{
  "titulo": "título resumido do carrossel",
  "nicho": "${nicho}",
  "tipo_narrativa": "${tipoLabel}",
  "slides": [
    {
      "texto": "texto do slide com **negrito** nas palavras de impacto. Use \\n\\n para separar parágrafos.",
      "imagem_sugerida": "descrição curta da imagem ideal (ou 'sem imagem')",
      "destaque": "frase de 3-6 palavras que resume o slide"
    }
  ],
  "legenda": "legenda completa para o post no Instagram com gancho inicial, desenvolvimento de 3-4 linhas e CTA final. Use emojis estratégicos.",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"]
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada')

  const text = content.text
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')

  if (start === -1 || end === -1) {
    return NextResponse.json({ error: 'IA não retornou JSON válido' }, { status: 500 })
  }

  const raw = text.slice(start, end + 1)

  let carrossel
  try {
    carrossel = JSON.parse(raw)
  } catch {
    // Repair: escape unescaped newlines inside JSON string values
    const repaired = raw.replace(/("(?:[^"\\]|\\.)*")|[\n\r]/g, (match, str) => {
      if (str) return str // inside a string: keep as-is (already matched whole string)
      return ' ' // outside string: replace bare newlines with space
    })
    try {
      carrossel = JSON.parse(repaired)
    } catch {
      console.error('RAW RESPONSE (first 500):', raw.slice(0, 500))
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA. Tente novamente.' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ carrossel })
}
