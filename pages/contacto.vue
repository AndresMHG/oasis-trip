<template>
  <div>
    <PageHero :eyebrow="t('contact.eyebrow')" :title="t('contact.title')" :sub="t('contact.lead')" />

    <section class="section">
      <div class="container contact">
        <!-- Methods -->
        <div class="contact__methods" v-reveal.left>
          <a :href="waLink(t('whatsapp.message'))" target="_blank" rel="noopener" class="cm cm--wa">
            <div class="cm__ico"><AppIcon name="whatsapp" :size="24" /></div>
            <div>
              <span class="cm__label">{{ t('contact.whatsappLabel') }}</span>
              <strong>{{ phoneDisplay }}</strong>
            </div>
          </a>
          <a v-for="e in emails" :key="e" :href="`mailto:${e}`" class="cm">
            <div class="cm__ico"><AppIcon name="mail" :size="22" /></div>
            <div>
              <span class="cm__label">{{ t('contact.emailLabel') }}</span>
              <strong>{{ e }}</strong>
            </div>
          </a>
          <a :href="instagramUrl" target="_blank" rel="noopener" class="cm">
            <div class="cm__ico"><AppIcon name="instagram" :size="22" /></div>
            <div>
              <span class="cm__label">{{ t('contact.instagramLabel') }}</span>
              <strong>@{{ instagramHandle }}</strong>
            </div>
          </a>
        </div>

        <!-- Form -->
        <form class="contact__form" v-reveal.right @submit.prevent="send">
          <div class="field">
            <label>{{ t('contact.form.name') }}</label>
            <input v-model="form.name" type="text" :placeholder="t('contact.form.namePh')" required />
          </div>
          <div class="field">
            <label>{{ t('contact.form.contactField') }}</label>
            <input v-model="form.contact" type="text" :placeholder="t('contact.form.contactPh')" />
          </div>
          <div class="field-row">
            <div class="field">
              <label>{{ t('contact.form.origin') }}</label>
              <input v-model="form.origin" type="text" :placeholder="t('contact.form.originPh')" />
            </div>
            <div class="field">
              <label>{{ t('contact.form.destination') }}</label>
              <input v-model="form.destination" type="text" :placeholder="t('contact.form.destinationPh')" />
            </div>
          </div>
          <div class="field">
            <label>{{ t('contact.form.message') }}</label>
            <textarea v-model="form.message" rows="4" :placeholder="t('contact.form.messagePh')" />
          </div>
          <button type="submit" class="btn btn--accent btn--lg" style="width:100%; justify-content:center">
            <AppIcon name="whatsapp" :size="20" /> {{ t('contact.form.submit') }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { waLink, phoneDisplay, emails, instagramHandle, instagramUrl } = useBrand()

const form = reactive({ name: '', contact: '', origin: '', destination: '', message: '' })

const send = () => {
  const lines = [
    t('whatsapp.message'),
    '',
    `${t('contact.form.name')}: ${form.name}`,
    form.contact ? `${t('contact.form.contactField')}: ${form.contact}` : '',
    form.origin ? `${t('contact.form.origin')}: ${form.origin}` : '',
    form.destination ? `${t('contact.form.destination')}: ${form.destination}` : '',
    form.message ? `${t('contact.form.message')}: ${form.message}` : ''
  ].filter(Boolean)
  window.open(waLink(lines.join('\n')), '_blank', 'noopener')
}

usePageSeo({ title: `${t('contact.title')} · Oasis Trip`, description: t('contact.lead') })
</script>

<style scoped>
.contact { display: grid; grid-template-columns: 1fr 1.2fr; gap: 44px; align-items: start; }
.contact__methods { display: grid; gap: 14px; }
.cm { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid var(--c-line);
  border-radius: 16px; padding: 18px 20px; box-shadow: var(--shadow-sm); transition: transform .18s, box-shadow .25s; }
.cm:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.cm__ico { width: 48px; height: 48px; flex: none; border-radius: 14px; display: grid; place-items: center;
  background: rgba(15,61,87,.08); color: var(--c-primary); }
.cm--wa .cm__ico { background: rgba(37,211,102,.16); color: #25D366; }
.cm__label { display: block; font-size: .8rem; color: var(--c-gray-300); }
.cm strong { color: var(--c-primary); font-family: var(--ff-head); word-break: break-word; }

.contact__form { background: #fff; border: 1px solid var(--c-line); border-radius: 22px; padding: 32px; box-shadow: var(--shadow-md); display: grid; gap: 16px; }
.field { display: grid; gap: 7px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { font-family: var(--ff-head); font-weight: 600; font-size: .9rem; color: var(--c-primary); }
input, textarea { width: 100%; border: 1.5px solid var(--c-line); border-radius: 12px; padding: 13px 15px;
  font-family: var(--ff-body); font-size: 1rem; color: var(--c-text); background: var(--c-bg-soft); transition: border-color .2s, background .2s; }
input:focus, textarea:focus { outline: none; border-color: var(--c-primary-300); background: #fff; }
textarea { resize: vertical; }
@media (max-width: 880px) { .contact { grid-template-columns: 1fr; gap: 28px; } .field-row { grid-template-columns: 1fr; } }
</style>
