import { uid } from '../../../utils/proposal'

// Documento do guia da viagem (e-ticket, cartão de embarque, voucher…): PDF ou imagem em data URL.
// Limite de ~3 MB por arquivo (o envio para a Vercel aceita até 4,5 MB).
export default defineEventHandler(async (event) => {
  const { dataUrl } = await readBody<{ dataUrl?: string }>(event)
  if (!dataUrl || !/^data:(application\/pdf|image\/(jpeg|png|webp));base64,/.test(dataUrl)) {
    throw createError({ statusCode: 400, statusMessage: 'Envie um PDF ou uma imagem' })
  }
  if (dataUrl.length > 4_200_000) throw createError({ statusCode: 413, statusMessage: 'Arquivo muito grande (máx. 3 MB)' })
  const id = uid() + uid()
  await files.set(id, dataUrl)
  return { id }
})
