import bcrypt from 'bcryptjs';
import RegistrationRequest from '../models/RegistrationRequest.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { sendEmail } from '../services/integrations/email.js';
import { logAction } from '../middleware/auditLogger.js';
import { ROLES } from '../constants.js';

export async function createRegistrationRequest(req, res) {
  const { companyName, stir, director, phone, email, password, districtId, zoneId, address, cadastreNumber } = req.body;

  if (!companyName || !stir || !director || !phone || !email || !password) {
    return res.status(400).json({ message: 'Barcha majburiy maydonlarni to\'ldiring' });
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(409).json({ message: 'Bu telefon raqam bilan foydalanuvchi allaqachon mavjud' });
  }
  const existingRequest = await RegistrationRequest.findOne({ phone, status: 'kutilmoqda' });
  if (existingRequest) {
    return res.status(409).json({ message: 'Bu telefon raqam bilan so\'rov allaqachon yuborilgan, ko\'rib chiqilmoqda' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const request = await RegistrationRequest.create({
    companyName,
    stir,
    director,
    phone,
    email,
    passwordHash,
    districtId: districtId || null,
    zoneId: zoneId || null,
    address,
    cadastreNumber: cadastreNumber || '',
  });

  res.status(201).json({
    id: request._id,
    message: "Ro'yxatdan o'tish so'rovingiz qabul qilindi. Admin tomonidan tasdiqlangach, email orqali xabar beriladi.",
  });
}

export async function listRegistrationRequests(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const requests = await RegistrationRequest.find(filter)
    .populate('districtId')
    .populate('zoneId')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(requests);
}

export async function approveRegistrationRequest(req, res) {
  const request = await RegistrationRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: "So'rov topilmadi" });
  }
  if (request.status !== 'kutilmoqda') {
    return res.status(400).json({ message: "Bu so'rov allaqachon ko'rib chiqilgan" });
  }

  const existingUser = await User.findOne({ phone: request.phone });
  if (existingUser) {
    return res.status(409).json({ message: 'Bu telefon raqam bilan foydalanuvchi allaqachon mavjud' });
  }

  const company = await Company.create({
    name: request.companyName,
    stir: request.stir,
    director: request.director,
    phones: [request.phone],
    email: request.email,
    districtId: request.districtId,
    zoneId: request.zoneId,
    address: request.address,
    cadastreNumber: request.cadastreNumber,
  });

  const user = await User.create({
    name: request.director,
    phone: request.phone,
    passwordHash: request.passwordHash,
    role: ROLES.TADBIRKOR,
    companyId: company._id,
  });

  request.status = 'tasdiqlangan';
  request.reviewedBy = req.user.id;
  request.reviewedAt = new Date();
  await request.save();

  await sendEmail({
    to: request.email,
    subject: "Tutash Hududlar — ro'yxatdan o'tish tasdiqlandi",
    body: `Hurmatli ${request.director},\n\n"${request.companyName}" nomidan yuborgan ro'yxatdan o'tish so'rovingiz tasdiqlandi. Endi ${request.phone} raqami va ro'yxatdan o'tishda o'rnatgan parolingiz orqali tizimga kirishingiz mumkin.\n\nTutash Hududlar platformasi`,
  });

  await logAction({ req, action: 'approve', entity: 'RegistrationRequest', entityId: request._id });
  res.json({ request, userId: user._id, companyId: company._id });
}

export async function rejectRegistrationRequest(req, res) {
  const { reason } = req.body;
  const request = await RegistrationRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: "So'rov topilmadi" });
  }
  if (request.status !== 'kutilmoqda') {
    return res.status(400).json({ message: "Bu so'rov allaqachon ko'rib chiqilgan" });
  }

  request.status = 'rad_etilgan';
  request.rejectionReason = reason || '';
  request.reviewedBy = req.user.id;
  request.reviewedAt = new Date();
  await request.save();

  await sendEmail({
    to: request.email,
    subject: "Tutash Hududlar — ro'yxatdan o'tish so'rovi rad etildi",
    body: `Hurmatli ${request.director},\n\n"${request.companyName}" nomidan yuborgan ro'yxatdan o'tish so'rovingiz rad etildi.${reason ? `\n\nSabab: ${reason}` : ''}\n\nTutash Hududlar platformasi`,
  });

  await logAction({ req, action: 'reject', entity: 'RegistrationRequest', entityId: request._id });
  res.json(request);
}
