import Notification from '../models/Notification.js';

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
}

export async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true },
  );
  if (!notification) {
    return res.status(404).json({ message: 'Xabarnoma topilmadi' });
  }
  res.json(notification);
}
