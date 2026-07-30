import Application from '../models/Application.js';
import District from '../models/District.js';
import {
  decideStage as decideStageWorkflow,
  geometryConsent as geometryConsentWorkflow,
  resumeAfterInfo,
  initStages,
} from '../services/applicationWorkflow.js';
import { validateGeometry } from '../services/geoValidation.js';
import { calculatePrice } from '../services/pricing.js';
import { autoGenerateContract } from './contractController.js';
import { logAction } from '../middleware/auditLogger.js';
import { ROLES, APPLICATION_STATUS, STAGES, STAGE_ROLE_MAP } from '../constants.js';

async function nextApplicationNumber() {
  const count = await Application.countDocuments();
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `ARZ-${yy}${mm}-${String(count + 1).padStart(5, '0')}`;
}

export async function listApplications(req, res) {
  let filter = {};
  if (req.user.role === ROLES.TADBIRKOR) {
    filter = { applicantId: req.user.id };
  } else if ([ROLES.KADASTR, ROLES.ARXITEKTURA, ROLES.SOLIQ].includes(req.user.role)) {
    const stageForRole = STAGES.find((s) => STAGE_ROLE_MAP[s] === req.user.role);
    filter = { currentStage: stageForRole };
  }
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
  const { districtId, purposeId, zoneId, purpose, usageType, comment } = req.body;
  const geometry = typeof req.body.geometry === 'string' ? JSON.parse(req.body.geometry) : req.body.geometry;
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

  const { areaM2 } = await validateGeometry({ geometry });
  const priceSnapshot = await calculatePrice({
    areaM2,
    districtId,
    purposeId,
    zoneId,
    usageType,
    dateFrom: period.from,
    dateTo: period.to,
  });
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
    address: `${district?.name ?? ''} — tadbirkor tomonidan chizilgan hudud`,
    geometry,
    areaM2,
    photos,
    geometryVersions: [
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
    ],
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
  res.status(201).json(application);
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

  const result = geometryConsentWorkflow(application, { accept, note, byUserId: req.user.id });
  await application.save();

  if (result.finalApproved) {
    await autoGenerateContract(application, req);
  }

  await logAction({ req, action: 'geometryConsent', entity: 'Application', entityId: application._id, diff: { accept } });
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
