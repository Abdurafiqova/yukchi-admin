<template>
  <span class="badge" :class="tone">{{ statusLabel(value) }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ value: string }>();
const { statusLabel } = useI18n();

const tone = computed(() => {
  if (['PUBLISHED', 'COMPLETED', 'IN_PROGRESS', 'ACTIVE'].includes(props.value)) return 'badge-green';
  if (['PENDING_REVIEW', 'DRAFT', 'PENDING'].includes(props.value)) return 'badge-amber';
  if (['REJECTED', 'CANCELLED', 'EXPIRED', 'BLOCKED', 'DELETED'].includes(props.value)) return 'badge-red';
  return 'badge-navy';
});
</script>
