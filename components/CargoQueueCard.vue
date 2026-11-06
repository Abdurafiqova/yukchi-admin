<template>
  <div class="card">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 class="text-base font-extrabold tracking-[-0.015em]">{{ t('queue.title') }}</h2>
        <p class="mt-px text-[12.5px] text-ink-3">
          {{ t('queue.shown', { shown: filteredQueue.length, total: counts.all }) }}
        </p>
      </div>

      <div class="tabbar" role="group" :aria-label="t('queue.status')">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="{ 'tab-active': queueFilter === tab.key }"
          :aria-pressed="queueFilter === tab.key"
          @click="queueFilter = tab.key"
        >
          {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="adm-table">
        <thead>
          <tr>
            <th scope="col">{{ t('queue.cargoId') }}</th>
            <th scope="col">{{ t('queue.owner') }}</th>
            <th scope="col">{{ t('queue.route') }}</th>
            <th scope="col">{{ t('queue.date') }}</th>
            <th scope="col">{{ t('queue.status') }}</th>
            <th scope="col" class="text-right">{{ t('queue.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !loaded">
            <td colspan="6">
              <div class="px-5 py-11 text-center text-[13px] font-semibold text-ink-3">{{ t('queue.loading') }}</div>
            </td>
          </tr>
          <tr v-else-if="error">
            <td colspan="6">
              <div class="px-5 py-11 text-center">
                <h3 class="mb-1 text-[15px] font-bold">{{ t('queue.loadError') }}</h3>
                <p class="mb-3 text-[13px] text-ink-3">{{ error }}</p>
                <button type="button" class="linkbtn" @click="load(true)">{{ t('queue.retry') }}</button>
              </div>
            </td>
          </tr>
          <template v-else>
          <tr v-for="row in filteredQueue" :key="row.id">
            <td class="whitespace-nowrap text-[12.5px] font-bold tabular-nums text-navy">{{ row.id }}</td>
            <td>
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="avatar" aria-hidden="true">{{ row.initials }}</span>
                <span>
                  <span class="block whitespace-nowrap text-[13.5px] font-bold leading-snug text-ink">{{ row.owner }}</span>
                  <span class="block whitespace-nowrap text-[11.5px] text-ink-3">{{ row.phone }}</span>
                </span>
              </div>
            </td>
            <td>
              <span class="block whitespace-nowrap text-[13.5px] font-semibold text-ink">{{ row.route }}</span>
              <span class="block whitespace-nowrap text-[11.5px] text-ink-3">{{ row.cargo }}</span>
            </td>
            <td class="whitespace-nowrap text-[12.5px] text-ink-2">
              {{ row.date }}
              <span class="block text-[11px] text-ink-3">{{ row.time }}</span>
            </td>
            <td><StatusBadge :value="row.status" /></td>
            <td>
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  class="mini mini-ok"
                  :disabled="row.status === 'PUBLISHED'"
                  :aria-label="`${t('queue.approve')} ${row.id}`"
                  :title="t('queue.approve')"
                  @click="approveCargo(row.id)"
                >
                  <Check :size="17" :stroke-width="2.1" />
                </button>
                <button
                  type="button"
                  class="mini mini-no"
                  :disabled="row.status === 'REJECTED'"
                  :aria-label="`${t('queue.reject')} ${row.id}`"
                  :title="t('queue.reject')"
                  @click="rejectDialog?.open(row.id)"
                >
                  <X :size="17" :stroke-width="2.1" />
                </button>
              </div>
            </td>
          </tr>
          </template>
          <tr v-if="loaded && !filteredQueue.length && !loading">
            <td colspan="6">
              <div class="px-5 py-11 text-center">
                <h3 class="mb-1 text-[15px] font-bold">{{ t('queue.emptyTitle') }}</h3>
                <p class="mb-3 text-[13px] text-ink-3">{{ t('queue.emptyText') }}</p>
                <button type="button" class="linkbtn" @click="clearFilters">{{ t('queue.clearFilters') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <RejectDialog ref="rejectDialog" @confirm="rejectCargo" />
  </div>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next';
import type { QueueFilter } from '~/composables/useAdminData';

const { t } = useI18n();
const { counts, queueFilter, filteredQueue, approveCargo, rejectCargo, clearFilters, load, loading, loaded, error } =
  useAdminData();

const rejectDialog = ref<{ open: (id: string) => void } | null>(null);

const tabs = computed<{ key: QueueFilter; label: string; count: number }[]>(() => [
  { key: 'all', label: t('queue.filterAll'), count: counts.value.all },
  { key: 'Pending', label: t('queue.filterPending'), count: counts.value.Pending },
  { key: 'Approved', label: t('queue.filterApproved'), count: counts.value.Approved },
  { key: 'Rejected', label: t('queue.filterRejected'), count: counts.value.Rejected },
]);
</script>
