<template>
  <div v-if="d" class="rv">
    <header class="top" :style="d.destination.image ? { backgroundImage: `url(${d.destination.image})` } : {}">
      <div class="top__shade" />
      <div class="top__logo"><Logo white :lang="lang" :height="34" /></div>
      <div class="top__text">
        <span>{{ t.rvEyebrow }}</span>
        <h1>{{ d.destination.city || '✈️' }}</h1>
      </div>
    </header>

    <main class="wrap">
      <!-- Formulário -->
      <form v-if="!done" class="card form" @submit.prevent="submit">
        <p v-if="d.review && !editing" class="note"><Icon name="check" :size="16" /> {{ t.rvAlready }}</p>
        <h2>{{ t.rvTitle(firstName, d.destination.city) }}</h2>

        <div class="stars" role="radiogroup">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="star"
            :class="{ on: n <= (hover || rating) }"
            :aria-label="`${n}`"
            role="radio"
            :aria-checked="rating === n"
            @click="rating = n"
            @mouseenter="hover = n"
            @mouseleave="hover = 0"
          >
            <svg viewBox="0 0 24 24" width="44" height="44"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" /></svg>
          </button>
        </div>
        <p class="stars__label">{{ rating ? t.rvStars[rating - 1] : t.rvTapStars }}</p>

        <Transition name="fade">
          <div v-if="rating" class="more">
            <div>
              <h3>{{ rating >= 4 ? t.rvLiked : t.rvImprove }}</h3>
              <div class="tags">
                <button
                  v-for="tag in REVIEW_TAGS"
                  :key="tag"
                  type="button"
                  :class="{ on: highlights.includes(tag) }"
                  @click="toggleTag(tag)"
                >
                  <Icon v-if="highlights.includes(tag)" name="check" :size="14" :stroke="2.6" />
                  {{ t.rvTags[tag] }}
                </button>
              </div>
            </div>
            <label class="field">
              <span>{{ t.rvComment }}</span>
              <textarea v-model="comment" rows="4" :placeholder="t.rvCommentPh" maxlength="2000" />
            </label>
            <label class="toggle"><input v-model="allowPublish" type="checkbox" /> {{ t.rvAllow }}</label>
            <button class="btn btn--accent btn--lg btn--block" :disabled="sending">{{ t.rvSend }}</button>
          </div>
        </Transition>
      </form>

      <!-- Agradecimento -->
      <section v-else class="card thanks">
        <div class="thanks__ico" :class="{ sad: rating <= 3 }">
          <Icon :name="rating >= 4 ? 'star' : 'chat'" :size="30" :stroke="2.2" />
        </div>
        <h2>{{ t.rvThanksTitle(firstName) }}</h2>
        <p class="muted">{{ rating >= 4 ? t.rvThanksHappy : t.rvThanksSad }}</p>

        <template v-if="rating >= 4">
          <a v-if="d.agency.googleReviewUrl" class="btn btn--primary btn--lg btn--block" :href="d.agency.googleReviewUrl" target="_blank" rel="noopener">
            <Icon name="star" :size="18" /> {{ t.rvGoogle }}
          </a>
          <a v-if="d.agency.instagram" class="btn btn--lg btn--block ig" :href="`https://www.instagram.com/${d.agency.instagram}`" target="_blank" rel="noopener">
            <Icon name="instagram" :size="18" /> {{ t.rvFollow }}
          </a>
          <a class="btn btn--wa btn--lg btn--block" :href="waUrl(d.agency.whatsapp, t.waNextTrip(d.client.name))" target="_blank" rel="noopener">
            <Icon name="plane" :size="18" /> {{ t.rvNextTrip }}
          </a>
        </template>
        <a v-else class="btn btn--wa btn--lg btn--block" :href="waUrl(d.agency.whatsapp, t.waSad(d.client.name, d.code))" target="_blank" rel="noopener">
          <Icon name="whatsapp" :size="18" /> {{ t.rvTalk }}
        </a>
        <button class="btn btn--ghost btn--block" @click="done = false; editing = true">{{ t.rvEdit }}</button>
      </section>

      <footer class="foot">
        <Logo variant="stack" :lang="lang" :height="96" />
      </footer>
    </main>
  </div>

  <div v-else class="nf">
    <Logo :height="44" />
    <p v-if="error" class="muted">Link inválido · Enlace inválido</p>
  </div>
</template>

<script setup lang="ts">
import { REVIEW_TAGS, waUrl, type Lang, type Review } from '~/utils/proposal'

interface ReviewPage {
  code: string
  client: { name: string; lang: Lang }
  destination: { city: string; country: string; image: string }
  review: Review | null
  agency: { name: string; whatsapp: string; instagram: string; googleReviewUrl: string }
}

const code = String(useRoute().params.code).toUpperCase()
const { data: d, error } = await useFetch<ReviewPage>(`/api/r/${code}`)

const lang = computed(() => d.value?.client.lang || 'pt')
const { t } = useProposalText(lang)
const firstName = computed(() => (d.value?.client.name || '').trim().split(/\s+/)[0])

// Se já avaliou, abre preenchido
const rating = ref(d.value?.review?.rating || 0)
const hover = ref(0)
const highlights = ref<string[]>([...(d.value?.review?.highlights || [])])
const comment = ref(d.value?.review?.comment || '')
const allowPublish = ref(d.value?.review ? d.value.review.allowPublish : true)
const sending = ref(false)
const done = ref(false)
const editing = ref(false)

const toggleTag = (tag: string) => {
  const i = highlights.value.indexOf(tag)
  i >= 0 ? highlights.value.splice(i, 1) : highlights.value.push(tag)
}

const submit = async () => {
  if (!rating.value) return
  sending.value = true
  try {
    await $fetch(`/api/r/${code}`, {
      method: 'POST',
      body: { rating: rating.value, highlights: highlights.value, comment: comment.value, allowPublish: allowPublish.value }
    })
    done.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    sending.value = false
  }
}

useHead(() => ({
  title: `${t.value.rvEyebrow} · Oasis Trip`,
  htmlAttrs: { lang: lang.value === 'es' ? 'es' : 'pt-BR' }
}))
const origin = useRequestURL().origin
useSeoMeta({
  ogTitle: () => t.value.rvTitle(firstName.value, d.value?.destination.city || ''),
  ogDescription: () => t.value.rvBannerText,
  ogImage: () => {
    const img = d.value?.destination.image
    return img ? (img.startsWith('http') ? img : origin + img) : `${origin}/og.png`
  }
})
</script>

<style scoped>
.rv { min-height: 100dvh; background: var(--c-bg-soft); padding-bottom: 30px; }
.wrap { max-width: 560px; margin: -56px auto 0; padding: 0 16px; position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }
.wrap .btn { white-space: normal; text-align: center; }
.card { background: #fff; border: 1px solid var(--c-line); border-radius: 22px; box-shadow: var(--shadow-md); }

.top {
  position: relative; height: 290px; background: linear-gradient(135deg, #0F3D57, #2E8BB0) center/cover; color: #fff;
  display: flex; flex-direction: column; justify-content: flex-end;
}
.top__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,44,64,.5), rgba(10,44,64,.15) 40%, rgba(10,44,64,.85)); }
.top__logo { position: absolute; top: calc(16px + env(safe-area-inset-top)); left: 18px; }
.top__text { position: relative; padding: 0 20px 76px; max-width: 560px; margin: 0 auto; width: 100%; }
.top__text span { font-family: var(--ff-head); font-weight: 600; font-size: .72rem; letter-spacing: 2.5px; text-transform: uppercase; color: var(--c-accent); }
.top__text h1 { color: #fff; font-size: 2.3rem; font-weight: 800; }

.form { padding: 26px 20px; display: grid; gap: 14px; text-align: center; }
.form h2 { font-size: 1.35rem; }
.note { display: flex; gap: 8px; align-items: center; justify-content: center; font-size: .88rem; color: #16693a; background: #e8f7ee; border-radius: 12px; padding: 10px; }

.stars { display: flex; justify-content: center; gap: 4px; }
.star { background: none; border: 0; padding: 2px; cursor: pointer; transition: transform .12s; -webkit-tap-highlight-color: transparent; }
.star:active { transform: scale(.85); }
.star path { fill: #e3eaee; transition: fill .15s; }
.star.on path { fill: #F4B400; }
.star.on { animation: pop .3s; }
@keyframes pop { 50% { transform: scale(1.18); } }
.stars__label { font-family: var(--ff-head); font-weight: 600; color: var(--c-primary); min-height: 1.5em; }
.stars__label:empty, .form:not(:has(.more)) .stars__label { color: var(--c-gray); font-weight: 500; font-size: .92rem; }

.more { display: grid; gap: 18px; text-align: left; padding-top: 6px; border-top: 1px dashed var(--c-line); }
.more h3 { font-size: 1rem; margin: 12px 0 10px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tags button {
  display: inline-flex; align-items: center; gap: 5px; border: 1.5px solid var(--c-line); background: #fff; border-radius: 999px;
  padding: 9px 14px; font-size: .9rem; cursor: pointer; color: var(--c-text); transition: all .15s;
}
.tags button.on { border-color: var(--c-primary); background: var(--c-primary); color: #fff; }
.toggle { font-size: .88rem; color: var(--c-gray); align-items: flex-start; }
.toggle input { margin-top: 1px; flex: none; }

.thanks { padding: 30px 20px; display: grid; gap: 12px; text-align: center; }
.thanks h2 { font-size: 1.5rem; }
.thanks p { margin-bottom: 6px; }
.thanks__ico { justify-self: center; width: 66px; height: 66px; border-radius: 50%; display: grid; place-items: center; background: #fff6d9; color: #d99a00; animation: pop .45s; }
.thanks__ico.sad { background: #e8f1f6; color: var(--c-primary-300); }
.ig { color: #fff; border: 0; background: linear-gradient(45deg, #f58529, #dd2a7b 50%, #8134af); }
.ig:hover { color: #fff; }

.foot { display: grid; justify-items: center; padding-top: 6px; }
.nf { min-height: 100dvh; display: grid; place-content: center; justify-items: center; gap: 12px; }
.fade-enter-active { transition: opacity .3s, transform .3s; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
</style>
