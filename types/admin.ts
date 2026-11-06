export type CargoStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export type UserRole = 'CARGO_OWNER' | 'DRIVER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED';

export type VehicleStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';

export type VehicleType =
  | 'TENT'
  | 'FLATBED'
  | 'REFRIGERATED'
  | 'TIPPER'
  | 'TANKER'
  | 'VAN'
  | 'ISOTHERMAL'
  | 'CONTAINER'
  | 'CAR_CARRIER'
  | 'CRANE';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type DocumentType = 'TECH_PASSPORT' | 'INSURANCE' | 'TECH_INSPECTION' | 'PERMIT';

export interface AdminVehicle {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  vehicleLabel: string;
  capacityKg: number;
  bodyVolumeM3: number | null;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
  driver: {
    id: string;
    phone: string;
    fullName: string | null;
    rating: number;
    ratingCount: number;
  };
}

export interface AdminDocument {
  id: string;
  vehicleId: string;
  type: DocumentType;
  typeLabel: string;
  status: DocumentStatus;
  originalName: string;
  fileMime: string;
  fileSize: number;
  note: string | null;
  fileUrl: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedBy: { id: string; fullName: string | null } | null;
  vehicle: {
    id: string;
    plateNumber: string;
    vehicleType: VehicleType;
    vehicleLabel: string;
    status: VehicleStatus;
    driver: { id: string; phone: string; fullName: string | null };
  };
}

export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
  refreshTokenExpiresAt?: string;
}

export interface AdminProfile {
  id: string;
  phone: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  companyName?: string | null;
  language?: string;
  rating?: number;
  ratingCount?: number;
  lastLoginAt?: string | null;
}

export interface AdminCargo {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  cargoType: string;
  weightKg: number;
  volumeM3?: number | null;
  vehicleType: string;
  vehicleLabel?: string;
  price: number;
  currency?: string;
  priceNegotiable?: boolean;
  status: CargoStatus;
  pickup: { city: string; address?: string | null; lat?: number | null; lng?: number | null };
  dropoff: { city: string; address?: string | null; lat?: number | null; lng?: number | null };
  pickupDate: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
  viewCount?: number;
  offerCount?: number;
  images?: { id: string; url: string; alt?: string | null }[];
  owner: {
    id: string;
    name: string;
    phone?: string;
    companyName?: string | null;
    rating?: number;
    ratingCount?: number;
  };
  moderationNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRow {
  id: string;
  phone: string;
  fullName: string | null;
  companyName?: string | null;
  role: UserRole;
  status: UserStatus;
  rating: number;
  ratingCount: number;
  lastLoginAt?: string | null;
  createdAt: string;
  cargoCount: number;
  offerCount: number;
}

export interface AdminStats {
  users: { total: number; owners: number; drivers: number };
  cargos: { total: number; byStatus: Record<CargoStatus, number> };
  offers: { total: number };
  moderation: { pendingReview: number };
  generatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
}
