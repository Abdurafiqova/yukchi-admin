<template>
  <div class="flex min-h-screen flex-col">
    <div class="flex items-center justify-between px-5 py-4">
      <NuxtLink to="/login" class="flex items-center gap-2.5">
        <span class="grid h-10 w-10 place-items-center rounded-2xl bg-orange text-lg font-extrabold text-white">Y</span>
        <span class="leading-tight">
          <span class="block text-[14px] font-extrabold tracking-wide text-navy">YUKCHI.UZ</span>
          <span class="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">{{ t('brand.console') }}</span>
        </span>
      </NuxtLink>
      <LangSwitcher />
    </div>

    <div class="flex flex-1 items-center justify-center px-4 pb-16">
      <div class="card w-full max-w-[440px] p-7">
        <div class="flex items-center justify-between">
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-orange text-lg font-extrabold text-white">Y</span>
          <span class="text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-3">
            {{ step === 1 ? '1 / 2' : '2 / 2' }}
          </span>
        </div>

        <template v-if="step === 1">
          <h1 class="mt-5 text-[23px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{{ t('login.title') }}</h1>
          <p class="mt-1.5 text-[13px] text-ink-3">{{ t('login.subtitle') }}</p>

          <form class="mt-6 grid gap-4" @submit.prevent="requestCode">
            <div class="grid gap-1.5">
              <label for="admin-phone" class="field-label">{{ t('login.phone') }}</label>
              <div class="flex items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3 focus-within:border-navy focus-within:shadow-[0_0_0_3px_rgba(26,54,93,.10)]">
                <span class="border-r border-line py-3 pr-3 text-sm font-bold text-ink-2">+998</span>
                <input
                  id="admin-phone"
                  v-model="phone"
                  type="tel"
                  inputmode="numeric"
                  maxlength="12"
                  autocomplete="tel-national"
                  placeholder="90 000 00 01"
                  class="h-11 w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3/70"
                />
              </div>
            </div>

            <div class="rounded-[10px] border border-navy/15 bg-navy-soft px-3.5 py-3">
              <p class="text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy">{{ t('login.demo') }}</p>
              <p class="mt-0.5 text-[12.5px] text-ink-2">{{ t('login.demoHint', { phone: demoPhone }) }}</p>
            </div>

            <p v-if="error" class="rounded-lg bg-red-bg px-3 py-2 text-[13px] font-semibold text-red">{{ error }}</p>

            <button type="submit" class="btn btn-primary w-full" :disabled="sending || digits.length < 9">
              {{ sending ? t('login.sending') : t('login.sendCode') }}
            </button>
          </form>

          <p class="mt-4 text-center text-[11.5px] leading-relaxed text-ink-3">{{ t('login.terms') }}</p>
        </template>

        <template v-else>
          <h1 class="mt-5 text-[23px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{{ t('login.code') }}</h1>
          <p class="mt-1.5 text-[13px] text-ink-3">{{ t('login.sentTo', { phone: prettyPhone }) }}</p>

          <div v-if="devCode" class="mt-4 rounded-[10px] border border-navy/15 bg-navy-soft px-3.5 py-3">
            <p class="text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy">{{ t('login.demo') }}</p>
            <p class="mt-0.5 text-[12.5px] text-ink-2">{{ t('login.demoCode', { code: devCode }) }}</p>
          </div>

          <form class="mt-6 grid gap-4" @submit.prevent="verify">
            <div class="grid gap-1.5">
              <label for="admin-code" class="field-label">{{ t('login.code') }}</label>
              <input
                id="admin-code"
                v-model="code"
                type="text"
                inputmode="numeric"
                maxlength="6"
                autocomplete="one-time-code"
                placeholder="000000"
                class="field-input text-center text-xl font-bold tracking-[0.4em]"
              />
            </div>

            <p v-if="error" class="rounded-lg bg-red-bg px-3 py-2 text-[13px] font-semibold text-red">{{ error }}</p>

            <button type="submit" class="btn btn-primary w-full" :disabled="verifying || code.length < 6">
              {{ verifying ? t('login.verifying') : t('login.verify') }}
            </button>
          </form>

          <div class="mt-4 flex items-center justify-between text-[12.5px]">
            <button type="button" class="font-semibold text-ink-2 hover:text-navy" @click="step = 1">
              ← {{ t('login.changePhone') }}
            </button>
            <button type="button" class="font-bold text-navy hover:text-orange-deep" @click="requestCode">
              {{ t('login.resend') }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' });

const { t } = useI18n();
const { loggedIn, restore, requestOtp, login, extractError } = useAdminSession();

const demoPhone = '+998 90 000 00 01';
const step = ref(1);
const phone = ref('900000001');
const code = ref('');
const devCode = ref('');
const error = ref('');
const sending = ref(false);
const verifying = ref(false);

const digits = computed(() => phone.value.replace(/\D/g, ''));
const prettyPhone = computed(() => `+998 ${phone.value.replace(/\D/g, '')}`);

onMounted(async () => {
  await restore();
  if (loggedIn.value) await navigateTo('/');
});

async function requestCode() {
  error.value = '';
  code.value = '';
  sending.value = true;
  try {
    const result = await requestOtp(phone.value);
    devCode.value = result.devCode;
    step.value = 2;
  } catch (err) {
    error.value = extractError(err, t('login.errorSend'));
  } finally {
    sending.value = false;
  }
}

async function verify() {
  error.value = '';
  verifying.value = true;
  try {
    await login(phone.value, code.value);
    await navigateTo('/');
  } catch (err) {
    error.value =
      (err as Error)?.message === 'not-admin'
        ? t('login.notAdmin')
        : extractError(err, t('login.errorCode'));
  } finally {
    verifying.value = false;
  }
}
</script>
