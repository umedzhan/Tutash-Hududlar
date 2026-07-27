import Monitoring from '../models/Monitoring.js';
import { logAction } from '../middleware/auditLogger.js';

export async function listMonitoring(req, res) {
  const filter = {};
  if (req.query.hududId) filter.hududId = req.query.hududId;
  const records = await Monitoring.find(filter).populate('hududId').populate('inspectorId', 'name').sort({ inspectionDate: -1 });
  res.json(records);
}

export async function createMonitoring(req, res) {
  const record = await Monitoring.create({ ...req.body, inspectorId: req.user.id });
  await logAction({ req, action: 'create', entity: 'Monitoring', entityId: record._id });
  res.status(201).json(record);
}
