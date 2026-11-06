<template>
  <div class="card">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 class="text-base font-extrabold tracking-[-0.015em]">{{ t('users.registered') }}</h2>
        <p class="mt-px text-[12.5px] text-ink-3">
          {{ t('users.shown', { shown: filteredUsers.length, total: totalUsers }) }}
        </p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="adm-table">
        <thead>
          <tr>
            <th scope="col">{{ t('users.account') }}</th>
            <th scope="col">{{ t('users.phone') }}</th>
            <th scope="col">{{ t('users.loads') }}</th>
            <th scope="col">{{ t('users.status') }}</th>
            <th scope="col" class="text-right">{{ t('users.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !loaded">
            <td colspan="5">
              <div class="px-5 py-11 text-center text-[13px] font-semibold text-ink-3">{{ t('queue.loading') }}</div>
            </td>
          </tr>
          <template v-else>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="flex min-w-0 items-center gap-2.5">
                  <span class="avatar" aria-hidden="true">{{ initialsOf(user) }}</span>
                  <span>
                    <span class="block whitespace-nowrap text-[13.5px] font-bold leading-snug text-ink">{{ displayName(user) }}</span>
                    <span class="block whitespace-nowrap text-[11.5px] text-ink-3">{{ roleLabel(user.role) }}</span>
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap text-[12.5px] text-ink-2">{{ prettyPhone(user.phone) }}</td>
              <td class="font-semibold text-ink">{{ user.cargoCount }}</td>
              <td><StatusBadge :value="user.status" /></td>
              <td>
                <div v-if="user.role !== 'ADMIN'" class="flex justify-end">
                  <button
                    type="button"
                    class="mini"
                    :class="user.status === 'BLOCKED' ? 'mini-ok' : 'mini-no'"
                    :aria-label="user.status === 'BLOCKED' ? t('users.unblock') : t('users.block')"
                    :title="user.status === 'BLOCKED' ? t('users.unblock') : t('users.block')"
                    @click="setUserStatus(user, user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED')"
                  >
                    <Check v-if="user.status === 'BLOCKED'" :size="16" :stroke-width="2.1" />
                    <Ban v-else :size="16" :stroke-width="2" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="loaded && !filteredUsers.length && !loading">
              <td colspan="5">
                <div class="px-5 py-11 text-center">
                  <h3 class="mb-1 text-[15px] font-bold">{{ t('users.emptyTitle') }}</h3>
                  <p class="text-[13px] text-ink-3">{{ t('users.emptyText') }}</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ban, Check } from 'lucide-vue-next';
import type { AdminUserRow } from '~/types/admin';

const { t, roleLabel } = useI18n();
const { filteredUsers, totalUsers, loading, loaded, setUserStatus } = useAdminData();

function displayName(user: AdminUserRow) {
  return user.fullName || user.companyName || prettyPhone(user.phone);
}

function prettyPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone;
}

function initialsOf(user: AdminUserRow) {
  return displayName(user)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '—';
}
</script>
