export const useBrand = () => {
  const phoneDigits = '5541992182256'
  const phoneDisplay = '+55 41 99218-2256'
  const emails = [
    'vendas@oasistripturismo.com',
    'rocio@oasistripturismo.com',
    'oasistripturismoeviagens@gmail.com'
  ]
  const instagramHandle = 'oasistrip.turismo'
  const instagramUrl = 'https://www.instagram.com/oasistrip.turismo'

  const waLink = (message?: string) => {
    const base = `https://wa.me/${phoneDigits}`
    return message ? `${base}?text=${encodeURIComponent(message)}` : base
  }

  return { phoneDigits, phoneDisplay, emails, instagramHandle, instagramUrl, waLink }
}
