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

// ── Perfil de conteúdo (o "cérebro da marca") ────────────────────────────────

export type ContentProfileInput = {
  negocio: string
  nicho: string
  publico: string
  idadePublico?: string
  essencia?: string
  transformacao?: string
  tomVoz?: string
  crencas?: string
  objecoes?: string
  provas?: string
  servicos?: string
}

export async function getContentProfile(): Promise<Result<ContentProfileInput | null>> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }
  try {
    const p = await prisma.contentProfile.findUnique({ where: { userId: dbUser.id } })
    if (!p) {
      // Tenta pré-preencher a partir do site que o mentorado já cadastrou
      const site = await prisma.site.findFirst({
        where: { userId: dbUser.id },
        orderBy: { updatedAt: 'desc' },
        include: { servicos: { orderBy: { ordem: 'asc' } } },
      })
      if (site) {
        return {
          success: true,
          data: {
            negocio: site.nomeNegocio,
            nicho: site.segmento,
            publico: site.dorPrincipal || '',
            transformacao: site.resultadoCliente || '',
            servicos: site.servicos.map(s => s.nome).join(', '),
          },
        }
      }
      return { success: true, data: null }
    }
    return {
      success: true,
      data: {
        negocio: p.negocio,
        nicho: p.nicho,
        publico: p.publico,
        idadePublico: p.idadePublico ?? '',
        essencia: p.essencia ?? '',
        transformacao: p.transformacao ?? '',
        tomVoz: p.tomVoz ?? '',
        crencas: p.crencas ?? '',
        objecoes: p.objecoes ?? '',
        provas: p.provas ?? '',
        servicos: p.servicos ?? '',
      },
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao carregar perfil' }
  }
}

export async function saveContentProfile(input: ContentProfileInput): Promise<Result> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }
  if (!input.negocio?.trim() || !input.nicho?.trim() || !input.publico?.trim()) {
    return { success: false, error: 'Preencha negócio, nicho e público.' }
  }
  const data = {
    negocio: input.negocio,
    nicho: input.nicho,
    publico: input.publico,
    idadePublico: input.idadePublico || null,
    essencia: input.essencia || null,
    transformacao: input.transformacao || null,
    tomVoz: input.tomVoz || null,
    crencas: input.crencas || null,
    objecoes: input.objecoes || null,
    provas: input.provas || null,
    servicos: input.servicos || null,
  }
  try {
    await prisma.contentProfile.upsert({
      where: { userId: dbUser.id },
      create: { ...data, userId: dbUser.id },
      update: data,
    })
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao salvar perfil' }
  }
}

// ── Roteiros gerados ─────────────────────────────────────────────────────────

export type ContentPiecePayload = {
  funil: string
  categoria: string
  formato: string
  tema: string
  servico?: string
  titulo: string
  conteudo: Prisma.InputJsonValue
}

export async function saveContentPiece(payload: ContentPiecePayload): Promise<Result<{ id: string }>> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }
  try {
    const created = await prisma.contentPiece.create({
      data: {
        userId: dbUser.id,
        funil: payload.funil,
        categoria: payload.categoria,
        formato: payload.formato,
        tema: payload.tema,
        servico: payload.servico || null,
        titulo: payload.titulo || 'Roteiro sem título',
        conteudo: payload.conteudo,
      },
    })
    return { success: true, data: { id: created.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao salvar' }
  }
}

export type ContentPieceListItem = {
  id: string
  titulo: string
  formato: string
  categoria: string
  funil: string
  createdAt: string
}

export async function listContentPieces(): Promise<Result<ContentPieceListItem[]>> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }
  try {
    const rows = await prisma.contentPiece.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, titulo: true, formato: true, categoria: true, funil: true, createdAt: true },
      take: 50,
    })
    return {
      success: true,
      data: rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao listar' }
  }
}

export async function getContentPiece(id: string): Promise<Result<Record<string, unknown>>> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }
  try {
    const row = await prisma.contentPiece.findUnique({ where: { id } })
    if (!row || row.userId !== dbUser.id) return { success: false, error: 'Roteiro não encontrado' }
    return {
      success: true,
      data: {
        id: row.id,
        funil: row.funil,
        categoria: row.categoria,
        formato: row.formato,
        tema: row.tema,
        servico: row.servico ?? '',
        titulo: row.titulo,
        conteudo: row.conteudo,
      },
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao carregar' }
  }
}

export async function deleteContentPiece(id: string): Promise<Result> {
  const dbUser = await getDbUser()
  if (!dbUser) return { success: false, error: 'Não autorizado' }
  try {
    const row = await prisma.contentPiece.findUnique({ where: { id } })
    if (!row || row.userId !== dbUser.id) return { success: false, error: 'Roteiro não encontrado' }
    await prisma.contentPiece.delete({ where: { id } })
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao excluir' }
  }
}
