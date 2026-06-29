<template>
  <AudiencePage who="colombia" flag="🇨🇴" accent="#D4A017" />
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: () => `${t('audience.colombia.title')} · Oasis Trip`,
  meta: [{ name: 'description', content: t('audience.colombia.subtitle') }]
})
</script>
