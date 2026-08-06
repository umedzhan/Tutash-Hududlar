import { Markup } from 'telegraf';
import { ensureAuth, api } from '../lib/auth.js';
import { APPLICATION_STATUS_LABEL } from '../lib/labels.js';
import { mainMenu, BTN_REGISTER } from '../menu.js';

export async function myApplicationsHandler(ctx) {
  const auth = await ensureAuth(ctx);
  if (!auth) {
    await ctx.reply(`Avval ro'yxatdan o'tishingiz kerak. "${BTN_REGISTER}" tugmasini bosing.`, mainMenu(false));
    return;
  }

  const { data: applications } = await api(ctx).get('/applications');
  if (!applications.length) {
    await ctx.reply("Sizda hali arizalar yo'q.", mainMenu(true));
    return;
  }

  for (const app of applications) {
    const lines = [
      `<b>${app.applicationNumber}</b>`,
      `Holati: ${APPLICATION_STATUS_LABEL[app.status] ?? app.status}`,
      `Maqsad: ${app.purpose}`,
    ];
    if (app.areaM2 != null) lines.push(`Maydon: ${app.areaM2} m²`);
    if (app.cadastreNumber) lines.push(`Kadastr: ${app.cadastreNumber}`);

    const extra = { parse_mode: 'HTML' };
    if (app.status === 'AWAITING_CONSENT') {
      extra.reply_markup = Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Rozilik bildirish', `geo_accept:${app._id}`),
          Markup.button.callback("❌ E'tiroz bildirish", `geo_reject:${app._id}`),
        ],
      ]).reply_markup;
    } else if (app.status === 'INFO_REQUESTED') {
      extra.reply_markup = Markup.inlineKeyboard([
        [Markup.button.callback('✍️ Javob yozish', `info_reply:${app._id}`)],
      ]).reply_markup;
    }

    await ctx.reply(lines.join('\n'), extra);
  }
}
