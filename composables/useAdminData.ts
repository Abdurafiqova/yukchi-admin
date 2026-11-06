import type {
  AdminCargo,
  AdminStats,
  AdminUserRow,
  CargoStatus,
  Paginated,
  UserStatus,
} from '~/types/admin';

export type QueueFilter = 'all' | 'Pending' | 'Approved' | 'Rejected';

export interface QueueRow {
  id: string;
  cargoId: string;
  owner: string;
  initials: string;
  phone: string;
  route: string;
  cargo: string;
  date: string;
  time: string;
  status: CargoStatus;
  rejectionReason?: string;
}

const FILTER_STATUS: Record<Exclude<QueueFilter, 'all'>, CargoStatus> = {
  Pending: 'PENDING_REVIEW',
  Approved: 'PUBLISHED',
  Rejected: 'REJECTED',
};

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '—'
  );
}

function prettyPhone(phone?: string) {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone;
}

export function useAdminData() {
  const { api, extractError } = useAdminSession();
  const { t, formatDate, formatTime } = useI18n();
  const { showToast } = useToast();

  const cargos = useState<AdminCargo[]>('admin-cargos', () => []);
  const users = useState<AdminUserRow[]>('admin-users', () => []);
  const stats = useState<AdminStats | null>('admin-stats', () => null);
  const totalUsers = useState<number>('admin-users-total', () => 0);
  const totalCargos = useState<number>('admin-cargos-total', () => 0);
  const loading = useState<boolean>('admin-loading', () => false);
  const loaded = useState<boolean>('admin-loaded', () => false);
  const error = useState<string>('admin-error', () => '');
  const query = useState<string>('yukchi-admin-query', () => '');
  const queueFilter = useState<QueueFilter>('yukchi-admin-filter', () => 'all');

  const counts = computed(() => ({
    all: stats.value?.cargos.total ?? totalCargos.value,
    Pending: stats.value?.cargos.byStatus.PENDING_REVIEW ?? 0,
    Approved: stats.value?.cargos.byStatus.PUBLISHED ?? 0,
    Rejected: stats.value?.cargos.byStatus.REJECTED ?? 0,
  }));

  const filteredQueue = computed<QueueRow[]>(() => {
    const q = query.value.trim().toLowerCase();
    return cargos.value
      .filter((cargo) => {
        if (queueFilter.value !== 'all' && cargo.status !== FILTER_STATUS[queueFilter.value]) {
          return false;
        }
        if (!q) return true;
        return [
          cargo.code,
          cargo.title,
          cargo.owner.name,
          cargo.pickup.city,
          cargo.dropoff.city,
          cargo.status,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);
      })
      .map((cargo) => ({
        id: cargo.code,
        cargoId: cargo.id,
        owner: cargo.owner.name,
        initials: initialsOf(cargo.owner.name),
        phone: prettyPhone(cargo.owner.phone),
        route: `${cargo.pickup.city} → ${cargo.dropoff.city}`,
        cargo: cargo.title,
        date: formatDate(cargo.createdAt),
        time: formatTime(cargo.createdAt),
        status: cargo.status,
        rejectionReason: cargo.moderationNote ?? undefined,
      }));
  });

  const filteredUsers = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return users.value;
    return users.value.filter((user) =>
      [user.fullName, user.companyName, user.phone, user.role, user.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  });

  async function refreshStats() {
    try {
      stats.value = await api<AdminStats>('/admin/stats');
    } catch {
      // Counts fall back to the loaded lists.
    }
  }

  async function load(force = false) {
    if (loading.value) return;
    if (loaded.value && !force) return;

    loading.value = true;
    error.value = '';
    try {
      const [statsResult, cargosResult, usersResult] = await Promise.all([
        api<AdminStats>('/admin/stats'),
        api<Paginated<AdminCargo>>('/admin/cargos', { query: { status: 'ALL', limit: 50 } }),
        api<Paginated<AdminUserRow>>('/admin/users', { query: { limit: 50 } }),
      ]);
      stats.value = statsResult;
      cargos.value = cargosResult.items;
      totalCargos.value = cargosResult.total;
      users.value = usersResult.items;
      totalUsers.value = usersResult.total;
      loaded.value = true;
    } catch (err) {
      error.value = extractError(err, t('queue.loadError'));
    } finally {
      loading.value = false;
    }
  }

  async function approveCargo(id: string) {
    const cargo = cargos.value.find((item) => item.code === id);
    if (!cargo || cargo.status === 'PUBLISHED') return;
    try {
      const updated = await api<AdminCargo>(`/admin/cargos/${cargo.id}/approve`, {
        method: 'POST',
        body: {},
      });
      cargo.status = updated.status;
      showToast(t('toast.approved', { id }));
      await refreshStats();
    } catch (err) {
      showToast(extractError(err, t('toast.error')));
    }
  }

  async function rejectCargo(id: string, reason: string) {
    const cargo = cargos.value.find((item) => item.code === id);
    if (!cargo) return;
    try {
      const updated = await api<AdminCargo>(`/admin/cargos/${cargo.id}/reject`, {
        method: 'POST',
        body: { note: reason },
      });
      cargo.status = updated.status;
      cargo.moderationNote = updated.moderationNote;
      showToast(t('toast.rejected', { id }));
      await refreshStats();
    } catch (err) {
      showToast(extractError(err, t('toast.error')));
    }
  }

  async function setUserStatus(user: AdminUserRow, status: UserStatus) {
    const previous = user.status;
    user.status = status;
    try {
      await api(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      const name = user.fullName || user.phone;
      showToast(
        status === 'BLOCKED'
          ? t('users.blocked', { name })
          : t('users.unblocked', { name }),
      );
    } catch (err) {
      user.status = previous;
      showToast(extractError(err, t('toast.error')));
    }
  }

  function clearFilters() {
    queueFilter.value = 'all';
    query.value = '';
  }

  return {
    cargos,
    queue: cargos,
    users,
    stats,
    query,
    queueFilter,
    counts,
    filteredQueue,
    filteredUsers,
    totalUsers,
    totalCargos,
    loading,
    loaded,
    error,
    load,
    refreshStats,
    approveCargo,
    rejectCargo,
    setUserStatus,
    clearFilters,
  };
}
