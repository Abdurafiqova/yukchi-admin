<template>
  <div class="card">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 class="text-base font-extrabold tracking-[-0.015em]">{{ t('vehicles.title') }}</h2>
        <p class="mt-px text-[12.5px] text-ink-3">
          {{ t('vehicles.shown', { shown: filteredVehicles.length, total: vehicles.length }) }}
        </p>
      </div>

      <div class="tabbar" role="group" :aria-label="t('vehicles.status')">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="{ 'tab-active': vehicleFilter === tab.key }"
          :aria-pressed="vehicleFilter === tab.key"
          @click="vehicleFilter = tab.key"
        >
          {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="adm-table">
        <thead>
          <tr>
            <th scope="col">{{ t('vehicles.plate') }}</th>
            <th scope="col">{{ t('vehicles.type') }}</th>
            <th scope="col">{{ t('vehicles.capacity') }}</th>
            <th scope="col">{{ t('vehicles.driver') }}</th>
            <th scope="col">{{ t('vehicles.registered') }}</th>
            <th scope="col">{{ t('vehicles.status') }}</th>
            <th scope="col" class="text-right">{{ t('vehicles.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="vehiclesLoading && !vehiclesLoaded">
            <td colspan="7">
              <div class="px-5 py-11 text-center text-[13px] font-semibold text-ink-3">
                {{ t('vehicles.loading') }}
              </div>
            </td>
          </tr>
          <tr v-else-if="vehiclesError">
            <td colspan="7">
              <div class="px-5 py-11 text-center">
                <h3 class="mb-1 text-[15px] font-bold">{{ t('queue.loadError') }}</h3>
                <p class="mb-3 text-[13px] text-ink-3">{{ vehiclesError }}</p>
                <button type="button" class="linkbtn" @click="loadVehicles(true)">{{ t('vehicles.retry') }}</button>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr v-for="vehicle in filteredVehicles" :key="vehicle.id">
              <td class="whitespace-nowrap text-[13px] font-bold tabular-nums text-navy">
                {{ vehicle.plateNumber }}
              </td>
              <td class="whitespace-nowrap text-[13px] font-semibold text-ink">
                {{ vehicleTypeLabel(vehicle.vehicleType) }}
              </td>
              <td class="whitespace-nowrap text-[13px] tabular-nums text-ink-2">
                {{ formatNumber(vehicle.capacityKg) }} kg
                <span v-if="vehicle.bodyVolumeM3" class="block text-[11px] text-ink-3">
                  {{ vehicle.bodyVolumeM3 }} m³
                </span>
              </td>
              <td>
                <div class="flex min-w-0 items-center gap-2.5">
                  <span class="avatar" aria-hidden="true">{{ initialsOf(vehicle.driver.fullName) }}</span>
                  <span>
                    <span class="block whitespace-nowrap text-[13.5px] font-bold leading-snug text-ink">
                      {{ vehicle.driver.fullName || '—' }}
                    </span>
                    <span class="block whitespace-nowrap text-[11.5px] text-ink-3">
                      {{ vehicle.driver.phone }}
                    </span>
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap text-[12.5px] text-ink-2">{{ formatDate(vehicle.createdAt) }}</td>
              <td><StatusBadge :value="vehicle.status" /></td>
              <td>
                <div class="flex justify-end gap-1.5">
                  <button
                    type="button"
                    class="mini mini-ok"
                    :disabled="vehicle.status === 'ACTIVE'"
                    :aria-label="`${t('vehicles.approve')} ${vehicle.plateNumber}`"
                    :title="t('vehicles.approve')"
                    @click="approveVehicle(vehicle)"
                  >
                    <Check :size="17" :stroke-width="2.1" />
                  </button>
                  <button
                    type="button"
                    class="mini mini-no"
                    :disabled="vehicle.status === 'BLOCKED'"
                    :aria-label="`${t('vehicles.block')} ${vehicle.plateNumber}`"
                    :title="t('vehicles.block')"
                    @click="blockVehicle(vehicle)"
                  >
                    <Ban :size="16" :stroke-width="2.1" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="vehiclesLoaded && !filteredVehicles.length && !vehiclesLoading">
            <td colspan="7">
              <div class="px-5 py-11 text-center">
                <h3 class="mb-1 text-[15px] font-bold">{{ t('vehicles.emptyTitle') }}</h3>
                <p class="mb-3 text-[13px] text-ink-3">{{ t('vehicles.emptyText') }}</p>
                <button type="button" class="linkbtn" @click="vehicleFilter = 'all'">
                  {{ t('queue.clearFilters') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ban, Check } from 'lucide-vue-next';
import type { VehicleFilter } from '~/composables/useVehicleModeration';

const { t, formatDate, formatNumber, vehicleTypeLabel } = useI18n();
const {
  vehicles,
  filteredVehicles,
  vehicleCounts,
  vehicleFilter,
  vehiclesLoading,
  vehiclesLoaded,
  vehiclesError,
  loadVehicles,
  approveVehicle,
  blockVehicle,
} = useVehicleModeration();
const { loggedIn } = useAdminSession();

watch(loggedIn, (ready) => {
  if (ready) loadVehicles();
}, { immediate: true });

const tabs = computed<{ key: VehicleFilter; label: string; count: number }[]>(() => [
  { key: 'all', label: t('vehicles.filterAll'), count: vehicleCounts.value.all },
  { key: 'PENDING', label: t('vehicles.filterPending'), count: vehicleCounts.value.PENDING },
  { key: 'ACTIVE', label: t('vehicles.filterActive'), count: vehicleCounts.value.ACTIVE },
  { key: 'BLOCKED', label: t('vehicles.filterBlocked'), count: vehicleCounts.value.BLOCKED },
]);

function initialsOf(name: string | null) {
  return (
    (name || '—')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '—'
  );
}
</script>
