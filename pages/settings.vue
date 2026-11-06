<template>
  <div class="grid gap-3.5">
    <section class="viewhead">
      <div>
        <h2>{{ t('settings.title') }}</h2>
        <p>{{ t('settings.subtitle') }}</p>
      </div>
    </section>

    <div class="grid grid-cols-2 items-start gap-4 max-[900px]:grid-cols-1">
      <div class="card p-5">
        <h2 class="text-[15px] font-extrabold">{{ t('settings.rules') }}</h2>
        <p class="mb-3.5 text-[12.5px] text-ink-3">{{ t('settings.rulesHint') }}</p>

        <div>
          <div
            v-for="rule in rules"
            :key="rule.key"
            class="flex items-center justify-between gap-[18px] border-b border-[#eef1f5] py-3 last:border-0"
          >
            <div>
              <div class="text-[13.5px] font-bold text-ink">{{ rule.title }}</div>
              <div class="mt-px max-w-[34ch] text-[11.5px] text-ink-3">{{ rule.desc }}</div>
            </div>
            <input v-model="ruleState[rule.key]" type="checkbox" class="switch" :aria-label="rule.title" />
          </div>
        </div>

        <div class="mt-3.5 grid gap-1.5">
          <label for="threshold" class="field-label">{{ t('settings.threshold') }}</label>
          <input id="threshold" v-model.number="threshold" type="number" step="1000000" class="field-input" />
          <span class="field-hint">{{ t('settings.thresholdHint') }}</span>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="text-[15px] font-extrabold">{{ t('settings.notifications') }}</h2>
        <p class="mb-3.5 text-[12.5px] text-ink-3">{{ t('settings.notificationsHint') }}</p>

        <div>
          <div
            v-for="channel in channels"
            :key="channel.key"
            class="flex items-center justify-between gap-[18px] border-b border-[#eef1f5] py-3 last:border-0"
          >
            <div>
              <div class="text-[13.5px] font-bold text-ink">{{ channel.title }}</div>
              <div class="mt-px max-w-[34ch] text-[11.5px] text-ink-3">{{ channel.desc }}</div>
            </div>
            <input v-model="channelState[channel.key]" type="checkbox" class="switch" :aria-label="channel.title" />
          </div>
        </div>

        <div class="mt-[18px] flex items-center justify-between gap-3">
          <span class="text-xs text-ink-3">{{ lastSavedText }}</span>
          <button type="button" class="btn btn-primary" @click="save">{{ t('settings.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, formatTime } = useI18n();
const { showToast } = useToast();

type RuleKey = 'auto' | 'photos' | 'duplicate';
type ChannelKey = 'email' | 'sms' | 'weekly';

const ruleState = reactive<Record<RuleKey, boolean>>({ auto: true, photos: true, duplicate: false });
const channelState = reactive<Record<ChannelKey, boolean>>({ email: true, sms: true, weekly: false });

const rules = computed<{ key: RuleKey; title: string; desc: string }[]>(() => [
  { key: 'auto', title: t('settings.ruleAutoTitle'), desc: t('settings.ruleAutoDesc') },
  { key: 'photos', title: t('settings.rulePhotosTitle'), desc: t('settings.rulePhotosDesc') },
  { key: 'duplicate', title: t('settings.ruleDuplicateTitle'), desc: t('settings.ruleDuplicateDesc') },
]);

const channels = computed<{ key: ChannelKey; title: string; desc: string }[]>(() => [
  { key: 'email', title: t('settings.emailTitle'), desc: t('settings.emailDesc') },
  { key: 'sms', title: t('settings.smsTitle'), desc: t('settings.smsDesc') },
  { key: 'weekly', title: t('settings.weeklyTitle'), desc: t('settings.weeklyDesc') },
]);

const threshold = ref(50000000);
const lastSavedAt = ref<Date | null>(null);

const lastSavedText = computed(() =>
  lastSavedAt.value ? t('settings.lastSaved', { time: formatTime(lastSavedAt.value) }) : '',
);

function save() {
  lastSavedAt.value = new Date();
  showToast(t('settings.savedToast'));
}
</script>
