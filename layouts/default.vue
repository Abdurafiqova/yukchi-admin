<template>
  <div v-if="ready && loggedIn" class="admin-shell">
    <AdminSidebar />

    <div class="flex min-w-0 flex-col">
      <AdminTopbar />

      <main class="flex flex-col gap-5 px-7 pb-10 pt-[26px] max-[760px]:px-4 max-[760px]:pb-8 max-[760px]:pt-[18px]">
        <slot />
      </main>
    </div>

    <AppToast />
  </div>

  <div v-else class="grid min-h-screen place-items-center bg-bg text-[13px] font-semibold text-ink-3">
    <span>{{ ready ? t('common.loading') : '' }}</span>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { ready, loggedIn, restore } = useAdminSession();
const { load } = useAdminData();

onMounted(async () => {
  await restore();
  if (!loggedIn.value) {
    await navigateTo('/login');
    return;
  }
  await load(true);
});
</script>
