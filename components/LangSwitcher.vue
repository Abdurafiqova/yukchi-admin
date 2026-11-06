<template>
  <div
    class="flex h-11 items-center gap-0.5 rounded-[11px] border border-line bg-surface p-1"
    role="group"
    :aria-label="t('lang.switch')"
  >
    <button
      v-for="code in LOCALES"
      :key="code"
      type="button"
      class="h-full rounded-[8px] px-2 text-[11.5px] font-bold uppercase tracking-wide transition"
      :class="locale === code ? 'bg-navy text-white' : 'text-ink-3 hover:bg-navy-soft hover:text-navy'"
      :aria-pressed="locale === code"
      :title="LOCALE_LABELS[code]"
      @click="setLocale(code)"
    >
      {{ code }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { LOCALES, LOCALE_LABELS } from '~/i18n/messages';

const { t, locale, setLocale } = useI18n();
</script>
