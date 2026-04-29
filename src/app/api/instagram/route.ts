import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://instagram-scraper-stable-api.p.rapidapi.com'

function rapidHeaders(key: string) {
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com',
    'x-rapidapi-key': key,
  }
}

async function safeFetch(url: string, options: RequestInit) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) return null
    const data = await res.json()
    if (data.status === false || data.error || data.message) return null
    return data
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { username } = await req.json()
  if (!username) return NextResponse.json({ error: 'Username obrigatório' }, { status: 400 })

  const clean = username.replace(/^@/, '').trim()
  const igUrl = `https://www.instagram.com/${clean}/`

  const rapidApiKey = process.env.RAPIDAPI_KEY
  if (!rapidApiKey) return NextResponse.json({ error: 'RAPIDAPI_KEY não configurado' }, { status: 500 })

  const opts = (body: string) => ({
    method: 'POST' as const,
    headers: rapidHeaders(rapidApiKey),
    body,
  })

  const [profileData, highlightsData, postsData] = await Promise.all([
    safeFetch(`${BASE}/ig_get_fb_profile_v3.php`, opts(`username_or_url=${encodeURIComponent(clean)}`)),
    safeFetch(`${BASE}/get_ig_user_highlights.php`, opts(`username_or_url=${encodeURIComponent(clean)}`)),
    safeFetch(`${BASE}/get_ig_user_posts.php`, opts(`username_or_url=${encodeURIComponent(igUrl)}&amount=12&pagination_token=`)),
  ])

  if (!profileData) {
    return NextResponse.json({ error: 'Perfil não encontrado ou privado' }, { status: 404 })
  }

  const user = profileData.data?.user ?? profileData.data ?? profileData.user ?? profileData

  // Extract highlights
  const rawHighlights: { title?: string; cover_media?: { thumbnail_src?: string }; media_count?: number }[] =
    highlightsData?.data?.highlights ??
    highlightsData?.highlights ??
    highlightsData?.data ??
    []

  const highlights = Array.isArray(rawHighlights)
    ? rawHighlights.map((h) => ({
        title: h.title ?? '',
        hasCoverImage: !!(h.cover_media?.thumbnail_src),
        mediaCount: h.media_count ?? 0,
      }))
    : []

  // Extract pinned posts
  const rawPosts: { is_pinned?: boolean; caption?: { text?: string }; media_type?: number; like_count?: number }[] =
    postsData?.data?.posts ??
    postsData?.posts ??
    postsData?.data ??
    []

  const pinnedPosts = Array.isArray(rawPosts)
    ? rawPosts
        .filter((p) => p.is_pinned)
        .map((p) => ({
          caption: p.caption?.text?.slice(0, 200) ?? '',
          mediaType: p.media_type ?? 1,
          likeCount: p.like_count ?? 0,
        }))
    : []

  return NextResponse.json({ profile: user, highlights, pinnedPosts })
}
