// Centralized SEO helper. Builds absolute Open Graph / Twitter tags per page.
// Canonical/hreflang/og:locale are handled automatically by @nuxtjs/i18n (addSeoAttributes).
export const SITE_URL = 'https://oasis-trip-cyan.vercel.app'

export function usePageSeo(opts: { title: string; description: string; image?: string }) {
  const route = useRoute()
  const url = SITE_URL + route.path
  const image = SITE_URL + (opts.image || '/og-image.png')

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogType: 'website',
    ogUrl: url,
    ogSiteName: 'Oasis Trip Turismo y Viajes',
    ogImage: image,
    ogImageSecureUrl: image,
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: 'Oasis Trip · Turismo y Viajes',
    twitterCard: 'summary_large_image',
    twitterTitle: opts.title,
    twitterDescription: opts.description,
    twitterImage: image,
    twitterImageAlt: 'Oasis Trip · Turismo y Viajes'
  })
}
