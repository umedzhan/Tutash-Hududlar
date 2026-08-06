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
  cadastreNumber?: string;
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
  districtId: string | null;
  zoneId: string | null;
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
  cadastreNumber: string;
  geometry: { type: 'Polygon'; coordinates: number[][][] } | null;
  areaM2: number | null;
  photos: { shimol: string; janub: string; sharq: string; gharb: string };
  geometryVersions: GeometryVersion[];
  currentStage: Stage | null;
  stages: ApplicationStageRecord[];
  priceSnapshot: PriceBreakdown | null;
  status: ApplicationStatus;
  history: ApplicationHistoryEntry[];
  locationSchemeFile: string | null;
  designCodeFile: string | null;
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
    zaxirada: number;
    bandPercent: number;
    boshPercent: number;
    muammoliPercent: number;
  };
  applicationStats: {
    total: number;
    approved: number;
    rejected: number;
    inReview: number;
  };
  recentApplications: Application[];
  paymentStats: { kutilayotgan: number; undirilgan: number; qarzdorlik: number };
  expiringSoon30: number;
}

export interface DashboardFilter {
  districtId?: string;
  zoneId?: string;
}

export interface ApplicationFunnelResult {
  total: number;
  statusCounts: Record<ApplicationStatus, number>;
  avgStageDurationDays: Record<Stage, number | null>;
}

export interface PaymentTrendPoint {
  month: string;
  kutilmoqda: number;
  to_langan: number;
  qarzdor: number;
}

export interface TopDebtor {
  contractId: string;
  contractNumber: string;
  companyName: string;
  regionAddress: string;
  debt: number;
  daysOverdue: number;
}

export interface PaymentTrendResult {
  monthlyTrend: PaymentTrendPoint[];
  topDebtors: TopDebtor[];
}

export interface ExpiringContract {
  _id: string;
  contractNumber: string;
  company: Company;
  region: Region | null;
  district: District | null;
  zone: Zone | null;
  periodTo: string;
  daysLeft: number;
  group: '30' | '60' | '90';
  debt: number;
}

export interface DistrictRankingRow {
  districtId: string;
  districtName: string;
  applicationCount: number;
  avgDurationDays: number | null;
}

export interface ZoneRankingRow {
  zoneId: string;
  zoneName: string;
  districtName: string;
  total: number;
  band: number;
  bandPercent: number;
}

export interface DistrictRankingResult {
  districts: DistrictRankingRow[];
  zones: ZoneRankingRow[];
}

export type InspectionModule = 'kadastr' | 'soliq';
export type ViolationStatus = 'aniqlangan' | 'tekshirilmoqda' | 'bartaraf_etilgan';
export type RestrictedAreaType = 'red_line' | 'road' | 'utility' | 'sanitation' | 'ecological' | 'historical';

export interface GeoPoint {
  lat: number | null;
  lng: number | null;
}

export interface InspectionResult {
  _id: string;
  module: InspectionModule;
  inspectionDate: string;
  inspectorId: { _id: string; name: string } | string;
  address: string;
  location: GeoPoint;
  areaM2: number | null;
  districtId: District | string | null;
  description: string;
  files: string[];
  createdAt: string;
}

export interface LandViolation {
  _id: string;
  module: InspectionModule;
  inspectionId: string | null;
  address: string;
  location: GeoPoint;
  areaM2: number | null;
  districtId: District | string | null;
  detectedDate: string;
  status: ViolationStatus;
  description: string;
  files: string[];
  inspectorId: { _id: string; name: string } | string;
  resolutionNote: string;
  resolvedAt: string | null;
  createdAt: string;
}

export interface RestrictedArea {
  _id: string;
  type: RestrictedAreaType;
  name: string;
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  createdAt: string;
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
