'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function getDbUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return (
    (await prisma.user.findFirst({ where: { OR: [{ id: user.id }, { email: user.email! }] } })) ??
    (await prisma.user.create({ data: { id: user.id, email: user.email!, name: user.user_metadata?.name || user.email! } }))
  )
}

export type CarrosselPayload = {
  id?: string
  titulo: string
  nicho: string
  tipo: string
  tom: string
  tema: string
  estilo: string
  nome?: string
  instagram?: string
  fotoPerfil?: string
  conteudo: Prisma.InputJsonValue
}

export async function saveCarrossel(payload: CarrosselPayload): Promise<Result<{ id: string }>> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }

  const data = {
    titulo: payload.titulo || 'Carrossel sem título',
    nicho: payload.nicho,
    tipo: payload.tipo,
    tom: payload.tom,
    tema: payload.tema,
    estilo: payload.estilo,
    nome: payload.nome || null,
    instagram: payload.instagram || null,
    fotoPerfil: payload.fotoPerfil || null,
    conteudo: payload.conteudo,
  }

  try {
    // Atualiza se for dono; senão cria
    if (payload.id) {
      const existing = await prisma.carrossel.findUnique({ where: { id: payload.id } })
      if (existing && existing.userId === dbUser.id) {
        await prisma.carrossel.update({ where: { id: existing.id }, data })
        return { success: true, data: { id: existing.id } }
      }
    }
    const created = await prisma.carrossel.create({ data: { ...data, userId: dbUser.id } })
    return { success: true, data: { id: created.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao salvar' }
  }
}

export type CarrosselListItem = {
  id: string
  titulo: string
  nicho: string
  estilo: string
  totalSlides: number
  createdAt: string
}

export async function listCarrosseis(): Promise<Result<CarrosselListItem[]>> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }

  try {
    const rows = await prisma.carrossel.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, titulo: true, nicho: true, estilo: true, conteudo: true, createdAt: true },
      take: 50,
    })
    const items: CarrosselListItem[] = rows.map(r => {
      const slides = (r.conteudo as { slides?: unknown[] } | null)?.slides
      return {
        id: r.id,
        titulo: r.titulo,
        nicho: r.nicho,
        estilo: r.estilo,
        totalSlides: Array.isArray(slides) ? slides.length : 0,
        createdAt: r.createdAt.toISOString(),
      }
    })
    return { success: true, data: items }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao listar' }
  }
}

export async function getCarrossel(id: string): Promise<Result<Record<string, unknown>>> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }

  try {
    const row = await prisma.carrossel.findUnique({ where: { id } })
    if (!row || row.userId !== dbUser.id) return { success: false, error: 'Carrossel não encontrado' }
    return {
      success: true,
      data: {
        id: row.id,
        titulo: row.titulo,
        nicho: row.nicho,
        tipo: row.tipo,
        tom: row.tom,
        tema: row.tema,
        estilo: row.estilo,
        nome: row.nome ?? '',
        instagram: row.instagram ?? '',
        fotoPerfil: row.fotoPerfil ?? '',
        conteudo: row.conteudo,
      },
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao carregar' }
  }
}

export async function deleteCarrossel(id: string): Promise<Result> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }

  try {
    const row = await prisma.carrossel.findUnique({ where: { id } })
    if (!row || row.userId !== dbUser.id) return { success: false, error: 'Carrossel não encontrado' }
    await prisma.carrossel.delete({ where: { id } })
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao excluir' }
  }
}
