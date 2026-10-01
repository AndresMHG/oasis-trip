import { REVIEW_TAGS, type Review } from '../../../utils/proposal'

// Cliente envia (ou atualiza) a avaliação da viagem.
export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  const body = await readBody<Partial<Review>>(event)
  const rating = Math.round(Number(body?.rating))
  if (!(rating >= 1 && rating <= 5)) throw createError({ statusCode: 400, statusMessage: 'Nota inválida' })

  const first = !p.review
  p.review = {
    rating,
    highlights: (body.highlights || []).filter((h) => (REVIEW_TAGS as readonly string[]).includes(h)),
    comment: String(body.comment || '').slice(0, 2000),
    allowPublish: !!body.allowPublish,
    at: new Date().toISOString()
  }
  logActivity(p, 'avaliacao', `${'★'.repeat(rating)}${first ? '' : ' (atualizada)'}`)
  await saveProposal(p)
  return { ok: true }
})
