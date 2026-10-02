import type { H3Event } from 'h3'
import {
  DEFAULT_SETTINGS,
  effectiveStatus,
  MIX_ID,
  migrateOptionFare,
  mixTotals,
  optionTotals,
  type Activity,
  type Proposal,
  type Settings
} from '../../utils/proposal'
import type { SavedTemplate } from '../../utils/templates'

const db = () => useStorage('db')
const key = (code: string) => `proposals:${code.toUpperCase().replace(/[^A-Z0-9]/g, '')}`

export const getProposal = (code: string) => db().getItem<Proposal>(key(code))

export const saveProposal = async (p: Proposal) => {
  await db().setItem(key(p.code), p)
  return p
}

export const deleteProposal = (code: string) => db().removeItem(key(code))

export const listProposals = async () => {
  const keys = await db().getKeys('proposals')
  const items = await Promise.all(keys.map((k) => db().getItem<Proposal>(k)))
  return items
    .filter((p): p is Proposal => !!p)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const requireProposal = async (event: H3Event) => {
  const code = getRouterParam(event, 'code') || ''
  const p = await getProposal(code)
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Proposta não encontrada' })
  return p
}

export const logActivity = (p: Proposal, type: Activity['type'], detail?: string) => {
  p.activity = [{ type, at: new Date().toISOString(), detail }, ...(p.activity || [])].slice(0, 60)
}

/** Total do que o cliente reservou: uma opção pronta ou a combinação "Monte do seu jeito". */
const reservedTotal = (p: Proposal) => {
  if (p.reservedOptionId === MIX_ID && p.reservedMix) return mixTotals(p.options.map(migrateOptionFare), p.reservedMix).total
  const o = p.options.find((x) => x.id === p.reservedOptionId) || p.options[0]
  return o ? optionTotals(o).total : 0
}

/** Resumo leve usado na lista do dashboard. */
export const summarize = (p: Proposal) => {
  const totals = p.options.map((o) => optionTotals(o).total)
  return {
    code: p.code,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    status: effectiveStatus(p),
    validUntil: p.validUntil,
    currency: p.currency,
    client: p.client,
    destination: {
      city: p.destination.city,
      country: p.destination.country,
      departDate: p.destination.departDate,
      returnDate: p.destination.returnDate,
      image: p.destination.image
    },
    review: p.review || null,
    reviewRequested: p.activity?.some((a) => a.type === 'pedido_avaliacao') || false,
    options: p.options.length,
    minTotal: totals.length ? Math.min(...totals) : 0,
    reservedTotal: p.reservedOptionId ? reservedTotal(p) : null,
    views: p.views || 0,
    lastViewedAt: p.lastViewedAt,
    reservedAt: p.reservedAt
  }
}

export const getSettings = async (): Promise<Settings> => {
  const s = await db().getItem<Settings>('settings')
  return {
    ...DEFAULT_SETTINGS,
    ...(s || {}),
    conditions: { ...DEFAULT_SETTINGS.conditions, ...(s?.conditions || {}) },
    intro: { ...DEFAULT_SETTINGS.intro, ...(s?.intro || {}) },
    payment: { ...DEFAULT_SETTINGS.payment, ...(s?.payment || {}) }
  }
}

export const saveSettings = (s: Settings) => db().setItem('settings', s)

/* ---------- Modelos salvos ---------- */
export const listTemplates = async () => {
  const keys = await db().getKeys('templates')
  const items = await Promise.all(keys.map((k) => db().getItem<SavedTemplate>(k)))
  return items.filter((t): t is SavedTemplate => !!t).sort((a, b) => a.name.localeCompare(b.name))
}
export const getTemplate = (id: string) => db().getItem<SavedTemplate>(`templates:${id.replace(/[^a-z0-9]/gi, '')}`)
export const saveTemplate = (t: SavedTemplate) => db().setItem(`templates:${t.id}`, t)
export const deleteTemplate = (id: string) => db().removeItem(`templates:${id.replace(/[^a-z0-9]/gi, '')}`)

export const images = {
  get: (id: string) => db().getItem<string>(`images:${id.replace(/[^a-z0-9]/gi, '')}`),
  set: (id: string, dataUrl: string) => db().setItem(`images:${id}`, dataUrl)
}

/** Arquivos do guia da viagem (PDF/imagem em data URL) — só saem com o PIN do cliente */
export const files = {
  get: (id: string) => db().getItem<string>(`files:${id.replace(/[^a-z0-9]/gi, '')}`),
  set: (id: string, dataUrl: string) => db().setItem(`files:${id}`, dataUrl),
  remove: (id: string) => db().removeItem(`files:${id.replace(/[^a-z0-9]/gi, '')}`)
}
