<template>
  <div class="grid gap-3.5">
    <section class="viewhead">
      <div>
        <h2>{{ t('users.title') }}</h2>
        <p>{{ t('users.subtitle') }}</p>
      </div>
    </section>

    <UsersCard />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
