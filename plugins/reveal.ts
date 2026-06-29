// Scroll-reveal directive: v-reveal  (modifiers: .left .right .zoom .up)
// optional value = delay in ms ->  v-reveal="120"
// Registered universally (client + server) so SSR can resolve the directive.
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null
  let prefersReduced = false

  if (import.meta.client) {
    prefersReduced =
      !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              ;(entry.target as HTMLElement).classList.add('is-visible')
              obs.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      )
    }
  }

  nuxtApp.vueApp.directive('reveal', {
    // mounted only runs on the client
    mounted(el: HTMLElement, binding) {
      el.classList.add('reveal')
      if (binding.modifiers.left) el.classList.add('reveal--left')
      if (binding.modifiers.right) el.classList.add('reveal--right')
      if (binding.modifiers.zoom) el.classList.add('reveal--zoom')
      if (binding.modifiers.up) el.classList.add('reveal--up')
      if (binding.value) el.style.transitionDelay = `${binding.value}ms`

      if (prefersReduced || !observer) {
        el.classList.add('is-visible')
        return
      }
      observer.observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
    // required so SSR can resolve the directive without crashing
    getSSRProps() {
      return {}
    }
  })
})
