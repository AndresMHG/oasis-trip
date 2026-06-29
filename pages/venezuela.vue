<template>
  <AudiencePage who="venezuela" flag="🇻🇪" accent="#C0392B" />
</template>

<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: `${t('audience.venezuela.title')} · Oasis Trip`,
  description: t('audience.venezuela.subtitle')
})
</script>
