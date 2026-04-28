'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateSiteHTML } from '@/lib/claude'
import { deployToVercel, deleteVercelProject } from '@/lib/vercel-deploy'
import { formSchema } from '@/types'
import slugify from 'slugify'

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let count = 0
  while (true) {
    const existing = await prisma.site.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) break
    count++
    slug = `${base}-${count}`
  }
  return slug
}

export async function saveSite(data: unknown): Promise<Result<{ id: string }>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Não autorizado' }

  const parsed = formSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Dados do formulário inválidos' }

  const { depoimentos, ...siteFields } = parsed.data

  try {
    const existing = await prisma.site.findUnique({ where: { userId: user.id } })

    if (existing) {
      await prisma.depoimento.deleteMany({ where: { siteId: existing.id } })
      await prisma.site.update({
        where: { id: existing.id },
        data: {
          ...siteFields,
          status: 'DRAFT',
          htmlGerado: null,
          geracoesCount: 0,
          depoimentos: { create: depoimentos },
        },
      })
      revalidatePath('/dashboard')
      return { success: true, data: { id: existing.id } }
    }

    const site = await prisma.site.create({
      data: {
        ...siteFields,
        userId: user.id,
        depoimentos: { create: depoimentos },
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: { id: site.id } }
  } catch (e) {
    console.error('saveSite error:', e)
    return { success: false, error: 'Erro ao salvar dados' }
  }
}

export async function generateSite(siteId: string): Promise<Result> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Não autorizado' }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { depoimentos: true },
  })

  if (!site) return { success: false, error: 'Site não encontrado' }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const isAdmin = dbUser?.role === 'ADMIN'
  if (!isAdmin && site.userId !== user.id) return { success: false, error: 'Acesso negado' }

  if (site.geracoesCount >= 3) {
    return { success: false, error: 'Limite de 3 gerações atingido. Edite o formulário para continuar.' }
  }

  await prisma.site.update({ where: { id: siteId }, data: { status: 'GENERATING' } })

  try {
    const html = await generateSiteHTML({ ...site, depoimentos: site.depoimentos })

    await prisma.site.update({
      where: { id: siteId },
      data: {
        htmlGerado: html,
        status: 'PREVIEW',
        geracoesCount: { increment: 1 },
      },
    })

    revalidatePath('/dashboard/preview')
    return { success: true, data: undefined }
  } catch (e) {
    console.error('generateSite error:', e)
    await prisma.site.update({ where: { id: siteId }, data: { status: 'ERROR' } })
    return { success: false, error: 'Erro ao gerar site com IA. Tente novamente.' }
  }
}

export async function publishSite(siteId: string): Promise<Result<{ url: string }>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Não autorizado' }

  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (!site) return { success: false, error: 'Site não encontrado' }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const isAdmin = dbUser?.role === 'ADMIN'
  if (!isAdmin && site.userId !== user.id) return { success: false, error: 'Acesso negado' }

  if (!site.htmlGerado) return { success: false, error: 'Gere o site antes de publicar' }

  const baseSlug = slugify(site.nomeNegocio, { lower: true, strict: true })
  const slug = site.slug ?? (await ensureUniqueSlug(baseSlug, siteId))

  try {
    const result = await deployToVercel(site.htmlGerado, slug)

    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: 'PUBLISHED',
        slug,
        vercelProjectId: result.projectId,
        vercelUrl: result.deploymentUrl,
        subdomain: result.customDomain,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/preview')
    revalidatePath('/admin')

    const publicUrl = result.customDomain ?? result.deploymentUrl
    return { success: true, data: { url: publicUrl } }
  } catch (e) {
    console.error('publishSite error:', e)
    await prisma.site.update({ where: { id: siteId }, data: { status: 'ERROR' } })
    return { success: false, error: 'Erro ao publicar no Vercel' }
  }
}

export async function resetSiteForTesting(siteId: string): Promise<void> {
  const user = await getAuthUser()
  if (!user) return

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (dbUser?.role !== 'ADMIN') return

  // Delete only the DB record — Vercel project stays live
  await prisma.depoimento.deleteMany({ where: { siteId } })
  await prisma.site.delete({ where: { id: siteId } })

  revalidatePath('/dashboard')
}

export async function removeSite(siteId: string): Promise<Result> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Não autorizado' }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (dbUser?.role !== 'ADMIN') return { success: false, error: 'Acesso negado' }

  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (!site) return { success: false, error: 'Site não encontrado' }

  if (site.vercelProjectId) {
    try {
      await deleteVercelProject(site.vercelProjectId)
    } catch (e) {
      console.warn('Aviso: não foi possível deletar projeto no Vercel', e)
    }
  }

  await prisma.site.update({
    where: { id: siteId },
    data: {
      status: 'DRAFT',
      slug: null,
      subdomain: null,
      vercelProjectId: null,
      vercelUrl: null,
      htmlGerado: null,
      geracoesCount: 0,
    },
  })

  revalidatePath('/admin')
  return { success: true, data: undefined }
}
