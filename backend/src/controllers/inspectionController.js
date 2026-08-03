import InspectionResult from '../models/InspectionResult.js';
import { logAction } from '../middleware/auditLogger.js';
import { notifyRoles } from '../services/notify.js';
import { ROLES } from '../constants.js';

export async function listInspections(req, res) {
  const filter = {};
  if (req.query.module) filter.module = req.query.module;
  if (req.query.districtId) filter.districtId = req.query.districtId;
  const records = await InspectionResult.find(filter)
    .populate('inspectorId', 'name')
    .populate('districtId')
    .sort({ inspectionDate: -1 });
  res.json(records);
}

export async function createInspection(req, res) {
  const { module, inspectionDate, address, lat, lng, areaM2, districtId, description } = req.body;
  const files = (req.files ?? []).map((f) => `/uploads/inspections/${f.filename}`);

  const record = await InspectionResult.create({
    module,
    inspectionDate,
    inspectorId: req.user.id,
    address,
    location: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null },
    areaM2: areaM2 ? Number(areaM2) : null,
    districtId: districtId || null,
    description,
    files,
  });

  await logAction({ req, action: 'create', entity: 'InspectionResult', entityId: record._id });
  await notifyRoles({
    roles: [ROLES.SUPER_ADMIN],
    message: `Yangi xatlov natijasi kiritildi: ${address}`,
    type: 'info',
  });

  res.status(201).json(record);
}
