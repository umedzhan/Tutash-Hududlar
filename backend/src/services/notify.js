import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * prefKey berilsa, faqat notificationPrefs[prefKey] !== false bo'lgan foydalanuvchilarga yuboriladi
 * (sozlama hali o'rnatilmagan eski foydalanuvchilar uchun ham standart holat — yuborish).
 */
export async function notifyRoles({ roles, message, type = 'info', prefKey }) {
  const filter = { role: { $in: roles } };
  if (prefKey) {
    filter[`notificationPrefs.${prefKey}`] = { $ne: false };
  }
  const users = await User.find(filter).select('_id');
  if (users.length === 0) return;
  await Notification.insertMany(users.map((u) => ({ userId: u._id, message, type })));
}
