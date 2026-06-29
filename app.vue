<template>
  <Html :lang="head.htmlAttrs?.lang">
    <Body>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<script setup lang="ts">
// i18n: adds <html lang>, canonical, hreflang alternates and og:locale tags
const head = useLocaleHead({ addSeoAttributes: true })
useHead(head)

const { phoneDigits, instagramUrl, emails } = useBrand()

// Site-wide SEO defaults (per-page values override these)
useSeoMeta({
  ogSiteName: 'Oasis Trip Turismo y Viajes',
  ogType: 'website',
  ogImage: `${SITE_URL}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Oasis Trip · Turismo y Viajes',
  twitterCard: 'summary_large_image',
  twitterImage: `${SITE_URL}/og-image.png`
})

// Structured data (JSON-LD) — TravelAgency
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Oasis Trip Turismo y Viajes',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  logo: `${SITE_URL}/img/logo.svg`,
  description:
    'Agencia de viajes especializada en conexiones internacionales entre Brasil, Venezuela y Colombia. Pasajes aéreos, rutas internacionales y paquetes personalizados.',
  email: emails[0],
  telephone: `+${phoneDigits}`,
  priceRange: '$$',
  areaServed: ['Brasil', 'Venezuela', 'Colombia', 'Perú', 'Chile', 'Argentina', 'Ecuador', 'México', 'Estados Unidos', 'Europa'],
  knowsLanguage: ['es', 'pt', 'en'],
  sameAs: [instagramUrl],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: `+${phoneDigits}`,
    contactType: 'customer service',
    availableLanguage: ['Spanish', 'Portuguese', 'English']
  }
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd)
    }
  ]
})
</script>
