<template>
  <div class="grid gap-3 rounded-2xl border border-line bg-surface px-5 py-[18px] shadow-card">
    <div class="flex items-center justify-between gap-3">
      <span class="text-[11px] font-bold uppercase tracking-[0.09em] text-ink-3">{{ label }}</span>
      <span class="grid h-10 w-10 place-items-center rounded-[11px]" :class="toneClass">
        <component :is="icon" :size="21" :stroke-width="1.7" />
      </span>
    </div>
    <div class="text-[32px] font-extrabold leading-none tracking-[-0.035em] text-navy tabular-nums">
      {{ value }}
    </div>
    <div class="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

const props = defineProps<{
  label: string;
  value: string;
  icon: Component;
  tone?: 'navy' | 'warm' | 'green';
}>();

const toneClass = computed(() => {
  if (props.tone === 'warm') return 'bg-orange-soft text-orange-deep';
  if (props.tone === 'green') return 'bg-green-bg text-green';
  return 'bg-navy-soft text-navy';
});
</script>
