<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="paths[name] || ''"
  />
</template>

<script setup lang="ts">
defineProps<{ name: string; size?: number | string; stroke?: number | string }>()

const paths: Record<string, string> = {
  plane:
    '<path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l5.3 3.4-2.2 2.2H4l-1 1 4 1.5L9.5 21l1-1v-2.8l2.2-2.2 3.4 5.3a1 1 0 0 0 1.7-.9Z"/>',
  route:
    '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H14a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h6.5"/>',
  package:
    '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  bed:
    '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.3 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  chat:
    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  whatsapp:
    '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0c0 4 3 6 5 6a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 .5"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r="1"/>',
  mail:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  heart:
    '<path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5.5 4.5 4.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7Z"/>'
}
</script>
