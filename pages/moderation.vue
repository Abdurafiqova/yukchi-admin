<template>
  <div class="grid gap-3.5">
    <section class="viewhead">
      <div>
        <h2>{{ t('nav.moderation') }}</h2>
        <p>{{ t('moderation.subtitle') }}</p>
      </div>
    </section>

    <CargoQueueCard />
    <VehicleQueueCard />
    <DocumentQueueCard />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
