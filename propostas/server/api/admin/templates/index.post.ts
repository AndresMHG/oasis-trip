import { uid } from '../../../../utils/proposal'
import { toTemplateContent } from '../../../../utils/templates'

// Salva uma proposta existente como modelo reutilizável.
export default defineEventHandler(async (event) => {
  const { code, name } = await readBody<{ code: string; name: string }>(event)
  const p = await getProposal(code || '')
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Proposta não encontrada' })
  const t = {
    id: uid() + uid(),
    name: String(name || '').trim().slice(0, 80) || p.destination.city || 'Modelo',
    lang: p.client.lang,
    createdAt: new Date().toISOString(),
    content: toTemplateContent(p)
  }
  await saveTemplate(t)
  return { id: t.id, name: t.name }
})
