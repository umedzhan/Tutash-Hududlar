import Application from '../models/Application.js';
import District from '../models/District.js';
import User from '../models/User.js';
import {
  decideStage as decideStageWorkflow,
  geometryConsent as geometryConsentWorkflow,
  resumeAfterInfo,
  initStages,
} from '../services/applicationWorkflow.js';
import { validateGeometry } from '../services/geoValidation.js';
import { calculatePrice } from '../services/pricing.js';
import { generateApplicationReceiptPdf } from '../services/applicationReceiptPdf.js';
import { sendTelegramMessage } from '../services/integrations/telegram.js';
import { autoGenerateContract } from './contractController.js';
import { logAction } from '../middleware/auditLogger.js';
import { ROLES, APPLICATION_STATUS, STAGES, STAGE_ROLE_MAP, STAGE_LABEL } from '../constants.js';
import { buildExcelBuffer, sendExcel, exportFilename as excelFilename } from '../services/exportExcel.js';
import { buildRecordWordBuffer, sendWord, exportFilename as wordFilename } from '../services/exportWord.js';

// Ariza egasi Telegram bot orqali ro'yxatdan o'tgan bo'lsa (telegramChatId bor), holat
// o'zgarganda unga botda xabar yuboradi. Aks holda hech narsa qilmaydi (sayt orqali
// ro'yxatdan o'tgan tadbirkorlar uchun bu shunchaki jim o'tkazib yuboriladi).
async function notifyApplicant(application, text, replyMarkup) {
  const applicant = await User.findById(application.applicantId).select('telegramChatId');
  if (!applicant?.telegramChatId) return;
  await sendTelegramMessage(applicant.telegramChatId, text, replyMarkup);
}

const APPLICATION_STATUS_LABEL_UZ = {
  DRAFT: 'Qoralama',
  IN_REVIEW_CADASTRE: "Kadastr ko'rib chiqmoqda",
  IN_REVIEW_ARCHITECTURE: "Arxitektura ko'rib chiqmoqda",
  IN_REVIEW_TAX: "Soliq ko'rib chiqmoqda",
  FINAL_APPROVAL: 'Yakuniy tasdiqda',
  AWAITING_CONSENT: 'Rozilik kutilmoqda',
  INFO_REQUESTED: "Ma'lumot so'ralgan",
  APPROVED: 'Tasdiqlangan',
  CONTRACT_GENERATED: 'Shartnoma tayyor',
  SIGNED: 'Imzolangan',
  ACTIVE: 'Faol',
  REJECTED: 'Rad etilgan',
  WITHDRAWN: "Qaytarib olingan",
};

async function nextApplicationNumber() {
  const count = await Application.countDocuments();
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `ARZ-${yy}${mm}-${String(count + 1).padStart(5, '0')}`;
}

function applicationFilterForUser(user) {
  if (user.role === ROLES.TADBIRKOR) {
    return { applicantId: user.id };
  }
  if ([ROLES.KADASTR, ROLES.ARXITEKTURA, ROLES.SOLIQ].includes(user.role)) {
    const stageForRole = STAGES.find((s) => STAGE_ROLE_MAP[s] === user.role);
    return { currentStage: stageForRole };
  }
  return {};
}

export async function listApplications(req, res) {
  const filter = applicationFilterForUser(req.user);
  const applications = await Application.find(filter)
    .populate('hududId')
    .populate('companyId')
    .populate('applicantId', 'name phone')
    .populate('districtId')
    .populate('zoneId')
    .populate('purposeId')
    .sort({ createdAt: -1 });
  res.json(applications);
}

export async function exportApplicationsExcel(req, res) {
  const filter = applicationFilterForUser(req.user);
  const applications = await Application.find(filter).populate('companyId').sort({ createdAt: -1 });

  const buffer = await buildExcelBuffer({
    sheetName: 'Arizalar',
    columns: [
      { header: 'Ariza raqami', key: 'num', width: 20 },
      { header: 'Kompaniya', key: 'company', width: 28 },
      { header: 'Manzil', key: 'address', width: 34 },
      { header: 'Maydon (m²)', key: 'area', width: 14 },
      { header: 'Holati', key: 'status', width: 24 },
      { header: 'Sana', key: 'date', width: 14 },
    ],
    rows: applications.map((a) => ({
      num: a.applicationNumber,
      company: a.companyId?.name ?? '',
      address: a.address,
      area: a.areaM2,
      status: APPLICATION_STATUS_LABEL_UZ[a.status] ?? a.status,
      date: a.createdAt.toLocaleDateString('uz-UZ'),
    })),
  });

  const filename = excelFilename('soliq', 'arizalar', 'xlsx');
  await logAction({ req, action: 'export', entity: 'Application', entityId: null, diff: { format: 'xlsx', count: applications.length } });
  sendExcel(res, buffer, filename);
}

export async function exportApplicationWord(req, res) {
  const application = await Application.findById(req.params.id).populate('companyId').populate('purposeId');
  if (!application) {
    return res.status(404).json({ message: 'Ariza topilmadi' });
  }

  const buffer = await buildRecordWordBuffer({
    title: 'ARIZA KARTOCHKASI',
    docNumber: application.applicationNumber,
    date: application.createdAt.toLocaleDateString('uz-UZ'),
    fields: [
      ['Kompaniya', application.companyId?.name],
      ['STIR', application.companyId?.stir],
      ['Manzil / hudud', application.address],
      ['Maqsad', application.purpose],
      ['Foydalanish turi', application.usageType],
      ['Maydon', `${application.areaM2} m²`],
      ['Davr', `${application.period.from.toLocaleDateString('uz-UZ')} — ${application.period.to.toLocaleDateString('uz-UZ')}`],
      ['Holati', APPLICATION_STATUS_LABEL_UZ[application.status] ?? application.status],
      ['Izoh', application.comment || '-'],
    ],
  });

  const filename = wordFilename('soliq', `ariza-${application.applicationNumber}`, 'docx');
  await logAction({ req, action: 'export', entity: 'Application', entityId: application._id, diff: { format: 'docx' } });
  sendWord(res, buffer, filename);
}

export async function getApplication(req, res) {
  const application = await Application.findById(req.params.id)
    .populate('hududId')
    .populate('companyId')
    .populate('applicantId', 'name phone')
    .populate('districtId')
    .populate('zoneId')
    .populate('purposeId');
  if (!application) {
    return res.status(404).json({ message: 'Ariza topilmadi' });
  }
  res.json(application);
}

// Chizish jarayonida (hali saqlamasdan) validatsiya + narx oldindan ko'rsatish
export async function previewApplication(req, res) {
  const { geometry, districtId, purposeId, zoneId, usageType, period } = req.body;
  const { areaM2 } = await validateGeometry({ geometry });
  const price = await calculatePrice({
    areaM2,
    districtId,
    purposeId,
    zoneId,
    usageType,
    dateFrom: period.from,
    dateTo: period.to,
  });
  res.json({ areaM2, price });
}

const PHOTO_SIDES = ['shimol', 'janub', 'sharq', 'gharb'];
const PHOTO_SIDE_LABEL = { shimol: 'shimol', janub: 'janub', sharq: 'sharq', gharb: "g'arb" };

export async function createApplication(req, res) {
  const { districtId, purposeId, zoneId, purpose, usageType, comment, cadastreNumber } = req.body;
  const geometry = req.body.geometry
    ? (typeof req.body.geometry === 'string' ? JSON.parse(req.body.geometry) : req.body.geometry)
    : undefined;
  const period = typeof req.body.period === 'string' ? JSON.parse(req.body.period) : req.body.period;

  const files = req.files || {};
  const photos = {};
  for (const side of PHOTO_SIDES) {
    const file = files[side]?.[0];
    if (!file) {
      return res.status(400).json({ message: `Hududning ${PHOTO_SIDE_LABEL[side]} tarafidan rasm yuklanmagan` });
    }
    photos[side] = `/uploads/applications/${file.filename}`;
  }

  // Telegram bot orqali yuborilgan arizada hudud chegarasi chizilmaydi (bot bunday
  // imkoniyatga ega emas) — bunday holatda kadastr raqami majburiy, u orqali
  // Kadastr xodimi keyinroq chegarani o'zi belgilab beradi (approve_with_changes oqimi).
  const hasGeometry = Boolean(geometry);
  if (!hasGeometry && !cadastreNumber) {
    return res.status(400).json({ message: 'Hudud chegarasi ko\'rsatilmagan holatda kadastr raqami majburiy' });
  }

  let areaM2;
  let priceSnapshot = null;
  if (hasGeometry) {
    ({ areaM2 } = await validateGeometry({ geometry }));
    priceSnapshot = await calculatePrice({
      areaM2,
      districtId,
      purposeId,
      zoneId,
      usageType,
      dateFrom: period.from,
      dateTo: period.to,
    });
  }
  const district = await District.findById(districtId);

  const applicationNumber = await nextApplicationNumber();
  const application = await Application.create({
    applicationNumber,
    applicantId: req.user.id,
    companyId: req.user.companyId,
    districtId,
    zoneId,
    purposeId,
    purpose,
    usageType,
    period,
    comment,
    cadastreNumber: cadastreNumber || '',
    address: hasGeometry
      ? `${district?.name ?? ''} — tadbirkor tomonidan chizilgan hudud`
      : `${district?.name ?? ''} — chegara kadastr tomonidan belgilanadi`,
    ...(hasGeometry ? { geometry, areaM2 } : {}),
    photos,
    geometryVersions: hasGeometry
      ? [
          {
            version: 1,
            geometry,
            areaM2,
            authorType: 'business',
            authorId: req.user.id,
            changeNote: '',
            acceptedByBusiness: true,
            createdAt: new Date(),
          },
        ]
      : [],
    currentStage: 'cadastre',
    stages: initStages(),
    priceSnapshot,
    status: APPLICATION_STATUS.IN_REVIEW_CADASTRE,
    history: [
      {
        status: APPLICATION_STATUS.IN_REVIEW_CADASTRE,
        date: new Date(),
        byUserId: req.user.id,
        comment: 'Ariza yuborildi',
      },
    ],
  });

  await logAction({ req, action: 'create', entity: 'Application', entityId: application._id });

  let receiptPdfPath;
  if (!hasGeometry) {
    const populated = await Application.findById(application._id)
      .populate('companyId')
      .populate('districtId')
      .populate('zoneId');
    receiptPdfPath = await generateApplicationReceiptPdf(populated);
  }

  res.status(201).json({ ...application.toObject(), receiptPdfPath });
}

export async function decideStageController(req, res) {
  const { stage } = req.params;
  const { decision, note, geometry } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: 'Ariza topilmadi' });
  }

  let geometryVersion = null;
  if (decision === 'approve_with_changes') {
    const { areaM2 } = await validateGeometry({ geometry, excludeApplicationId: application._id });
    geometryVersion = { geometry, areaM2 };
  }

  const result = decideStageWorkflow(application, {
    stage,
    decision,
    note,
    geometryVersion,
    byUserId: req.user.id,
  });
  await application.save();

  if (result.finalApproved) {
    await autoGenerateContract(application, req);
    await notifyApplicant(
      application,
      `✅ <b>${application.applicationNumber}</b> arizangiz to'liq tasdiqlandi va shartnoma tayyorlandi.\n\n` +
        `Shartnomani ko'rish va tasdiqlash uchun <b>ijara.soliq.uz</b> saytiga kirishingiz mumkin.`,
    );
  } else if (decision === 'approve') {
    const nextStage = application.currentStage;
    await notifyApplicant(
      application,
      `➡️ <b>${application.applicationNumber}</b> arizangiz "${STAGE_LABEL[stage]}" bosqichidan o'tdi, ` +
        `hozir "${STAGE_LABEL[nextStage]}" bosqichida ko'rib chiqilmoqda.`,
    );
  } else if (decision === 'approve_with_changes') {
    await notifyApplicant(
      application,
      `📐 <b>${application.applicationNumber}</b> arizangiz bo'yicha Kadastr xodimi hudud chegarasini belgiladi.\n\n` +
        (note ? `Izoh: ${note}\n\n` : '') +
        `Iltimos, chegara bilan tanishib, roziligingizni bildiring.`,
      {
        inline_keyboard: [[
          { text: '✅ Rozilik bildirish', callback_data: `geo_accept:${application._id}` },
          { text: '❌ E\'tiroz bildirish', callback_data: `geo_reject:${application._id}` },
        ]],
      },
    );
  } else if (decision === 'reject') {
    await notifyApplicant(
      application,
      `⛔ <b>${application.applicationNumber}</b> arizangiz rad etildi.\n\nSabab: ${note}`,
    );
  } else if (decision === 'request_info') {
    await notifyApplicant(
      application,
      `ℹ️ <b>${application.applicationNumber}</b> arizangiz bo'yicha qo'shimcha ma'lumot so'ralmoqda.\n\n` +
        `So'rov: ${note}`,
    );
  }

  await logAction({ req, action: 'decideStage', entity: 'Application', entityId: application._id, diff: { stage, decision } });
  res.json(application);
}

export async function geometryConsentController(req, res) {
  const { accept, note } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: 'Ariza topilmadi' });
  }
  if (String(application.applicantId) !== req.user.id) {
    return res.status(403).json({ message: 'Bu ariza sizga tegishli emas' });
  }

  // Telegram bot orqali (hudud chizmasi bo'lmagan holda) yuborilgan arizada narx faqat
  // shu bosqichda, Kadastr chizgan chegara asosida hisoblanadi (yaratilishda hisoblanmagan).
  if (accept && !application.priceSnapshot) {
    const lastVersion = application.geometryVersions[application.geometryVersions.length - 1];
    if (lastVersion) {
      application.priceSnapshot = await calculatePrice({
        areaM2: lastVersion.areaM2,
        districtId: application.districtId,
        purposeId: application.purposeId,
        zoneId: application.zoneId,
        usageType: application.usageType,
        dateFrom: application.period.from,
        dateTo: application.period.to,
      });
    }
  }

  const result = geometryConsentWorkflow(application, { accept, note, byUserId: req.user.id });
  await application.save();

  if (result.finalApproved) {
    await autoGenerateContract(application, req);
    await notifyApplicant(
      application,
      `✅ <b>${application.applicationNumber}</b> arizangiz to'liq tasdiqlandi va shartnoma tayyorlandi.\n\n` +
        `Shartnomani ko'rish va tasdiqlash uchun <b>ijara.soliq.uz</b> saytiga kirishingiz mumkin.`,
    );
  } else if (accept) {
    const nextStage = application.currentStage;
    await notifyApplicant(
      application,
      `✅ Rozilik qabul qilindi. <b>${application.applicationNumber}</b> arizangiz hozir ` +
        `"${STAGE_LABEL[nextStage]}" bosqichida ko'rib chiqilmoqda.`,
    );
  } else {
    await notifyApplicant(
      application,
      `❌ <b>${application.applicationNumber}</b> arizangiz bo'yicha e'tirozingiz qabul qilindi. ` +
        `Ariza qayta ko'rib chiqilmoqda.`,
    );
  }

  await logAction({ req, action: 'geometryConsent', entity: 'Application', entityId: application._id, diff: { accept } });
  res.json(application);
}

export async function uploadLocationSchemeController(req, res) {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: 'Ariza topilmadi' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Fayl yuklanmadi' });
  }
  application.locationSchemeFile = `/uploads/applications/${req.file.filename}`;
  await application.save();
  await logAction({ req, action: 'uploadLocationScheme', entity: 'Application', entityId: application._id });
  res.json(application);
}

export async function uploadDesignCodeController(req, res) {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: 'Ariza topilmadi' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Fayl yuklanmadi' });
  }
  application.designCodeFile = `/uploads/applications/${req.file.filename}`;
  await application.save();
  await logAction({ req, action: 'uploadDesignCode', entity: 'Application', entityId: application._id });
  res.json(application);
}

export async function provideInfoController(req, res) {
  const { comment } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) {
    return res.status(404).json({ message: 'Ariza topilmadi' });
  }
  if (String(application.applicantId) !== req.user.id) {
    return res.status(403).json({ message: 'Bu ariza sizga tegishli emas' });
  }

  resumeAfterInfo(application, { byUserId: req.user.id, comment });
  await application.save();

  await logAction({ req, action: 'provideInfo', entity: 'Application', entityId: application._id });
  res.json(application);
}
