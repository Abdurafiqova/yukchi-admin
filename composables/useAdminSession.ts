import type { AdminProfile, AdminTokens } from '~/types/admin';

const TOKENS_KEY = 'yukchi.admin.tokens';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  retry?: boolean;
};

function extractError(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string | string[] } })?.data;
  const message = data?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

export function normalizeAdminPhone(input: string) {
  const digits = input.replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('998')) return `+${digits.slice(0, 12)}`;
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
}

export function useAdminSession() {
  const base = useRuntimeConfig().public.apiBase as string;
  const user = useState<AdminProfile | null>('admin-profile', () => null);
  const tokens = useState<AdminTokens | null>('admin-tokens', () => null);
  const ready = useState<boolean>('admin-session-ready', () => false);
  let refreshing: Promise<void> | null = null;

  const loggedIn = computed(() => Boolean(user.value?.id && tokens.value?.accessToken));

  function persist() {
    if (!import.meta.client) return;
    if (tokens.value) localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens.value));
    else localStorage.removeItem(TOKENS_KEY);
  }

  function clearSession() {
    user.value = null;
    tokens.value = null;
    persist();
  }

  async function refreshTokens() {
    if (!tokens.value?.refreshToken) throw new Error('no-session');
    const next = await $fetch<AdminTokens>(`${base}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken: tokens.value.refreshToken },
    });
    tokens.value = {
      ...next,
      refreshTokenExpiresAt: next.refreshTokenExpiresAt ?? tokens.value.refreshTokenExpiresAt,
    };
    persist();
  }

  async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, query, retry = true } = options;
    if (!tokens.value?.accessToken) throw new Error('no-session');

    try {
      return await $fetch<T>(`${base}${path}`, {
        method,
        body: body as Record<string, unknown> | undefined,
        query,
        headers: { Authorization: `Bearer ${tokens.value.accessToken}` },
      });
    } catch (error) {
      const status =
        (error as { statusCode?: number; response?: { status?: number } })?.statusCode ??
        (error as { response?: { status?: number } })?.response?.status;
      if (retry && status === 401) {
        refreshing ??= refreshTokens().finally(() => {
          refreshing = null;
        });
        await refreshing;
        return api<T>(path, { ...options, retry: false });
      }
      throw error;
    }
  }

  async function restore() {
    if (!import.meta.client) return;
    if (!tokens.value) {
      const raw = localStorage.getItem(TOKENS_KEY);
      if (raw) {
        try {
          tokens.value = JSON.parse(raw) as AdminTokens;
        } catch {
          localStorage.removeItem(TOKENS_KEY);
        }
      }
    }

    if (tokens.value?.refreshToken) {
      try {
        const profile = await api<AdminProfile>('/auth/me');
        if (profile.role !== 'ADMIN') throw new Error('not-admin');
        user.value = profile;
      } catch {
        clearSession();
      }
    }

    ready.value = true;
  }

  async function requestOtp(phone: string) {
    const normalized = normalizeAdminPhone(phone);
    const response = await $fetch<{ devCode?: string; expiresIn: number }>(
      `${base}/auth/request-otp`,
      { method: 'POST', body: { phone: normalized } },
    );
    return { phone: normalized, devCode: response.devCode ?? '' };
  }

  async function login(phone: string, code: string) {
    const normalized = normalizeAdminPhone(phone);
    const response = await $fetch<AdminTokens & { user: AdminProfile }>(`${base}/auth/verify-otp`, {
      method: 'POST',
      body: { phone: normalized, code },
    });

    if (response.user.role !== 'ADMIN') {
      throw new Error('not-admin');
    }

    const { user: profile, ...session } = response;
    tokens.value = session;
    user.value = profile;
    persist();
    return profile;
  }

  async function logout() {
    const refreshToken = tokens.value?.refreshToken;
    clearSession();
    if (refreshToken) {
      try {
        await $fetch(`${base}/auth/logout`, { method: 'POST', body: { refreshToken } });
      } catch {
        // Token is already removed locally; server-side revocation is best-effort.
      }
    }
  }

  return {
    user,
    tokens,
    ready,
    loggedIn,
    api,
    restore,
    requestOtp,
    login,
    logout,
    clearSession,
    extractError,
  };
}
