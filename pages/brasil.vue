<template>
  <AudiencePage who="brasil" flag="🇧🇷" accent="#1E8449" />
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: () => `${t('audience.brasil.title')} · Oasis Trip`,
  meta: [{ name: 'description', content: t('audience.brasil.subtitle') }]
})
</script>
