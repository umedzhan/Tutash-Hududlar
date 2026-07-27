import { STAGES, STAGE_STATUS_MAP, STAGE_ROLE_MAP, APPLICATION_STATUS } from '../constants.js';

export class WorkflowError extends Error {
  constructor(message) {
    super(message);
    this.status = 409;
  }
}

function pushHistory(application, status, { byUserId, comment = '' }) {
  application.history.push({ status, date: new Date(), byUserId, comment });
}

// Bosqichni yakunlab (tasdiqlangan holda) navbatdagi bosqichga o'tkazadi.
// Oxirgi (final) bosqich tasdiqlansa APPROVED holatiga o'tadi va { finalApproved: true } qaytaradi
// — bu holatda controller shartnomani avtomatik generatsiya qilishi kerak.
function advanceStage(application, { byUserId, comment = '' }) {
  const idx = STAGES.indexOf(application.currentStage);
  if (idx === STAGES.length - 1) {
    application.status = APPLICATION_STATUS.APPROVED;
    application.currentStage = null;
    pushHistory(application, APPLICATION_STATUS.APPROVED, { byUserId, comment });
    return { finalApproved: true };
  }
  const nextStage = STAGES[idx + 1];
  application.currentStage = nextStage;
  application.status = STAGE_STATUS_MAP[nextStage];
  const nextRecord = application.stages.find((s) => s.stage === nextStage);
  if (nextRecord) {
    nextRecord.status = 'in_review';
  }
  pushHistory(application, application.status, { byUserId, comment });
  return { finalApproved: false };
}

// Bitta bosqich bo'yicha admin qarori: approve / approve_with_changes / reject / request_info.
// geometryVersion — approve_with_changes uchun tayyor {geometry, areaM2} (validatsiyadan o'tgan holda).
export function decideStage(application, { stage, decision, note = '', geometryVersion = null, byUserId }) {
  if (application.currentStage !== stage) {
    throw new WorkflowError(`Ariza hozir "${stage}" bosqichida emas`);
  }
  if (application.status !== STAGE_STATUS_MAP[stage]) {
    throw new WorkflowError(`Ariza holati bu qarorni qabul qilishga mos emas: ${application.status}`);
  }

  const stageRecord = application.stages.find((s) => s.stage === stage);
  if (!stageRecord) {
    throw new WorkflowError('Bosqich yozuvi topilmadi');
  }

  if (decision === 'approve') {
    stageRecord.status = 'approved';
    stageRecord.resolutionNote = note;
    stageRecord.decidedBy = byUserId;
    stageRecord.decidedAt = new Date();
    return advanceStage(application, { byUserId, comment: note });
  }

  if (decision === 'approve_with_changes') {
    if (!geometryVersion) {
      throw new WorkflowError("Tuzatish bilan tasdiqlash uchun yangi chizma kerak");
    }
    stageRecord.status = 'approved_with_changes';
    stageRecord.resolutionNote = note;
    stageRecord.decidedBy = byUserId;
    stageRecord.decidedAt = new Date();

    application.geometryVersions.push({
      version: application.geometryVersions.length + 1,
      geometry: geometryVersion.geometry,
      areaM2: geometryVersion.areaM2,
      authorType: 'admin',
      authorId: byUserId,
      changeNote: note,
      acceptedByBusiness: null,
      createdAt: new Date(),
    });
    application.status = APPLICATION_STATUS.AWAITING_CONSENT;
    pushHistory(application, APPLICATION_STATUS.AWAITING_CONSENT, { byUserId, comment: note });
    return { finalApproved: false };
  }

  if (decision === 'reject') {
    if (!note) {
      throw new WorkflowError('Rad etish sababi majburiy');
    }
    stageRecord.status = 'rejected';
    stageRecord.resolutionNote = note;
    stageRecord.decidedBy = byUserId;
    stageRecord.decidedAt = new Date();
    application.status = APPLICATION_STATUS.REJECTED;
    application.currentStage = null;
    pushHistory(application, APPLICATION_STATUS.REJECTED, { byUserId, comment: note });
    return { finalApproved: false };
  }

  if (decision === 'request_info') {
    if (!note) {
      throw new WorkflowError("Ma'lumot so'rash sababi majburiy");
    }
    stageRecord.status = 'info_requested';
    stageRecord.resolutionNote = note;
    stageRecord.decidedBy = byUserId;
    stageRecord.decidedAt = new Date();
    application.status = APPLICATION_STATUS.INFO_REQUESTED;
    pushHistory(application, APPLICATION_STATUS.INFO_REQUESTED, { byUserId, comment: note });
    return { finalApproved: false };
  }

  throw new WorkflowError(`Noma'lum qaror: ${decision}`);
}

// Tadbirkor admin tuzatgan chizmaga rozilik bildiradi yoki e'tiroz qiladi.
export function geometryConsent(application, { accept, note = '', byUserId }) {
  if (application.status !== APPLICATION_STATUS.AWAITING_CONSENT) {
    throw new WorkflowError('Ariza hozir rozilik kutmayapti');
  }
  const lastVersion = application.geometryVersions[application.geometryVersions.length - 1];
  if (!lastVersion) {
    throw new WorkflowError('Chizma versiyasi topilmadi');
  }

  if (accept) {
    lastVersion.acceptedByBusiness = true;
    application.geometry = lastVersion.geometry;
    application.areaM2 = lastVersion.areaM2;
    pushHistory(application, APPLICATION_STATUS.AWAITING_CONSENT, { byUserId, comment: `Rozilik berildi: ${note}` });
    return advanceStage(application, { byUserId, comment: 'Tadbirkor tuzatilgan chizmaga rozi bo\'ldi' });
  }

  lastVersion.acceptedByBusiness = false;
  const stageRecord = application.stages.find((s) => s.stage === application.currentStage);
  if (stageRecord) {
    stageRecord.status = 'in_review';
  }
  application.status = STAGE_STATUS_MAP[application.currentStage];
  pushHistory(application, application.status, { byUserId, comment: `E'tiroz bildirildi: ${note}` });
  return { finalApproved: false };
}

// Tadbirkor so'ralgan ma'lumotni taqdim etgach, so'ragan bosqichga qaytadi.
export function resumeAfterInfo(application, { byUserId, comment = '' }) {
  if (application.status !== APPLICATION_STATUS.INFO_REQUESTED) {
    throw new WorkflowError("Ariza ma'lumot kutmayapti");
  }
  const stageRecord = application.stages.find((s) => s.stage === application.currentStage);
  if (stageRecord) {
    stageRecord.status = 'in_review';
  }
  application.status = STAGE_STATUS_MAP[application.currentStage];
  pushHistory(application, application.status, { byUserId, comment: comment || "Tadbirkor ma'lumot taqdim etdi" });
  return { finalApproved: false };
}

export function initStages(byRole = STAGE_ROLE_MAP) {
  return STAGES.map((stage, idx) => ({
    stage,
    assigneeRole: byRole[stage],
    status: idx === 0 ? 'in_review' : 'pending',
    resolutionNote: '',
    decidedBy: null,
    decidedAt: null,
  }));
}
