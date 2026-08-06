import { ensureAuth, api } from '../lib/auth.js';
import { mainMenu } from '../menu.js';
import { chatbotReply } from './chatbot.js';

// Kadastr chegarani belgilagach backenddan yuborilgan xabardagi (yoki "Mening arizalarim"
// ro'yxatidagi) inline tugmalar shu callback_query'larni ishga tushiradi.
export function registerCallbackHandlers(bot) {
  bot.action(/^geo_accept:(.+)$/, async (ctx) => {
    const applicationId = ctx.match[1];
    const auth = await ensureAuth(ctx);
    if (!auth) return ctx.answerCbQuery("Avval ro'yxatdan o'ting");
    await ctx.answerCbQuery();
    try {
      await api(ctx).post(`/applications/${applicationId}/geometry-consent`, { accept: true });
      await ctx.reply('✅ Roziligingiz qabul qilindi. Ariza keyingi bosqichga o\'tdi.', mainMenu(true));
    } catch (err) {
      await ctx.reply(`⛔ ${err.response?.data?.message ?? 'Xatolik yuz berdi'}`);
    }
  });

  bot.action(/^geo_reject:(.+)$/, async (ctx) => {
    const applicationId = ctx.match[1];
    const auth = await ensureAuth(ctx);
    if (!auth) return ctx.answerCbQuery("Avval ro'yxatdan o'ting");
    await ctx.answerCbQuery();
    ctx.session.pending = { type: 'geo_reject', applicationId };
    await ctx.reply("E'tiroz sababini yozing:");
  });

  bot.action(/^info_reply:(.+)$/, async (ctx) => {
    const applicationId = ctx.match[1];
    const auth = await ensureAuth(ctx);
    if (!auth) return ctx.answerCbQuery("Avval ro'yxatdan o'ting");
    await ctx.answerCbQuery();
    ctx.session.pending = { type: 'info_reply', applicationId };
    await ctx.reply("So'ralgan ma'lumot / javobingizni yozing:");
  });

  bot.action(/^chip:(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    await chatbotReply(ctx, ctx.match[1]);
  });
}

// ctx.session.pending orqali kutilayotgan matnli javoblarni qayta ishlaydi (e'tiroz sababi
// yoki qo'shimcha ma'lumot so'roviga javob). Agar kutilayotgan holat bo'lmasa false qaytaradi
// — shunda chaqiruvchi (index.js) xabarni chatbotga yo'naltiradi.
export async function handlePendingText(ctx) {
  const pending = ctx.session.pending;
  if (!pending) return false;
  ctx.session.pending = null;
  const text = ctx.message.text.trim();

  try {
    if (pending.type === 'geo_reject') {
      await api(ctx).post(`/applications/${pending.applicationId}/geometry-consent`, { accept: false, note: text });
      await ctx.reply("E'tirozingiz yuborildi. Ariza qayta ko'rib chiqiladi.", mainMenu(true));
    } else if (pending.type === 'info_reply') {
      await api(ctx).post(`/applications/${pending.applicationId}/provide-info`, { comment: text });
      await ctx.reply("Javobingiz yuborildi. Rahmat!", mainMenu(true));
    }
  } catch (err) {
    await ctx.reply(`⛔ ${err.response?.data?.message ?? 'Xatolik yuz berdi'}`);
  }
  return true;
}
