import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { signToken } from './authController.js';
import { logAction } from '../middleware/auditLogger.js';
import { ROLES } from '../constants.js';

// Telegram bot orqali to'g'ridan-to'g'ri ro'yxatdan o'tish — admin tasdiqlashisiz
// (saytdagi RegistrationRequest oqimidan farqli o'laroq). Bot X-Bot-Key bilan
// himoyalangan bu endpointni chaqiradi, so'ng oddiy JWT olib, boshqa hamma
// mavjud endpointlarni (sayt ishlatgani kabi) ishlataveradi.
export async function botRegister(req, res) {
  const { companyName, stir, director, phone, districtId, zoneId, address, cadastreNumber, telegramChatId } = req.body;

  if (!companyName || !stir || !director || !phone || !telegramChatId) {
    return res.status(400).json({ message: 'Barcha majburiy maydonlarni to\'ldiring' });
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(409).json({ message: 'Bu telefon raqam bilan foydalanuvchi allaqachon mavjud' });
  }

  const company = await Company.create({
    name: companyName,
    stir,
    director,
    phones: [phone],
    districtId: districtId || null,
    zoneId: zoneId || null,
    address: address || '',
    cadastreNumber: cadastreNumber || '',
  });

  // Botda parol so'ralmaydi (foydalanuvchi faqat Telegram orqali kiradi) — tasodifiy
  // parol o'rnatiladi, u sayt orqali kirishda ishlatilmaydi.
  const randomPassword = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  const user = await User.create({
    name: director,
    phone,
    passwordHash,
    role: ROLES.TADBIRKOR,
    companyId: company._id,
    telegramChatId: String(telegramChatId),
  });

  const token = signToken(user);
  await logAction({ req: { ...req, user: { id: user._id } }, action: 'create', entity: 'User', entityId: user._id, diff: { via: 'telegram-bot' } });

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, role: user.role, companyId: user.companyId, phone: user.phone },
  });
}

// Bot qayta ishga tushganda yoki foydalanuvchi allaqachon ro'yxatdan o'tgan bo'lsa —
// telegramChatId bo'yicha uni topib, yangi JWT beradi (parol so'ralmaydi).
export async function botSession(req, res) {
  const { telegramChatId } = req.body;
  if (!telegramChatId) {
    return res.status(400).json({ message: 'telegramChatId talab qilinadi' });
  }

  const user = await User.findOne({ telegramChatId: String(telegramChatId) });
  if (!user) {
    return res.status(404).json({ message: 'Ro\'yxatdan o\'tilmagan' });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, role: user.role, companyId: user.companyId, phone: user.phone },
  });
}
