import type {
  ApplicationStatus,
  ContractStatus,
  PaymentStatus,
  RegionStatus,
  ViolationStatus,
} from '../types';

/** Yangi admin dizayn tizimidagi badge/stat rang belgilari (t-blue, t-green, ...). */
export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'cyan';

/** Tone -> admin-theme.css'dagi CSS o'zgaruvchisi nomi (masalan var(--green)). */
export const TONE_VAR: Record<Tone, string> = {
  blue: 'primary',
  green: 'green',
  amber: 'amber',
  red: 'red',
  violet: 'violet',
  cyan: 'cyan',
};

export const APPLICATION_STATUS_TONE: Record<ApplicationStatus, Tone> = {
  DRAFT: 'blue',
  IN_REVIEW_CADASTRE: 'blue',
  IN_REVIEW_ARCHITECTURE: 'blue',
  IN_REVIEW_TAX: 'blue',
  FINAL_APPROVAL: 'amber',
  AWAITING_CONSENT: 'violet',
  INFO_REQUESTED: 'amber',
  APPROVED: 'green',
  CONTRACT_GENERATED: 'violet',
  SIGNED: 'green',
  ACTIVE: 'green',
  REJECTED: 'red',
  WITHDRAWN: 'blue',
};

export const CONTRACT_STATUS_TONE: Record<ContractStatus, Tone> = {
  faol: 'green',
  tugagan: 'blue',
  bekor_qilingan: 'red',
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  kutilmoqda: 'amber',
  to_langan: 'green',
  qarzdor: 'red',
};

export const VIOLATION_STATUS_TONE: Record<ViolationStatus, Tone> = {
  aniqlangan: 'red',
  tekshirilmoqda: 'amber',
  bartaraf_etilgan: 'green',
};

export const REGION_STATUS_TONE: Record<RegionStatus, Tone> = {
  band: 'green',
  bosh: 'amber',
  muammoli: 'red',
  avtoturargoh: 'blue',
  zaxirada: 'violet',
};
