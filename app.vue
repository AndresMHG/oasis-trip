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
const head = useLocaleHead({ addSeoAttributes: true })
useHead(head)
</script>
