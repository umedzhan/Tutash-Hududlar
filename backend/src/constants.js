export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  KADASTR: 'KADASTR',
  ARXITEKTURA: 'ARXITEKTURA',
  SOLIQ: 'SOLIQ',
  TADBIRKOR: 'TADBIRKOR',
};

export const REGION_STATUS = {
  BAND: 'band',
  BOSH: 'bosh',
  MUAMMOLI: 'muammoli',
  AVTOTURARGOH: 'avtoturargoh',
  ZAXIRADA: 'zaxirada',
};

export const APPLICATION_STATUS = {
  DRAFT: 'DRAFT',
  IN_REVIEW_CADASTRE: 'IN_REVIEW_CADASTRE',
  IN_REVIEW_ARCHITECTURE: 'IN_REVIEW_ARCHITECTURE',
  IN_REVIEW_TAX: 'IN_REVIEW_TAX',
  FINAL_APPROVAL: 'FINAL_APPROVAL',
  AWAITING_CONSENT: 'AWAITING_CONSENT',
  INFO_REQUESTED: 'INFO_REQUESTED',
  APPROVED: 'APPROVED',
  CONTRACT_GENERATED: 'CONTRACT_GENERATED',
  SIGNED: 'SIGNED',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

// Ariza ko'rib chiqish bosqichlari — ketma-ketligi shu tartibda
export const STAGES = ['cadastre', 'architecture', 'tax', 'final'];

export const STAGE_LABEL = {
  cadastre: 'Kadastr',
  architecture: 'Arxitektura',
  tax: 'Soliq',
  final: 'Yakuniy tasdiq',
};

// Bosqich -> shu bosqichni ko'rib chiqadigan rol
export const STAGE_ROLE_MAP = {
  cadastre: ROLES.KADASTR,
  architecture: ROLES.ARXITEKTURA,
  tax: ROLES.SOLIQ,
  final: ROLES.SUPER_ADMIN,
};

// Bosqich -> ariza shu bosqichda turganda qanday status ko'rsatiladi
export const STAGE_STATUS_MAP = {
  cadastre: APPLICATION_STATUS.IN_REVIEW_CADASTRE,
  architecture: APPLICATION_STATUS.IN_REVIEW_ARCHITECTURE,
  tax: APPLICATION_STATUS.IN_REVIEW_TAX,
  final: APPLICATION_STATUS.FINAL_APPROVAL,
};

export const CONTRACT_STATUS = {
  FAOL: 'faol',
  TUGAGAN: 'tugagan',
  BEKOR: 'bekor_qilingan',
};

export const PAYMENT_STATUS = {
  KUTILMOQDA: 'kutilmoqda',
  TOLANGAN: 'to_langan',
  QARZDOR: 'qarzdor',
};

export const PAYMENT_TYPE = {
  RENT: 'rent',
  EXPLOITATION: 'exploitation',
};

export const MONITORING_STATUS = {
  MUVOFIQ: 'qoidaga_muvofiq',
  BUZILGAN: 'buzilgan',
};

export const INSPECTION_MODULE = {
  KADASTR: 'kadastr',
  SOLIQ: 'soliq',
};

export const VIOLATION_STATUS = {
  ANIQLANGAN: 'aniqlangan',
  TEKSHIRILMOQDA: 'tekshirilmoqda',
  BARTARAF_ETILGAN: 'bartaraf_etilgan',
};

export const RESTRICTED_AREA_TYPE = {
  RED_LINE: 'red_line',
  ROAD: 'road',
  UTILITY: 'utility',
  SANITATION: 'sanitation',
  ECOLOGICAL: 'ecological',
  HISTORICAL: 'historical',
};
