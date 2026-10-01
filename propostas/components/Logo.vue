<template>
  <!-- Logotipo oficial Oasis Trip: pin sobre mapa + "OASIS TRIP" + tagline -->
  <svg
    v-if="variant === 'stack'"
    :height="height"
    viewBox="0 0 240 250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Oasis Trip Turismo e Viagens"
  >
    <g :stroke="mapColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M40 30 L64 40 L92 28 L120 40 L148 28 L176 40 L200 32 L202 98 L176 108 L148 96 L120 108 L92 96 L64 108 L42 100 Z" />
      <path d="M64 40 L64 108 M92 28 L92 96 M120 40 L120 108 M148 28 L148 96 M176 40 L176 108" />
      <path d="M52 50 l6 6 m0 -6 l-6 6" />
      <path d="M58 54 Q80 50 92 68 Q106 86 128 78 Q150 66 160 50 Q170 40 184 56" stroke-dasharray="4 5" />
      <path d="M100 88 Q130 92 150 84 Q170 76 190 80" stroke-dasharray="4 5" />
      <path d="M186 50 l5 -8 l5 8 z M184 50 h14 v6 h-14 z" />
      <path d="M70 76 v10 M66 80 q4 -8 8 0 M80 78 v8 M77 81 q3 -7 6 0" />
      <path d="M104 72 v14 M104 72 l8 3 l-8 3" />
    </g>
    <path d="M120 2 C101 2 88 16 88 34 C88 56 120 88 120 88 C120 88 152 56 152 34 C152 16 139 2 120 2 Z" :fill="pinColor" />
    <circle cx="120" cy="33" r="11" :fill="white ? '#0F3D57' : '#fff'" />
    <text x="120" y="162" text-anchor="middle" font-family="Poppins,'Segoe UI',sans-serif" font-size="50" font-weight="700" fill="#F4A261" letter-spacing="-1">OASIS</text>
    <text x="120" y="210" text-anchor="middle" font-family="Poppins,'Segoe UI',sans-serif" font-size="50" font-weight="700" fill="#F4A261" letter-spacing="-1">TRIP</text>
    <text x="120" y="240" text-anchor="middle" font-family="Inter,'Segoe UI',sans-serif" font-size="17" :fill="white ? 'rgba(255,255,255,.85)' : '#4A4A4A'">{{ tagline }}</text>
  </svg>

  <svg
    v-else
    :height="height"
    viewBox="0 0 220 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Oasis Trip"
  >
    <g :stroke="mapColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 22 L14 27 L28 21 L42 27 L54 22 L54 56 L42 61 L28 55 L14 61 L2 56 Z" />
      <path d="M14 27 V61 M28 21 V55 M42 27 V61" />
      <path d="M6 44 Q18 38 28 47 Q38 54 50 42" stroke-dasharray="2.5 3" />
    </g>
    <path d="M28 2 C19 2 13 9 13 17 C13 28 28 44 28 44 C28 44 43 28 43 17 C43 9 37 2 28 2 Z" :fill="pinColor" />
    <circle cx="28" cy="16.5" r="5.5" :fill="white ? '#0F3D57' : '#fff'" />
    <text x="66" y="33" font-family="Poppins,'Segoe UI',sans-serif" font-size="27" font-weight="700" fill="#F4A261" letter-spacing="-.5">OASIS TRIP</text>
    <text x="67" y="52" font-family="Inter,'Segoe UI',sans-serif" font-size="12.5" :fill="white ? 'rgba(255,255,255,.85)' : '#4A4A4A'">{{ tagline }}</text>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ white?: boolean; lang?: string; height?: number; variant?: 'inline' | 'stack' }>(),
  { lang: 'pt', height: 40, variant: 'inline' }
)
const tagline = computed(() => (props.lang === 'es' ? 'Turismo y Viajes' : 'Turismo e Viagens'))
const pinColor = computed(() => (props.white ? '#fff' : '#0F3D57'))
const mapColor = computed(() => (props.white ? 'rgba(255,255,255,.45)' : '#d4d4d4'))
</script>
