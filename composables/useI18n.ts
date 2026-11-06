import type { Locale, MessageKey } from '~/i18n/messages';
import { LOCALE_TAGS, LOCALES, messages } from '~/i18n/messages';

const LOCALE_COOKIE = 'yukchi.admin.locale';

const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

export function useI18n() {
  const cookie = useCookie<Locale>(LOCALE_COOKIE, {
    default: () => 'uz',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  const state = useState<Locale>('yukchi-admin-locale', () =>
    LOCALES.includes(cookie.value) ? cookie.value : 'uz',
  );

  const locale = computed<Locale>(() => state.value);

  function setLocale(next: Locale) {
    state.value = next;
    cookie.value = next;
  }

  function t(key: MessageKey, params?: Record<string, string | number>) {
    let value = messages[locale.value][key] ?? messages.uz[key] ?? key;
    if (params) {
      for (const [name, replacement] of Object.entries(params)) {
        value = value.split(`{${name}}`).join(String(replacement));
      }
    }
    return value;
  }

  function statusLabel(value: string) {
    const key = `status.${value}` as MessageKey;
    return messages[locale.value][key] ?? value;
  }

  function roleLabel(value: string) {
    const key = `role.${value}` as MessageKey;
    return messages[locale.value][key] ?? value;
  }

  function vehicleTypeLabel(value: string) {
    const key = `vehicle.${value}` as MessageKey;
    return messages[locale.value][key] ?? value;
  }

  function documentTypeLabel(value: string) {
    const key = `docType.${value}` as MessageKey;
    return messages[locale.value][key] ?? value;
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat(LOCALE_TAGS[locale.value]).format(value);
  }

  function formatDate(value: string | Date | null | undefined) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    if (locale.value === 'uz') {
      return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    }
    return new Intl.DateTimeFormat(LOCALE_TAGS[locale.value], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  function formatTime(value: string | Date | null | undefined) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(LOCALE_TAGS[locale.value], {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return {
    locale,
    setLocale,
    t,
    statusLabel,
    roleLabel,
    vehicleTypeLabel,
    documentTypeLabel,
    formatNumber,
    formatDate,
    formatTime,
  };
}
