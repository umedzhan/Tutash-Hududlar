import type {
  ApplicationStatus,
  ContractStatus,
  PaymentStatus,
  RegionStatus,
  RestrictedAreaType,
  Stage,
  ViolationStatus,
} from '../types';

export const REGION_STATUS_LABEL: Record<RegionStatus, string> = {
  band: 'Band',
  bosh: "Bo'sh",
  muammoli: 'Muammoli',
  avtoturargoh: 'Avtoturargoh',
  zaxirada: 'Zaxirada',
};

export const REGION_STATUS_COLOR: Record<RegionStatus, string> = {
  band: '#16a34a',
  bosh: '#eab308',
  muammoli: '#dc2626',
  avtoturargoh: '#2563eb',
  zaxirada: '#a855f7',
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: 'Qoralama',
  IN_REVIEW_CADASTRE: 'Kadastr ko\'rib chiqmoqda',
  IN_REVIEW_ARCHITECTURE: 'Arxitektura ko\'rib chiqmoqda',
  IN_REVIEW_TAX: 'Soliq ko\'rib chiqmoqda',
  FINAL_APPROVAL: 'Yakuniy tasdiqda',
  AWAITING_CONSENT: 'Rozilik kutilmoqda',
  INFO_REQUESTED: "Ma'lumot so'ralgan",
  APPROVED: 'Tasdiqlangan',
  CONTRACT_GENERATED: 'Shartnoma tayyor',
  SIGNED: 'Imzolangan',
  ACTIVE: 'Faol',
  REJECTED: 'Rad etilgan',
  WITHDRAWN: 'Qaytarib olingan',
};

export const APPLICATION_STATUS_BADGE: Record<ApplicationStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  IN_REVIEW_CADASTRE: 'bg-blue-100 text-blue-700',
  IN_REVIEW_ARCHITECTURE: 'bg-blue-100 text-blue-700',
  IN_REVIEW_TAX: 'bg-blue-100 text-blue-700',
  FINAL_APPROVAL: 'bg-amber-100 text-amber-700',
  AWAITING_CONSENT: 'bg-amber-100 text-amber-700',
  INFO_REQUESTED: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-purple-100 text-purple-700',
  CONTRACT_GENERATED: 'bg-purple-100 text-purple-700',
  SIGNED: 'bg-emerald-100 text-emerald-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
};

export const STAGE_LABEL: Record<Stage, string> = {
  cadastre: 'Kadastr',
  architecture: 'Arxitektura',
  tax: 'Soliq',
  final: 'Yakuniy tasdiq',
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  faol: 'Faol',
  tugagan: 'Tugagan',
  bekor_qilingan: 'Bekor qilingan',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  kutilmoqda: 'Kutilmoqda',
  to_langan: "To'langan",
  qarzdor: 'Qarzdor',
};

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  kutilmoqda: 'bg-amber-100 text-amber-700',
  to_langan: 'bg-emerald-100 text-emerald-700',
  qarzdor: 'bg-red-100 text-red-700',
};

export const VIOLATION_STATUS_LABEL: Record<ViolationStatus, string> = {
  aniqlangan: 'Aniqlangan',
  tekshirilmoqda: 'Tekshirilmoqda',
  bartaraf_etilgan: 'Bartaraf etilgan',
};

export const VIOLATION_STATUS_BADGE: Record<ViolationStatus, string> = {
  aniqlangan: 'bg-red-100 text-red-700',
  tekshirilmoqda: 'bg-amber-100 text-amber-700',
  bartaraf_etilgan: 'bg-emerald-100 text-emerald-700',
};

export const RESTRICTED_AREA_TYPE_LABEL: Record<RestrictedAreaType, string> = {
  red_line: 'Qizil chiziq',
  road: "Yo'l zonasi",
  utility: 'Muhandislik tarmoqlari',
  sanitation: 'Sanitariya-himoya zonasi',
  ecological: 'Ekologik zona',
  historical: 'Tarixiy-madaniy zona',
};

export const INSPECTION_MODULE_LABEL: Record<'kadastr' | 'soliq', string> = {
  kadastr: 'Kadastr',
  soliq: 'Soliq',
};

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  KADASTR: 'Kadastr xodimi',
  ARXITEKTURA: 'Arxitektura xodimi',
  SOLIQ: 'Soliq xodimi',
  TADBIRKOR: 'Tadbirkor',
};
