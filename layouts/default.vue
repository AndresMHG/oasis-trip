<template>
  <div class="app-shell">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <WhatsappFloat />
  </div>
</template>

<script setup lang="ts">
// page transition handled globally below
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity .28s ease, transform .28s ease; }
.page-enter-from { opacity: 0; transform: translateY(14px); }
.page-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
