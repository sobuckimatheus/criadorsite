'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type AuthState = { error?: string }

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'E-mail ou senha incorretos.' }

  redirect('/dashboard')
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) return { error: 'Preencha todos os campos.' }
  if (password.length < 6) return { error: 'Senha deve ter no mínimo 6 caracteres.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Erro ao criar conta. Tente novamente.' }

  await prisma.user.upsert({
    where: { id: data.user.id },
    update: { name, email },
    create: { id: data.user.id, email, name },
  })

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
