<template>
  <AudiencePage who="brasil" flag="🇧🇷" accent="#1E8449" />
</template>

<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: `${t('audience.brasil.title')} · Oasis Trip`,
  description: t('audience.brasil.subtitle')
})
</script>
