<template>
  <aside class="admin-side">
    <NuxtLink to="/" class="side-logo" :aria-label="t('brand.home')">
      <span class="side-mark" aria-hidden="true">Y</span>
      <span class="side-brand">
        <strong>Yukchi.uz</strong>
        <span>{{ t('brand.console') }}</span>
      </span>
    </NuxtLink>

    <nav class="side-nav" :aria-label="t('nav.sections')">
      <NuxtLink
        v-for="item in links"
        :key="item.to"
        :to="item.to"
        class="side-link"
        active-class="side-link-active"
        :aria-label="item.label"
      >
        <component :is="item.icon" :size="20" :stroke-width="1.7" class="shrink-0" />
        <span class="side-label">{{ item.label }}</span>
        <span v-if="item.badge" class="side-count">{{ item.badge }}</span>
      </NuxtLink>
    </nav>

    <div class="side-spacer" />

    <div class="side-foot">
      <span class="side-avatar" aria-hidden="true">{{ initials }}</span>
      <span class="side-foot-txt">
        <strong>{{ user?.fullName || t('topbar.admin') }}</strong>
        <span>{{ t('footer.role') }}</span>
      </span>
    </div>

    <button type="button" class="side-signout" :title="t('common.signOut')" @click="signOut">
      <LogOut :size="16" :stroke-width="1.8" />
      <span>{{ t('common.signOut') }}</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { BarChart3, LayoutGrid, LogOut, PackageCheck, Settings, Users } from 'lucide-vue-next';

const { t } = useI18n();
const { counts } = useAdminData();
const { user, logout } = useAdminSession();

const initials = computed(() => {
  const name = user.value?.fullName || 'Admin';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
});

const links = computed(() => [
  { to: '/', label: t('nav.dashboard'), icon: LayoutGrid, badge: null },
  { to: '/users', label: t('nav.users'), icon: Users, badge: null },
  { to: '/moderation', label: t('nav.moderation'), icon: PackageCheck, badge: counts.value.Pending },
  { to: '/reports', label: t('nav.reports'), icon: BarChart3, badge: null },
  { to: '/settings', label: t('nav.settings'), icon: Settings, badge: null },
]);

async function signOut() {
  await logout();
  await navigateTo('/login');
}
</script>

<style scoped>
.side-signout {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #9fb0c4;
  font-size: 12.5px;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
}

.side-signout:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
</style>
