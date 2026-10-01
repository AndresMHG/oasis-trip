import { newProposal, type Lang } from '../../../../utils/proposal'
import { applyTemplate, builtinContent } from '../../../../utils/templates'

// Cria uma proposta em branco ou a partir de um modelo (pronto ou salvo).
export default defineEventHandler(async (event) => {
  const body = await readBody<{ lang?: Lang; template?: string } | null>(event).catch(() => null)
  const lang: Lang = body?.lang === 'es' ? 'es' : 'pt'
  const p = newProposal(await getSettings(), lang)

  const tpl = body?.template || ''
  const content = builtinContent(tpl, lang) || (tpl && tpl !== 'pacote' ? (await getTemplate(tpl))?.content : null)
  if (content) applyTemplate(p, content)

  while (await getProposal(p.code)) p.code = newProposal().code
  return saveProposal(p)
})
