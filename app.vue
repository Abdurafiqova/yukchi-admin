<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { locale, t } = useI18n();

useHead(() => ({
  title: `Yukchi.uz — ${t('brand.console')}`,
  htmlAttrs: { lang: locale.value },
}));
</script>
