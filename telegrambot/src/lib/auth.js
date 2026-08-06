import { botSession, userApi } from './api.js';

// Sessiya xotirada saqlanadi (bot qayta ishga tushsa yo'qoladi) — shu sababli har safar
// kerak bo'lganda backenddan telegramChatId bo'yicha qayta JWT so'raymiz (foydalanuvchi
// avval /royxat orqali ro'yxatdan o'tgan bo'lsa, parolsiz qayta autentifikatsiya bo'ladi).
export async function ensureAuth(ctx) {
  if (ctx.session.auth?.token) {
    return ctx.session.auth;
  }
  try {
    const data = await botSession(ctx.chat.id);
    ctx.session.auth = data;
    return data;
  } catch {
    return null;
  }
}

export function api(ctx) {
  return userApi(ctx.session.auth.token);
}
