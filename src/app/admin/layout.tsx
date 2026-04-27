import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (dbUser?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        userName={dbUser.name}
        userEmail={dbUser.email}
        isAdmin
      />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
