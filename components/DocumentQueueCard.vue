<template>
  <div class="card">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 class="text-base font-extrabold tracking-[-0.015em]">{{ t('documents.title') }}</h2>
        <p class="mt-px text-[12.5px] text-ink-3">
          {{ t('documents.shown', { shown: filteredDocuments.length, total: documents.length }) }}
        </p>
      </div>

      <div class="tabbar" role="group" :aria-label="t('documents.status')">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="{ 'tab-active': documentFilter === tab.key }"
          :aria-pressed="documentFilter === tab.key"
          @click="documentFilter = tab.key"
        >
          {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="adm-table">
        <thead>
          <tr>
            <th scope="col">{{ t('documents.type') }}</th>
            <th scope="col">{{ t('documents.vehicle') }}</th>
            <th scope="col">{{ t('documents.driver') }}</th>
            <th scope="col">{{ t('documents.uploaded') }}</th>
            <th scope="col">{{ t('documents.status') }}</th>
            <th scope="col" class="text-right">{{ t('documents.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="documentsLoading && !documentsLoaded">
            <td colspan="6">
              <div class="px-5 py-11 text-center text-[13px] font-semibold text-ink-3">
                {{ t('documents.loading') }}
              </div>
            </td>
          </tr>
          <tr v-else-if="documentsError">
            <td colspan="6">
              <div class="px-5 py-11 text-center">
                <h3 class="mb-1 text-[15px] font-bold">{{ t('queue.loadError') }}</h3>
                <p class="mb-3 text-[13px] text-ink-3">{{ documentsError }}</p>
                <button type="button" class="linkbtn" @click="loadDocuments(true)">{{ t('documents.retry') }}</button>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr v-for="doc in filteredDocuments" :key="doc.id">
              <td>
                <span class="block whitespace-nowrap text-[13.5px] font-bold text-ink">
                  {{ documentTypeLabel(doc.type) }}
                </span>
                <span class="block max-w-[260px] truncate text-[11.5px] text-ink-3">{{ doc.originalName }}</span>
                <span class="block text-[11px] text-ink-3">{{ formatFileSize(doc.fileSize) }}</span>
              </td>
              <td>
                <span class="block whitespace-nowrap text-[13px] font-bold tabular-nums text-navy">
                  {{ doc.vehicle.plateNumber }}
                </span>
                <span class="block whitespace-nowrap text-[11.5px] text-ink-3">
                  {{ vehicleTypeLabel(doc.vehicle.vehicleType) }}
                </span>
              </td>
              <td>
                <span class="block whitespace-nowrap text-[13.5px] font-bold leading-snug text-ink">
                  {{ doc.vehicle.driver.fullName || '—' }}
                </span>
                <span class="block whitespace-nowrap text-[11.5px] text-ink-3">{{ doc.vehicle.driver.phone }}</span>
              </td>
              <td class="whitespace-nowrap text-[12.5px] text-ink-2">
                {{ formatDate(doc.createdAt) }}
                <span class="block text-[11px] text-ink-3">{{ formatTime(doc.createdAt) }}</span>
              </td>
              <td>
                <StatusBadge :value="doc.status" />
                <span v-if="doc.note" class="mt-1 block max-w-[200px] text-[11px] text-ink-3" :title="doc.note">
                  {{ doc.note }}
                </span>
              </td>
              <td>
                <div class="flex justify-end gap-1.5">
                  <button
                    type="button"
                    class="mini"
                    :aria-label="`${t('documents.view')} ${doc.originalName}`"
                    :title="t('documents.view')"
                    @click="openDocumentFile(doc)"
                  >
                    <Eye :size="17" :stroke-width="2" />
                  </button>
                  <button
                    type="button"
                    class="mini mini-ok"
                    :disabled="doc.status === 'APPROVED'"
                    :aria-label="`${t('documents.approve')} ${doc.originalName}`"
                    :title="t('documents.approve')"
                    @click="reviewDocument(doc, 'APPROVED')"
                  >
                    <Check :size="17" :stroke-width="2.1" />
                  </button>
                  <button
                    type="button"
                    class="mini mini-no"
                    :disabled="doc.status === 'REJECTED'"
                    :aria-label="`${t('documents.reject')} ${doc.originalName}`"
                    :title="t('documents.reject')"
                    @click="askReject(doc)"
                  >
                    <X :size="17" :stroke-width="2.1" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="documentsLoaded && !filteredDocuments.length && !documentsLoading">
            <td colspan="6">
              <div class="px-5 py-11 text-center">
                <h3 class="mb-1 text-[15px] font-bold">{{ t('documents.emptyTitle') }}</h3>
                <p class="mb-3 text-[13px] text-ink-3">{{ t('documents.emptyText') }}</p>
                <button type="button" class="linkbtn" @click="documentFilter = 'all'">
                  {{ t('queue.clearFilters') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ReasonDialog
      ref="reasonDialog"
      :title="t('documents.rejectTitle')"
      :context="rejectContext"
      :reasons="rejectReasons"
      :reason-label="t('documents.rejectReason')"
      :confirm-label="t('documents.rejectConfirm')"
      :cancel-label="t('documents.cancel')"
      @confirm="confirmReject"
    />
  </div>
</template>

<script setup lang="ts">
import { Check, Eye, X } from 'lucide-vue-next';
import type { DocumentFilter } from '~/composables/useVehicleModeration';
import type { AdminDocument } from '~/types/admin';

const { t, formatDate, formatTime, vehicleTypeLabel, documentTypeLabel } = useI18n();
const {
  documents,
  filteredDocuments,
  documentCounts,
  documentFilter,
  documentsLoading,
  documentsLoaded,
  documentsError,
  loadDocuments,
  reviewDocument,
  openDocumentFile,
  formatFileSize,
} = useVehicleModeration();
const { loggedIn } = useAdminSession();

watch(loggedIn, (ready) => {
  if (ready) loadDocuments();
}, { immediate: true });

const tabs = computed<{ key: DocumentFilter; label: string; count: number }[]>(() => [
  { key: 'all', label: t('documents.filterAll'), count: documentCounts.value.all },
  { key: 'PENDING', label: t('documents.filterPending'), count: documentCounts.value.PENDING },
  { key: 'APPROVED', label: t('documents.filterApproved'), count: documentCounts.value.APPROVED },
  { key: 'REJECTED', label: t('documents.filterRejected'), count: documentCounts.value.REJECTED },
]);

const rejectReasons = computed(() => [
  t('documents.reasonUnreadable'),
  t('documents.reasonMismatch'),
  t('documents.reasonExpired'),
  t('documents.reasonWrong'),
]);

const reasonDialog = ref<{ open: () => void } | null>(null);
const pendingReject = ref<AdminDocument | null>(null);

const rejectContext = computed(() =>
  t('documents.rejectContext', { name: pendingReject.value?.originalName ?? '' }),
);

function askReject(doc: AdminDocument) {
  pendingReject.value = doc;
  reasonDialog.value?.open();
}

function confirmReject(reason: string) {
  if (pendingReject.value) reviewDocument(pendingReject.value, 'REJECTED', reason);
  pendingReject.value = null;
}
</script>
