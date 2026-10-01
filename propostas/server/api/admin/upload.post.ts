import { uid } from '../../../utils/proposal'

// Recebe uma imagem já comprimida no navegador (data URL JPEG/WebP) e guarda no banco.
export default defineEventHandler(async (event) => {
  const { dataUrl } = await readBody<{ dataUrl?: string }>(event)
  if (!dataUrl || !/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) {
    throw createError({ statusCode: 400, statusMessage: 'Imagem inválida' })
  }
  if (dataUrl.length > 900_000) throw createError({ statusCode: 413, statusMessage: 'Imagem muito grande' })
  const id = uid() + uid()
  await images.set(id, dataUrl)
  return { url: `/api/img/${id}` }
})
