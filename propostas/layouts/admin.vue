<template>
  <div class="adm">
    <header class="adm__bar">
      <NuxtLink to="/admin" class="adm__brand">
        <Logo white :height="34" />
        <span class="adm__tag">Propostas</span>
      </NuxtLink>
      <nav class="adm__nav">
        <NuxtLink to="/admin" class="btn btn--ghost btn--sm adm__link" exact-active-class="is-active">
          <Icon name="file" :size="16" /><span>Propostas</span>
        </NuxtLink>
        <NuxtLink to="/admin/avaliacoes" class="btn btn--ghost btn--sm adm__link" active-class="is-active">
          <Icon name="star" :size="16" /><span>Avaliações</span>
        </NuxtLink>
        <NuxtLink to="/admin/configuracoes" class="btn btn--ghost btn--sm adm__link" active-class="is-active">
          <Icon name="settings" :size="16" /><span>Configurações</span>
        </NuxtLink>
        <button class="btn btn--ghost btn--sm adm__link" title="Sair" @click="logout">
          <Icon name="logout" :size="16" />
        </button>
      </nav>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<style scoped>
.adm { min-height: 100dvh; }
.adm__bar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 12px; padding: 10px clamp(12px, 3vw, 28px);
  background: var(--c-primary); color: #fff;
}
.adm__brand { display: flex; align-items: center; gap: 10px; }
.adm__tag {
  font-family: var(--ff-head); font-size: .72rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  background: rgba(244,162,97,.2); color: var(--c-accent); padding: 3px 9px; border-radius: 999px;
}
.adm__nav { margin-left: auto; display: flex; gap: 4px; }
.adm__link { color: rgba(255,255,255,.8); }
.adm__link:hover, .adm__link.is-active { color: #fff; background: rgba(255,255,255,.12); }
@media (max-width: 600px) {
  .adm__link span { display: none; }
  .adm__tag { display: none; }
}
</style>
