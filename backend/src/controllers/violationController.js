import LandViolation from '../models/LandViolation.js';
import { logAction } from '../middleware/auditLogger.js';
import { notifyRoles } from '../services/notify.js';
import { generateViolationPdf } from '../services/violationPdf.js';
import { ROLES, VIOLATION_STATUS } from '../constants.js';

export async function listViolations(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.module) filter.module = req.query.module;
  if (req.query.districtId) filter.districtId = req.query.districtId;
  const records = await LandViolation.find(filter)
    .populate('inspectorId', 'name')
    .populate('districtId')
    .sort({ detectedDate: -1 });
  res.json(records);
}

export async function createViolation(req, res) {
  const { module, inspectionId, address, lat, lng, areaM2, districtId, detectedDate, description } = req.body;
  const files = (req.files ?? []).map((f) => `/uploads/inspections/${f.filename}`);

  const record = await LandViolation.create({
    module,
    inspectionId: inspectionId || null,
    address,
    location: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null },
    areaM2: areaM2 ? Number(areaM2) : null,
    districtId: districtId || null,
    detectedDate,
    description,
    files,
    inspectorId: req.user.id,
    status: VIOLATION_STATUS.ANIQLANGAN,
  });

  await logAction({ req, action: 'create', entity: 'LandViolation', entityId: record._id });
  await notifyRoles({
    roles: [ROLES.SUPER_ADMIN, ROLES.KADASTR, ROLES.SOLIQ],
    message: `Yangi noqonuniy yer foydalanish holati aniqlandi: ${address}`,
    type: 'warning',
  });

  res.status(201).json(record);
}

export async function updateViolationStatus(req, res) {
  const { status, resolutionNote } = req.body;
  const record = await LandViolation.findById(req.params.id);
  if (!record) {
    return res.status(404).json({ message: 'Holat topilmadi' });
  }

  record.status = status;
  record.resolutionNote = resolutionNote ?? record.resolutionNote;
  record.resolvedAt = status === VIOLATION_STATUS.BARTARAF_ETILGAN ? new Date() : null;
  await record.save();

  await logAction({ req, action: 'updateStatus', entity: 'LandViolation', entityId: record._id, diff: { status } });
  await notifyRoles({
    roles: [ROLES.SUPER_ADMIN],
    message: `Noqonuniy yer foydalanish holati o'zgardi (${record.address}): ${status}`,
    type: 'info',
  });

  res.json(record);
}

export async function violationAct(req, res) {
  const record = await LandViolation.findById(req.params.id).populate('inspectorId', 'name');
  if (!record) {
    return res.status(404).json({ message: 'Holat topilmadi' });
  }
  const filePath = await generateViolationPdf(record);
  res.download(filePath, `dalolatnoma-${record._id}.pdf`);
}
