<template>
  <dialog ref="dialog" class="reject-dialog" aria-labelledby="reasonTitle">
    <form method="dialog" @submit.prevent="confirm">
      <div class="dialog-body px-[22px] pb-2 pt-[22px]">
        <h2 id="reasonTitle">{{ title }}</h2>
        <p>{{ context }}</p>

        <div class="mt-4 grid gap-1.5">
          <label for="reasonSelect" class="field-label">{{ reasonLabel }}</label>
          <select
            id="reasonSelect"
            v-model="reason"
            class="h-11 rounded-[10px] border border-line-strong bg-surface px-2.5 text-sm text-ink"
          >
            <option v-for="option in reasons" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-2.5 px-[22px] pb-5 pt-4">
        <button type="button" class="btn btn-ghost" @click="close">{{ cancelLabel }}</button>
        <button type="submit" class="btn btn-danger">{{ confirmLabel }}</button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  context: string;
  reasons: string[];
  reasonLabel: string;
  confirmLabel: string;
  cancelLabel: string;
}>();

const emit = defineEmits<{ confirm: [reason: string] }>();

const dialog = ref<HTMLDialogElement | null>(null);
const reason = ref('');

function open() {
  reason.value = props.reasons[0] ?? '';
  dialog.value?.showModal();
  requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
}

function close() {
  dialog.value?.close();
}

function confirm() {
  emit('confirm', reason.value);
  close();
}

defineExpose({ open });
</script>
