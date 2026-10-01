export default defineEventHandler(async (event) => {
  const dataUrl = await images.get(getRouterParam(event, 'id') || '')
  const m = dataUrl?.match(/^data:(image\/[a-z]+);base64,(.+)$/)
  if (!m) throw createError({ statusCode: 404 })
  setResponseHeaders(event, {
    'Content-Type': m[1],
    'Cache-Control': 'public, max-age=31536000, immutable'
  })
  return Buffer.from(m[2], 'base64')
})
