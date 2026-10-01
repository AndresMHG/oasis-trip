import type { Settings } from '../../../utils/proposal'

export default defineEventHandler(async (event) => {
  const body = await readBody<Settings>(event)
  const s: Settings = { ...(await getSettings()), ...body }
  s.validityDays = Math.max(1, Math.round(Number(s.validityDays) || 7))
  await saveSettings(s)
  return s
})
