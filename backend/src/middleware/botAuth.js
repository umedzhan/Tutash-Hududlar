import { env } from '../config/env.js';

// telegrambot/ xizmati bilan bu backend orasidagi ishonch chegarasi — Telegram foydalanuvchi
// tokeni EMAS, ikkala xizmat ham biladigan umumiy maxfiy kalit (BOT_SHARED_SECRET).
export function requireBotSecret(req, res, next) {
  const key = req.headers['x-bot-key'];
  if (!env.botSharedSecret || key !== env.botSharedSecret) {
    return res.status(401).json({ message: 'Ruxsat etilmagan' });
  }
  next();
}
