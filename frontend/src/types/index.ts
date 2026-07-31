export type Role = 'SUPER_ADMIN' | 'KADASTR' | 'ARXITEKTURA' | 'SOLIQ' | 'TADBIRKOR';

export type Stage = 'cadastre' | 'architecture' | 'tax' | 'final';

export type RegionStatus = 'band' | 'bosh' | 'muammoli' | 'avtoturargoh' | 'zaxirada';

export type ApplicationStatus =
  | 'DRAFT'
  | 'IN_REVIEW_CADASTRE'
  | 'IN_REVIEW_ARCHITECTURE'
  | 'IN_REVIEW_TAX'
  | 'FINAL_APPROVAL'
  | 'AWAITING_CONSENT'
  | 'INFO_REQUESTED'
  | 'APPROVED'
  | 'CONTRACT_GENERATED'
  | 'SIGNED'
  | 'ACTIVE'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ContractStatus = 'faol' | 'tugagan' | 'bekor_qilingan';

export type PaymentStatus = 'kutilmoqda' | 'to_langan' | 'qarzdor';

export interface Company {
  _id: string;
  name: string;
  stir: string;
  director: string;
  phones: string[];
  email?: string;
  districtId?: District | string | null;
  zoneId?: Zone | string | null;
  address?: string;
  registrationDocument?: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  companyId: string | null;
  phone: string;
}

export interface Region {
  _id: string;
  name: string;
  address: string;
  district: string;
  region: string;
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  areaM2: number;
  status: RegionStatus;
  currentContractId: string | null;
}

export interface District {
  _id: string;
  name: string;
  code: string;
  coefficient: number;
}

export interface Zone {
  _id: string;
  districtId: string;
  name: string;
  coefficient: number;
  geometry?: { type: 'Polygon'; coordinates: number[][][] };
}

export interface Purpose {
  _id: string;
  name: string;
  coefficient: number;
  seasonalAllowed: boolean;
}

export interface Tariff {
  _id: string;
  baseRate: number;
  seasonalCoefficient: number;
  penaltyRatePerDay: number;
  penaltyCapPercent: number;
  minAreaM2: number;
  maxAreaM2: number;
  validFrom: string;
  validTo: string | null;
}

export interface PriceBreakdown {
  annualRent: number;
  months: number;
  years: number;
  total: number;
  breakdown: {
    sbaza: number;
    m: number;
    ktuman: number;
    kzona: number;
    kmaqsad: number;
    kmavsum: number;
    zoneName?: string;
  };
  tariffId: string;
  calculatedAt: string;
}

export interface ApplicationHistoryEntry {
  status: ApplicationStatus;
  date: string;
  byUserId: string;
  comment: string;
}

export interface GeometryVersion {
  version: number;
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  areaM2: number;
  authorType: 'business' | 'admin';
  authorId: string;
  changeNote: string;
  acceptedByBusiness: boolean | null;
  createdAt: string;
}

export interface ApplicationStageRecord {
  stage: Stage;
  assigneeRole: Role;
  status: 'pending' | 'in_review' | 'approved' | 'approved_with_changes' | 'rejected' | 'info_requested';
  resolutionNote: string;
  decidedBy: string | null;
  decidedAt: string | null;
}

export interface Application {
  _id: string;
  applicationNumber: string;
  applicantId: { _id: string; name: string; phone: string } | string;
  companyId: Company | string;
  hududId: Region | string | null;
  districtId: District | string;
  zoneId: Zone | string;
  purposeId: Purpose | string;
  purpose: string;
  usageType: string;
  period: { from: string; to: string };
  comment: string;
  address: string;
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  areaM2: number;
  photos: { shimol: string; janub: string; sharq: string; gharb: string };
  geometryVersions: GeometryVersion[];
  currentStage: Stage | null;
  stages: ApplicationStageRecord[];
  priceSnapshot: PriceBreakdown | null;
  status: ApplicationStatus;
  history: ApplicationHistoryEntry[];
  createdAt: string;
}

export interface Contract {
  _id: string;
  contractNumber: string;
  applicationId: string;
  hududId: Region | string;
  companyId: Company | string;
  districtId: string | null;
  purposeId: string | null;
  geometry: { type: 'Polygon'; coordinates: number[][][] } | null;
  areaM2: number | null;
  priceSnapshot: PriceBreakdown | null;
  rentPayment: number;
  total: number;
  period: { from: string; to: string };
  status: ContractStatus;
  pdfPath: string | null;
  eSign: { signed: boolean; signedAt: string | null; mockSignatureId: string | null };
  createdAt: string;
}

export interface Payment {
  _id: string;
  contractId: Contract | string;
  type: 'rent' | 'exploitation';
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  method: 'click' | 'payme' | 'bank';
  transactionRef: string | null;
}

export interface MonitoringRecord {
  _id: string;
  hududId: Region | string;
  contractId: string;
  inspectionDate: string;
  status: 'qoidaga_muvofiq' | 'buzilgan';
  inspectorId: { _id: string; name: string } | string;
  notes: string;
}

export interface AppUser {
  _id: string;
  name: string;
  phone: string;
  role: Role;
  companyId: Company | null;
  status: string;
}

export interface DashboardSummary {
  regionStats: {
    jami: number;
    band: number;
    bosh: number;
    muammoli: number;
    bandPercent: number;
    boshPercent: number;
    muammoliPercent: number;
  };
  recentApplications: Application[];
  paymentStats: { kutilayotgan: number; undirilgan: number; qarzdorlik: number };
}

export interface MyDashboardSummary {
  jamiShartnomalar: number;
  faolShartnomalar: number;
  jamiTolovlar: number;
  qarzdorlik: number;
  aktivArizalar: number;
  nextPayment: Payment | null;
  contracts: Contract[];
  recentPayments: Payment[];
}
