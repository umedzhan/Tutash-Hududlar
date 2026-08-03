import User from '../models/User.js';
import Notification from '../models/Notification.js';

export async function notifyRoles({ roles, message, type = 'info' }) {
  const users = await User.find({ role: { $in: roles } }).select('_id');
  if (users.length === 0) return;
  await Notification.insertMany(users.map((u) => ({ userId: u._id, message, type })));
}
