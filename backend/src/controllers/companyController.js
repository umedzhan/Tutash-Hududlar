import Company from '../models/Company.js';
import { logAction } from '../middleware/auditLogger.js';

export async function listCompanies(req, res) {
  const companies = await Company.find().sort({ createdAt: -1 });
  res.json(companies);
}

export async function createCompany(req, res) {
  const company = await Company.create(req.body);
  await logAction({ req, action: 'create', entity: 'Company', entityId: company._id });
  res.status(201).json(company);
}

export async function getMyCompany(req, res) {
  if (!req.user.companyId) {
    return res.status(404).json({ message: "Sizga biriktirilgan kompaniya yo'q" });
  }
  const company = await Company.findById(req.user.companyId).populate('districtId').populate('zoneId');
  if (!company) {
    return res.status(404).json({ message: 'Kompaniya topilmadi' });
  }
  res.json(company);
}

export async function updateMyCompany(req, res) {
  if (!req.user.companyId) {
    return res.status(404).json({ message: "Sizga biriktirilgan kompaniya yo'q" });
  }

  const update = {};
  for (const key of ['name', 'stir', 'director', 'email', 'address', 'cadastreNumber']) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  if (req.body.districtId !== undefined) update.districtId = req.body.districtId || null;
  if (req.body.zoneId !== undefined) update.zoneId = req.body.zoneId || null;
  if (req.body.phones !== undefined) {
    const phones = Array.isArray(req.body.phones) ? req.body.phones : JSON.parse(req.body.phones);
    const cleaned = phones.map((p) => String(p).trim()).filter(Boolean);
    if (cleaned.length === 0 || cleaned.length > 3) {
      return res.status(400).json({ message: '1 tadan 3 tagacha telefon raqam kiritish mumkin' });
    }
    update.phones = cleaned;
  }
  if (req.file) {
    update.registrationDocument = `/uploads/companies/${req.file.filename}`;
  }

  const company = await Company.findByIdAndUpdate(req.user.companyId, update, { new: true, runValidators: true })
    .populate('districtId')
    .populate('zoneId');
  if (!company) {
    return res.status(404).json({ message: 'Kompaniya topilmadi' });
  }

  await logAction({ req, action: 'update', entity: 'Company', entityId: company._id });
  res.json(company);
}
