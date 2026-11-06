<template>
  <section class="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[760px]:grid-cols-1">
    <KpiCard
      :label="t('dashboard.driversKpi')"
      :value="stats ? formatNumber(stats.users.drivers) : '—'"
      :icon="Users"
      tone="navy"
    >
      <span class="font-medium text-ink-3">
        {{ t('dashboard.usersNote', { count: stats ? formatNumber(stats.users.total) : '—' }) }}
      </span>
    </KpiCard>

    <KpiCard
      :label="t('dashboard.pendingKpi')"
      :value="formatNumber(counts.Pending)"
      :icon="Clock"
      tone="warm"
    >
      <span class="font-medium text-ink-3">{{ t('dashboard.pendingNote') }}</span>
    </KpiCard>

    <KpiCard
      :label="t('dashboard.cargosKpi')"
      :value="stats ? formatNumber(stats.cargos.total) : '—'"
      :icon="Truck"
      tone="green"
    >
      <span class="font-medium text-ink-3">
        {{
          t('dashboard.cargosNote', {
            completed: stats ? formatNumber(stats.cargos.byStatus.COMPLETED) : '—',
            pending: stats ? formatNumber(stats.cargos.byStatus.PENDING_REVIEW) : '—',
          })
        }}
      </span>
    </KpiCard>
  </section>

  <CargoQueueCard />
</template>

<script setup lang="ts">
import { Clock, Truck, Users } from 'lucide-vue-next';

const { t, formatNumber } = useI18n();
const { counts, stats } = useAdminData();
</script>
