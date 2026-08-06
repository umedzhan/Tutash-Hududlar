import { Markup } from 'telegraf';

export const BTN_APPLY = '📝 Ariza topshirish';
export const BTN_MY_APPLICATIONS = '📄 Mening arizalarim';
export const BTN_ASK = "💬 Savol berish";
export const BTN_REGISTER = "👤 Ro'yxatdan o'tish";

export function mainMenu(isRegistered) {
  const rows = isRegistered
    ? [[BTN_APPLY, BTN_MY_APPLICATIONS], [BTN_ASK]]
    : [[BTN_REGISTER], [BTN_ASK]];
  return Markup.keyboard(rows).resize();
}

export const WELCOME_TEXT = `Assalomu alaykum! 👋

Men <b>«Tutash Hududlar»</b> elektron platformasining rasmiy Telegram botiman.

Bu bot orqali:
• Ro'yxatdan o'tishingiz
• Tutash hudud uchun <b>ariza topshirishingiz</b>
• Arizalaringiz holatini kuzatishingiz
• Platforma bo'yicha savollaringizga javob olishingiz mumkin.`;
