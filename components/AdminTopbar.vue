<template>
  <header
    class="sticky top-0 z-20 flex items-center justify-between gap-5 border-b border-line bg-white/95 px-7 py-3.5 backdrop-blur max-[760px]:flex-wrap max-[760px]:gap-3 max-[760px]:px-4"
  >
    <div>
      <span class="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-3">{{ t('topbar.kicker') }}</span>
      <h1 class="text-[23px] font-extrabold leading-[1.2] tracking-[-0.025em]">{{ title }}</h1>
    </div>

    <div class="flex items-center gap-2.5 max-[760px]:w-full">
      <label
        class="flex h-11 w-[300px] items-center gap-[9px] rounded-[11px] border border-line bg-surface2 px-[13px] text-ink-3 transition focus-within:border-navy focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(26,54,93,.10)] max-[1180px]:w-[230px] max-[760px]:w-auto max-[760px]:flex-1"
      >
        <Search :size="18" :stroke-width="1.8" class="shrink-0" />
        <input
          v-model="query"
          type="search"
          :placeholder="t('topbar.search')"
          autocomplete="off"
          :aria-label="t('topbar.searchAria')"
          class="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#6c7a8c]"
        />
      </label>

      <LangSwitcher />

      <div class="relative">
        <button
          ref="bellRef"
          type="button"
          class="relative grid h-11 w-11 place-items-center rounded-[11px] border border-line bg-surface text-ink-2 transition hover:border-navy-line hover:bg-navy-soft hover:text-navy"
          :aria-label="t('topbar.notifications')"
          :aria-expanded="open"
          aria-controls="notifPop"
          @click="toggleNotifications"
        >
          <Bell :size="20" :stroke-width="1.7" />
          <span
            v-if="unread > 0"
            class="absolute right-[11px] top-[10px] h-[7px] w-[7px] rounded-full bg-orange shadow-[0_0_0_2px_#fff]"
          />
        </button>

        <div
          v-if="open"
          id="notifPop"
          ref="popRef"
          class="fixed right-24 top-[70px] z-40 w-80 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_48px_-20px_rgba(16,37,66,.45)] max-[760px]:left-4 max-[760px]:right-4 max-[760px]:top-16 max-[760px]:w-auto"
        >
          <div class="flex items-center justify-between gap-2.5 border-b border-line px-4 py-3.5">
            <h3 class="text-[13.5px] font-extrabold">{{ t('topbar.notifications') }}</h3>
            <button
              type="button"
              class="p-1 text-[11.5px] font-bold text-navy hover:text-orange-deep"
              @click="markAllRead"
            >
              {{ t('topbar.markAllRead') }}
            </button>
          </div>
          <div>
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="flex gap-2.5 border-b border-[#eef1f5] px-4 py-3 last:border-0"
            >
              <span
                class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                :class="notification.read ? 'bg-[#cfd8e3]' : 'bg-orange'"
              />
              <div>
                <p class="text-[12.5px] font-semibold leading-snug text-ink">{{ notification.text }}</p>
                <span class="mt-0.5 block text-[11px] text-ink-3">{{ notification.meta }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="flex h-11 items-center gap-[9px] rounded-[11px] border border-line bg-surface pl-[5px] pr-2.5 transition hover:border-navy-line hover:bg-navy-soft max-[760px]:px-1.5"
        :aria-label="t('topbar.account')"
        @click="navigateTo('/settings')"
      >
        <span class="avatar h-8 w-8 text-[11px]" aria-hidden="true">{{ initials }}</span>
        <span class="max-[760px]:hidden">
          <span class="block whitespace-nowrap text-[12.5px] font-bold leading-tight text-ink">{{ displayName }}</span>
          <span class="block text-[10.5px] leading-tight text-ink-3">{{ t('topbar.admin') }}</span>
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Bell, Search } from 'lucide-vue-next';
import type { MessageKey } from '~/i18n/messages';

const route = useRoute();
const { t } = useI18n();
const { query } = useAdminData();
const { showToast } = useToast();
const { user } = useAdminSession();

const titles: Record<string, MessageKey> = {
  '/': 'nav.dashboard',
  '/users': 'nav.users',
  '/moderation': 'nav.moderation',
  '/reports': 'nav.reports',
  '/settings': 'nav.settings',
};

const title = computed(() => t(titles[route.path] ?? 'nav.dashboard'));

const displayName = computed(() => user.value?.fullName || t('topbar.admin'));
const initials = computed(() => {
  const name = displayName.value;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
});

const read = ref([false, false, true]);

const notifications = computed(() => [
  { id: 1, text: t('topbar.notif1'), meta: t('topbar.notif1Meta'), read: read.value[0] },
  { id: 2, text: t('topbar.notif2'), meta: t('topbar.notif2Meta'), read: read.value[1] },
  { id: 3, text: t('topbar.notif3'), meta: t('topbar.notif3Meta'), read: read.value[2] },
]);

const open = ref(false);
const popRef = ref<HTMLElement | null>(null);
const bellRef = ref<HTMLElement | null>(null);
const unread = computed(() => notifications.value.filter((item) => !item.read).length);

function toggleNotifications() {
  open.value = !open.value;
}

function markAllRead() {
  read.value = [true, true, true];
  showToast(t('topbar.markedRead'));
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) return;
  const target = event.target as Node;
  if (popRef.value?.contains(target) || bellRef.value?.contains(target)) return;
  open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeydown);
});
</script>
