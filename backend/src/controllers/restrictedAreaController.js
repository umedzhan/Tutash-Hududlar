import RestrictedArea from '../models/RestrictedArea.js';
import { logAction } from '../middleware/auditLogger.js';
import { buildExcelBuffer, sendExcel, exportFilename } from '../services/exportExcel.js';

const TYPE_LABEL = {
  red_line: 'Qizil chiziq',
  road: "Yo'l zonasi",
  utility: 'Muhandislik tarmoqlari',
  sanitation: 'Sanitariya-himoya zonasi',
  ecological: 'Ekologik zona',
  historical: 'Tarixiy-madaniy zona',
};

export async function listRestrictedAreas(req, res) {
  const areas = await RestrictedArea.find().sort({ createdAt: -1 });
  res.json(areas);
}

export async function exportRestrictedAreasExcel(req, res) {
  const areas = await RestrictedArea.find().sort({ createdAt: -1 });

  const buffer = await buildExcelBuffer({
    sheetName: 'Muhofaza zonalari',
    columns: [
      { header: 'Nomi', key: 'name', width: 28 },
      { header: 'Turi', key: 'type', width: 26 },
      { header: "Qo'shilgan sana", key: 'date', width: 16 },
    ],
    rows: areas.map((a) => ({
      name: a.name || '-',
      type: TYPE_LABEL[a.type] ?? a.type,
      date: a.createdAt.toLocaleDateString('uz-UZ'),
    })),
  });

  const filename = exportFilename('arxitektura', 'muhofaza_zonalari', 'xlsx');
  await logAction({ req, action: 'export', entity: 'RestrictedArea', entityId: null, diff: { format: 'xlsx', count: areas.length } });
  sendExcel(res, buffer, filename);
}

export async function createRestrictedArea(req, res) {
  const { type, name, geometry } = req.body;
  const area = await RestrictedArea.create({ type, name, geometry, createdBy: req.user.id });
  await logAction({ req, action: 'create', entity: 'RestrictedArea', entityId: area._id });
  res.status(201).json(area);
}

export async function deleteRestrictedArea(req, res) {
  const area = await RestrictedArea.findByIdAndDelete(req.params.id);
  if (!area) {
    return res.status(404).json({ message: 'Muhofaza zonasi topilmadi' });
  }
  await logAction({ req, action: 'delete', entity: 'RestrictedArea', entityId: area._id });
  res.status(204).end();
}
