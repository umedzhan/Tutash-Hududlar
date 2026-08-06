import District from '../models/District.js';
import Zone from '../models/Zone.js';
import Purpose from '../models/Purpose.js';
import Tariff from '../models/Tariff.js';
import { logAction } from '../middleware/auditLogger.js';

export async function listDistricts(req, res) {
  res.json(await District.find().sort({ name: 1 }));
}

export async function listZones(req, res) {
  const filter = req.query.districtId ? { districtId: req.query.districtId } : {};
  res.json(await Zone.find(filter).sort({ name: 1 }));
}

export async function listPurposes(req, res) {
  res.json(await Purpose.find().sort({ name: 1 }));
}

const PURPOSE_FIELDS = ['name', 'coefficient', 'seasonalAllowed'];

export async function updatePurpose(req, res) {
  const purpose = await Purpose.findById(req.params.id);
  if (!purpose) {
    return res.status(404).json({ message: 'Maqsad topilmadi' });
  }
  for (const field of PURPOSE_FIELDS) {
    if (req.body[field] !== undefined) purpose[field] = req.body[field];
  }
  await purpose.save();
  await logAction({ req, action: 'update', entity: 'Purpose', entityId: purpose._id });
  res.json(purpose);
}

export async function currentTariff(req, res) {
  const tariff = await Tariff.findOne({ validFrom: { $lte: new Date() } }).sort({ validFrom: -1 });
  if (!tariff) {
    return res.status(404).json({ message: 'Amaldagi tarif topilmadi' });
  }
  res.json(tariff);
}

const TARIFF_FIELDS = ['baseRate', 'seasonalCoefficient', 'penaltyRatePerDay', 'penaltyCapPercent', 'minAreaM2', 'maxAreaM2'];

export async function updateTariff(req, res) {
  const tariff = await Tariff.findOne({ validFrom: { $lte: new Date() } }).sort({ validFrom: -1 });
  if (!tariff) {
    return res.status(404).json({ message: 'Amaldagi tarif topilmadi' });
  }
  for (const field of TARIFF_FIELDS) {
    if (req.body[field] !== undefined) tariff[field] = req.body[field];
  }
  await tariff.save();
  await logAction({ req, action: 'update', entity: 'Tariff', entityId: tariff._id });
  res.json(tariff);
}
