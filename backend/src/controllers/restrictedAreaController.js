import RestrictedArea from '../models/RestrictedArea.js';
import { logAction } from '../middleware/auditLogger.js';

export async function listRestrictedAreas(req, res) {
  const areas = await RestrictedArea.find().sort({ createdAt: -1 });
  res.json(areas);
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
