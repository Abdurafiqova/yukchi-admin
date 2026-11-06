<template>
  <dialog ref="dialog" class="reject-dialog" aria-labelledby="rejectTitle" @close="currentId = null">
    <form method="dialog" @submit.prevent="confirmReject">
      <div class="dialog-body px-[22px] pb-2 pt-[22px]">
        <h2 id="rejectTitle">{{ t('dialog.rejectTitle') }}</h2>
        <p>{{ contextText }}</p>

        <div class="mt-4 grid gap-1.5">
          <label for="rejectReason" class="field-label">{{ t('dialog.reason') }}</label>
          <select
            id="rejectReason"
            v-model="reason"
            class="h-11 rounded-[10px] border border-line-strong bg-surface px-2.5 text-sm text-ink"
          >
            <option v-for="option in reasons" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-2.5 px-[22px] pb-5 pt-4">
        <button type="button" class="btn btn-ghost" @click="close">{{ t('dialog.keep') }}</button>
        <button type="submit" class="btn btn-danger">{{ t('dialog.confirm') }}</button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
const emit = defineEmits<{ confirm: [id: string, reason: string] }>();

const { t } = useI18n();

const reasons = computed(() => [
  t('dialog.reasonIncomplete'),
  t('dialog.reasonPrice'),
  t('dialog.reasonPhotos'),
  t('dialog.reasonDuplicate'),
]);

const dialog = ref<HTMLDialogElement | null>(null);
const currentId = ref<string | null>(null);
const reason = ref('');

const contextText = computed(() =>
  currentId.value
    ? t('dialog.context', { id: currentId.value })
    : t('dialog.contextGeneric'),
);

function open(id: string) {
  currentId.value = id;
  reason.value = reasons.value[0];
  dialog.value?.showModal();
  requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
}

function close() {
  dialog.value?.close();
}

function confirmReject() {
  if (currentId.value) emit('confirm', currentId.value, reason.value);
  close();
}

defineExpose({ open });
</script>
