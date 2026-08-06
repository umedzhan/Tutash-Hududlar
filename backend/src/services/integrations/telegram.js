import { env } from '../../config/env.js';

// Ariza holati o'zgarganda Telegram bot orqali ro'yxatdan o'tgan foydalanuvchiga
// bevosita xabar yuborish uchun (bot xizmati ishlamayotgan bo'lsa ham ishlaydi,
// chunki bu yerda to'g'ridan-to'g'ri Telegram Bot API'ga murojaat qilinadi).
export async function sendTelegramMessage(chatId, text, replyMarkup) {
  if (!chatId || !env.telegramBotToken) return;
  try {
    const payload = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    const res = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[telegram] xabar yuborilmadi:', res.status, body);
    }
  } catch (err) {
    console.error('[telegram] xabar yuborishda xatolik:', err.message);
  }
}
