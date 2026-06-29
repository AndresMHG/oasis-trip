<template>
  <AudiencePage who="colombia" flag="🇨🇴" accent="#D4A017" />
</template>

<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: `${t('audience.colombia.title')} · Oasis Trip`,
  description: t('audience.colombia.subtitle')
})
</script>
