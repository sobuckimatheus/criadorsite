export async function GET() {
  return Response.json({
    MENTOR_DOMAIN: process.env.MENTOR_DOMAIN ?? null,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? null,
    VERCEL_TOKEN: process.env.VERCEL_TOKEN ? '✅ definido' : '❌ ausente',
    VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID ?? null,
  })
}
