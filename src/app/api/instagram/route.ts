import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username } = await req.json()
  if (!username) return NextResponse.json({ error: 'Username obrigatório' }, { status: 400 })

  const clean = username.replace(/^@/, '').trim()

  const rapidApiKey = process.env.RAPIDAPI_KEY
  if (!rapidApiKey) return NextResponse.json({ error: 'RAPIDAPI_KEY não configurado' }, { status: 500 })

  const res = await fetch(
    `https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_info_v2.php?username=${encodeURIComponent(clean)}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey,
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `Erro ao buscar perfil: ${text}` }, { status: res.status })
  }

  const data = await res.json()

  if (data.status === false || data.error) {
    return NextResponse.json({ error: data.error ?? 'Perfil não encontrado' }, { status: 404 })
  }

  const user = data.data?.user ?? data.user ?? data
  return NextResponse.json({ profile: user })
}
