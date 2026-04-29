import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username } = await req.json()
  if (!username) return NextResponse.json({ error: 'Username obrigatório' }, { status: 400 })

  const clean = username.replace(/^@/, '').trim()

  const rapidApiKey = process.env.RAPIDAPI_KEY
  if (!rapidApiKey) return NextResponse.json({ error: 'RAPIDAPI_KEY não configurado' }, { status: 500 })

  const res = await fetch(
    'https://instagram-scraper-stable-api.p.rapidapi.com/ig_get_fb_profile_v3.php',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey,
      },
      body: `username_or_url=${encodeURIComponent(clean)}`,
    }
  )

  const data = await res.json()

  if (!res.ok || data.status === false || data.error || data.message) {
    const msg = data.message ?? data.error ?? `HTTP ${res.status}`
    return NextResponse.json({ error: `Erro ao buscar perfil: ${msg}` }, { status: res.status || 400 })
  }

  const user = data.data?.user ?? data.data ?? data.user ?? data
  return NextResponse.json({ profile: user })
}
