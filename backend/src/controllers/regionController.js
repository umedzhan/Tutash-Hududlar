import Region from '../models/Region.js';
import Contract from '../models/Contract.js';
import { logAction } from '../middleware/auditLogger.js';

export async function listRegions(req, res) {
  const regions = await Region.find().sort({ createdAt: -1 });
  res.json(regions);
}

export async function getRegion(req, res) {
  const region = await Region.findById(req.params.id);
  if (!region) {
    return res.status(404).json({ message: 'Hudud topilmadi' });
  }
  res.json(region);
}

// Tadbirkorning o'ziga tegishli hududlari: faol shartnomasi bo'lgan hududlar
export async function listMyRegions(req, res) {
  const contracts = await Contract.find({ companyId: req.user.companyId, status: 'faol' }).select('hududId');
  const hududIds = contracts.map((c) => c.hududId);
  const regions = await Region.find({ _id: { $in: hududIds } });
  res.json(regions);
}

export async function createRegion(req, res) {
  const region = await Region.create(req.body);
  await logAction({ req, action: 'create', entity: 'Region', entityId: region._id });
  res.status(201).json(region);
}

export async function updateRegion(req, res) {
  const region = await Region.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!region) {
    return res.status(404).json({ message: 'Hudud topilmadi' });
  }
  await logAction({ req, action: 'update', entity: 'Region', entityId: region._id });
  res.json(region);
}

export async function regionStats(req, res) {
  const [jami, band, bosh, muammoli, zaxirada] = await Promise.all([
    Region.countDocuments(),
    Region.countDocuments({ status: 'band' }),
    Region.countDocuments({ status: 'bosh' }),
    Region.countDocuments({ status: 'muammoli' }),
    Region.countDocuments({ status: 'zaxirada' }),
  ]);
  res.json({ jami, band, bosh, muammoli, zaxirada });
}
