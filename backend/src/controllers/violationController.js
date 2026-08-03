import LandViolation from '../models/LandViolation.js';
import { logAction } from '../middleware/auditLogger.js';
import { notifyRoles } from '../services/notify.js';
import { generateViolationPdf } from '../services/violationPdf.js';
import { ROLES, VIOLATION_STATUS } from '../constants.js';
import { buildExcelBuffer, sendExcel, exportFilename as excelFilename } from '../services/exportExcel.js';
import { buildRecordWordBuffer, sendWord, exportFilename as wordFilename } from '../services/exportWord.js';

const MODULE_LABEL = { kadastr: 'Kadastr', soliq: 'Soliq' };
const STATUS_LABEL = {
  aniqlangan: 'Aniqlangan',
  tekshirilmoqda: 'Tekshirilmoqda',
  bartaraf_etilgan: 'Bartaraf etilgan',
};

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

export async function exportViolationsExcel(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.module) filter.module = req.query.module;
  if (req.query.districtId) filter.districtId = req.query.districtId;
  const records = await LandViolation.find(filter).populate('inspectorId', 'name').sort({ detectedDate: -1 });

  const buffer = await buildExcelBuffer({
    sheetName: 'Noqonuniy foydalanish reestri',
    columns: [
      { header: 'Aniqlangan sana', key: 'date', width: 16 },
      { header: 'Modul', key: 'module', width: 14 },
      { header: 'Manzil', key: 'address', width: 34 },
      { header: 'Maydon (m²)', key: 'area', width: 14 },
      { header: 'Holati', key: 'status', width: 18 },
      { header: 'Mas\'ul xodim', key: 'inspector', width: 22 },
      { header: 'Tavsif', key: 'description', width: 40 },
    ],
    rows: records.map((v) => ({
      date: v.detectedDate.toLocaleDateString('uz-UZ'),
      module: MODULE_LABEL[v.module] ?? v.module,
      address: v.address,
      area: v.areaM2 ?? '',
      status: STATUS_LABEL[v.status] ?? v.status,
      inspector: v.inspectorId?.name ?? '',
      description: v.description,
    })),
  });

  const filename = excelFilename(req.query.module ?? 'umumiy', 'noqonuniy_foydalanish', 'xlsx');
  await logAction({ req, action: 'export', entity: 'LandViolation', entityId: null, diff: { format: 'xlsx', count: records.length } });
  sendExcel(res, buffer, filename);
}

export async function exportViolationWord(req, res) {
  const violation = await LandViolation.findById(req.params.id).populate('inspectorId', 'name');
  if (!violation) {
    return res.status(404).json({ message: 'Holat topilmadi' });
  }

  const buffer = await buildRecordWordBuffer({
    title: "NOQONUNIY YER FOYDALANISH HOLATI",
    docNumber: String(violation._id),
    date: violation.detectedDate.toLocaleDateString('uz-UZ'),
    fields: [
      ['Aniqlagan modul', MODULE_LABEL[violation.module] ?? violation.module],
      ['Manzil', violation.address],
      ['Maydon', violation.areaM2 ? `${violation.areaM2} m²` : "ko'rsatilmagan"],
      [
        'Koordinatalar',
        violation.location?.lat && violation.location?.lng
          ? `${violation.location.lat}, ${violation.location.lng}`
          : "ko'rsatilmagan",
      ],
      ['Holati', STATUS_LABEL[violation.status] ?? violation.status],
      ["Mas'ul xodim", violation.inspectorId?.name ?? '-'],
    ],
    note: violation.description ? `Tavsif: ${violation.description}` : undefined,
  });

  const filename = wordFilename(violation.module, `noqonuniy-foydalanish-${violation._id}`, 'docx');
  await logAction({ req, action: 'export', entity: 'LandViolation', entityId: violation._id, diff: { format: 'docx' } });
  sendWord(res, buffer, filename);
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
