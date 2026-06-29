<template>
  <AudiencePage who="venezuela" flag="🇻🇪" accent="#C0392B" />
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: () => `${t('audience.venezuela.title')} · Oasis Trip`,
  meta: [{ name: 'description', content: t('audience.venezuela.subtitle') }]
})
</script>
