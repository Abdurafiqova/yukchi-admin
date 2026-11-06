<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="fixed bottom-6 right-6 z-[80] flex items-center gap-[9px] rounded-[11px] bg-navy-deep px-4 py-3 text-[13px] font-semibold text-white shadow-[0_18px_36px_-14px_rgba(10,20,35,.65)]"
      role="status"
    >
      <Check :size="17" :stroke-width="2.1" />
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next';

const { message } = useToast();
</script>
