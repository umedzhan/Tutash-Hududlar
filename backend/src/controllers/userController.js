import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { logAction } from '../middleware/auditLogger.js';

export async function listUsers(req, res) {
  const users = await User.find().populate('companyId').select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
}

export async function createUser(req, res) {
  const { name, phone, password, role, companyId } = req.body;
  const existing = await User.findOne({ phone });
  if (existing) {
    return res.status(409).json({ message: 'Bu telefon raqam bilan foydalanuvchi mavjud' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, phone, passwordHash, role, companyId: companyId || null });

  await logAction({ req, action: 'create', entity: 'User', entityId: user._id });
  res.status(201).json({ id: user._id, name: user.name, phone: user.phone, role: user.role });
}

export async function updateUser(req, res) {
  const { name, role, status, companyId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, role, status, companyId },
    { new: true },
  ).select('-passwordHash');

  if (!user) {
    return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }

  await logAction({ req, action: 'update', entity: 'User', entityId: user._id });
  res.json(user);
}

export async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }
  await logAction({ req, action: 'delete', entity: 'User', entityId: user._id });
  res.status(204).send();
}
