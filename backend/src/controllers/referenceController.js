import District from '../models/District.js';
import Zone from '../models/Zone.js';
import Purpose from '../models/Purpose.js';
import Tariff from '../models/Tariff.js';

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

export async function currentTariff(req, res) {
  const tariff = await Tariff.findOne({ validFrom: { $lte: new Date() } }).sort({ validFrom: -1 });
  if (!tariff) {
    return res.status(404).json({ message: 'Amaldagi tarif topilmadi' });
  }
  res.json(tariff);
}
