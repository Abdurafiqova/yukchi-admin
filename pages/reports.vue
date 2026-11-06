<template>
  <div class="grid gap-3.5">
    <section class="viewhead">
      <div>
        <h2>{{ t('reports.title') }}</h2>
        <p>{{ t('reports.subtitle') }}</p>
      </div>
    </section>

    <div class="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 max-[900px]:grid-cols-1">
      <div class="card px-5 pb-3 pt-[18px]">
        <div class="mb-2 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-[15px] font-extrabold">{{ t('reports.chartTitle') }}</h2>
            <p class="text-xs text-ink-3">{{ range }}</p>
          </div>
          <span class="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-3">
            <i class="inline-block h-2.5 w-2.5 rounded-[3px] bg-orange" />
            {{ t('reports.legendToday', { count: completed }) }}
          </span>
        </div>
        <BarChart />
        <p class="pb-2 text-[11px] text-ink-3">{{ t('reports.sampleNote') }}</p>
      </div>

      <div class="grid content-start gap-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-[14px] border border-line bg-surface px-[18px] py-4 shadow-card"
        >
          <span class="block text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-3">{{ stat.label }}</span>
          <b class="mt-1 block text-2xl font-extrabold leading-tight tracking-[-0.03em] text-navy tabular-nums">{{ stat.value }}</b>
          <small class="text-[11.5px] font-semibold text-ink-3">{{ stat.note }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, formatNumber, formatDate } = useI18n();
const { stats: platform } = useAdminData();

const day = 24 * 60 * 60 * 1000;
const today = new Date();
const from = new Date(today.getTime() - 6 * day);
const range = computed(() => t('reports.chartRange', { from: formatDate(from), to: formatDate(today) }));

const total = computed(() => platform.value?.cargos.total ?? 0);
const completed = computed(() => platform.value?.cargos.byStatus.COMPLETED ?? 0);
const pending = computed(() => platform.value?.cargos.byStatus.PENDING_REVIEW ?? 0);
const users = computed(() => platform.value?.users.total ?? 0);
const offers = computed(() => platform.value?.offers.total ?? 0);
const completionRate = computed(() => (total.value ? Math.round((completed.value / total.value) * 100) : 0));

const stats = computed(() => [
  {
    label: t('reports.totalCargos'),
    value: formatNumber(total.value),
    note: t('dashboard.usersNote', { count: formatNumber(users.value) }),
  },
  {
    label: t('reports.completed'),
    value: formatNumber(completed.value),
    note: t('reports.ofTotal', { value: completionRate.value }),
  },
  {
    label: t('dashboard.offers'),
    value: formatNumber(offers.value),
    note: t('reports.pendingNote', { count: formatNumber(pending.value) }),
  },
]);
</script>
