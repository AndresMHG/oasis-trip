<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
  <Transition name="toast">
    <div v-if="toast.msg" :key="toast.id" class="toast" :class="`toast--${toast.kind}`" role="status">
      <Icon :name="toast.kind === 'error' ? 'info' : 'check'" :size="18" />
      {{ toast.msg }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { state: toast } = useToast()
</script>

<style>
.toast {
  position: fixed; left: 50%; bottom: calc(22px + env(safe-area-inset-bottom)); transform: translateX(-50%);
  z-index: 1000; display: flex; align-items: center; gap: 8px;
  background: var(--c-primary); color: #fff; padding: 12px 18px; border-radius: 999px;
  font-weight: 500; font-size: .92rem; box-shadow: var(--shadow-md); max-width: calc(100vw - 32px);
}
.toast--error { background: var(--c-danger); }
.toast-enter-active, .toast-leave-active { transition: opacity .25s, transform .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>
