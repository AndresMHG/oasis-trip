<template>
  <main class="login">
    <form class="login__card panel" @submit.prevent="submit">
      <Logo variant="stack" :height="150" class="login__logo" />
      <div>
        <h1>Propostas</h1>
        <p class="muted small">Acesse para criar e enviar orçamentos.</p>
      </div>
      <label class="field">
        <span>Senha</span>
        <input v-model="password" type="password" autocomplete="current-password" autofocus required />
      </label>
      <p v-if="error" class="login__error">{{ error }}</p>
      <button class="btn btn--primary btn--lg btn--block" :disabled="loading">
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
  </main>
</template>

<script setup lang="ts">
useHead({ title: 'Entrar · Oasis Trip Propostas' })
const password = ref('')
const error = ref('')
const loading = ref(false)

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/admin')
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Senha incorreta. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100dvh; display: grid; place-items: center; padding: 20px;
  background: radial-gradient(circle at 20% 10%, #1b5878 0, transparent 50%), var(--c-primary);
}
.login__card { width: 100%; max-width: 380px; padding: 30px 26px; display: grid; gap: 20px; }
.login__card h1 { font-size: 1.5rem; }
.login__logo { justify-self: center; }
.login__error { color: var(--c-danger); font-size: .9rem; }
</style>
