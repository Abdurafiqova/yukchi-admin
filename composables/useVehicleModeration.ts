import type {
  AdminDocument,
  AdminVehicle,
  DocumentStatus,
  Paginated,
  VehicleStatus,
} from '~/types/admin';

export type VehicleFilter = VehicleStatus | 'all';
export type DocumentFilter = DocumentStatus | 'all';

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function useVehicleModeration() {
  const { api, tokens, extractError } = useAdminSession();
  const { t } = useI18n();
  const { showToast } = useToast();

  const vehicles = useState<AdminVehicle[]>('admin-vehicles', () => []);
  const documents = useState<AdminDocument[]>('admin-documents', () => []);
  const vehiclesLoaded = useState<boolean>('admin-vehicles-loaded', () => false);
  const documentsLoaded = useState<boolean>('admin-documents-loaded', () => false);
  const vehiclesLoading = useState<boolean>('admin-vehicles-loading', () => false);
  const documentsLoading = useState<boolean>('admin-documents-loading', () => false);
  const vehiclesError = useState<string>('admin-vehicles-error', () => '');
  const documentsError = useState<string>('admin-documents-error', () => '');
  const vehicleFilter = useState<VehicleFilter>('admin-vehicle-filter', () => 'all');
  const documentFilter = useState<DocumentFilter>('admin-document-filter', () => 'all');

  const vehicleCounts = computed(() => ({
    all: vehicles.value.length,
    PENDING: vehicles.value.filter((item) => item.status === 'PENDING').length,
    ACTIVE: vehicles.value.filter((item) => item.status === 'ACTIVE').length,
    BLOCKED: vehicles.value.filter((item) => item.status === 'BLOCKED').length,
  }));

  const documentCounts = computed(() => ({
    all: documents.value.length,
    PENDING: documents.value.filter((item) => item.status === 'PENDING').length,
    APPROVED: documents.value.filter((item) => item.status === 'APPROVED').length,
    REJECTED: documents.value.filter((item) => item.status === 'REJECTED').length,
  }));

  const filteredVehicles = computed(() =>
    vehicleFilter.value === 'all'
      ? vehicles.value
      : vehicles.value.filter((item) => item.status === vehicleFilter.value),
  );

  const filteredDocuments = computed(() =>
    documentFilter.value === 'all'
      ? documents.value
      : documents.value.filter((item) => item.status === documentFilter.value),
  );

  async function loadVehicles(force = false) {
    if (vehiclesLoading.value) return;
    if (vehiclesLoaded.value && !force) return;

    vehiclesLoading.value = true;
    vehiclesError.value = '';
    try {
      const result = await api<Paginated<AdminVehicle>>('/admin/vehicles', {
        query: { limit: 100 },
      });
      vehicles.value = result.items;
      vehiclesLoaded.value = true;
    } catch (err) {
      vehiclesError.value = extractError(err, t('queue.loadError'));
    } finally {
      vehiclesLoading.value = false;
    }
  }

  async function loadDocuments(force = false) {
    if (documentsLoading.value) return;
    if (documentsLoaded.value && !force) return;

    documentsLoading.value = true;
    documentsError.value = '';
    try {
      const result = await api<Paginated<AdminDocument>>('/admin/documents', {
        query: { limit: 100 },
      });
      documents.value = result.items;
      documentsLoaded.value = true;
    } catch (err) {
      documentsError.value = extractError(err, t('queue.loadError'));
    } finally {
      documentsLoading.value = false;
    }
  }

  async function approveVehicle(vehicle: AdminVehicle) {
    try {
      const updated = await api<AdminVehicle>(`/admin/vehicles/${vehicle.id}/approve`, {
        method: 'POST',
        body: {},
      });
      Object.assign(vehicle, updated);
      showToast(t('toast.vehicleApproved', { plate: vehicle.plateNumber }));
    } catch (err) {
      showToast(extractError(err, t('toast.error')));
    }
  }

  async function blockVehicle(vehicle: AdminVehicle) {
    try {
      const updated = await api<AdminVehicle>(`/admin/vehicles/${vehicle.id}/block`, {
        method: 'POST',
        body: {},
      });
      Object.assign(vehicle, updated);
      showToast(t('toast.vehicleBlocked', { plate: vehicle.plateNumber }));
    } catch (err) {
      showToast(extractError(err, t('toast.error')));
    }
  }

  async function reviewDocument(doc: AdminDocument, status: DocumentStatus, note?: string) {
    try {
      const updated = await api<AdminDocument>(`/admin/documents/${doc.id}/review`, {
        method: 'POST',
        body: { status, ...(note ? { note } : {}) },
      });
      const { vehicleStatus: _vehicleStatus, ...row } = updated as AdminDocument & {
        vehicleStatus?: VehicleStatus;
      };
      Object.assign(doc, row);
      const name = `${doc.originalName}`;
      showToast(
        status === 'APPROVED'
          ? t('toast.docApproved', { name })
          : t('toast.docRejected', { name }),
      );
      if (_vehicleStatus) {
        const vehicle = vehicles.value.find((item) => item.id === doc.vehicleId);
        if (vehicle) vehicle.status = _vehicleStatus;
      }
    } catch (err) {
      showToast(extractError(err, t('toast.error')));
    }
  }

  async function openDocumentFile(doc: AdminDocument) {
    if (!import.meta.client) return;
    const base = useRuntimeConfig().public.apiBase as string;
    const origin = base.replace(/\/api\/v1\/?$/, '');
    const viewer = window.open('', '_blank');
    try {
      const blob = await $fetch<Blob>(`${origin}${doc.fileUrl}`, {
        headers: { Authorization: `Bearer ${tokens.value?.accessToken ?? ''}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(blob);
      if (viewer) viewer.location.href = url;
      else window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      viewer?.close();
      showToast(extractError(err, t('toast.fileError')));
    }
  }

  return {
    vehicles,
    documents,
    filteredVehicles,
    filteredDocuments,
    vehicleCounts,
    documentCounts,
    vehicleFilter,
    documentFilter,
    vehiclesLoading,
    documentsLoading,
    vehiclesLoaded,
    documentsLoaded,
    vehiclesError,
    documentsError,
    loadVehicles,
    loadDocuments,
    approveVehicle,
    blockVehicle,
    reviewDocument,
    openDocumentFile,
    formatFileSize,
  };
}
