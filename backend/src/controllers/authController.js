import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { logAction } from '../middleware/auditLogger.js';

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name, companyId: user.companyId },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export async function login(req, res) {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(401).json({ message: 'Telefon raqam yoki parol noto\'g\'ri' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Telefon raqam yoki parol noto\'g\'ri' });
  }

  user.status = 'onlayn';
  await user.save();

  const token = signToken(user);
  await logAction({ req: { ...req, user: { id: user._id } }, action: 'login', entity: 'User', entityId: user._id });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      phone: user.phone,
    },
  });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).populate('companyId');
  if (!user) {
    return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }
  res.json({
    id: user._id,
    name: user.name,
    role: user.role,
    phone: user.phone,
    company: user.companyId,
    notificationPrefs: user.notificationPrefs,
  });
}

export async function updateMe(req, res) {
  const { name, phone, currentPassword, newPassword, notificationPrefs } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }

  if (phone && phone !== user.phone) {
    const existing = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existing) {
      return res.status(409).json({ message: 'Bu telefon raqam bilan foydalanuvchi mavjud' });
    }
    user.phone = phone;
  }
  if (name) user.name = name;
  if (notificationPrefs) {
    user.notificationPrefs = { ...user.notificationPrefs?.toObject?.(), ...notificationPrefs };
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Joriy parolni kiriting' });
    }
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Joriy parol noto'g'ri" });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  await logAction({ req, action: 'update', entity: 'User', entityId: user._id, diff: { self: true } });

  res.json({
    id: user._id,
    name: user.name,
    role: user.role,
    phone: user.phone,
    companyId: user.companyId,
    notificationPrefs: user.notificationPrefs,
  });
}
