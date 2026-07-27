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
