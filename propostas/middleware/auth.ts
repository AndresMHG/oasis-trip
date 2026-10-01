export default defineNuxtRouteMiddleware(async () => {
  const { admin } = await $fetch<{ admin: boolean }>('/api/auth/me')
  if (!admin) return navigateTo('/login')
})
