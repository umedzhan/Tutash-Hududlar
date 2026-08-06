import { Markup } from 'telegraf';
import { findAnswer, FALLBACK, CHIPS } from '../lib/kb.js';
import { htmlToTelegram } from '../lib/formatting.js';

const DISTRICT_NAMES = ['Termiz shahri', 'Termiz tumani', 'Angor', "Jarqo'rg'on", 'Oltinsoy', 'Qiziriq', 'Sherobod', "Sho'rchi", 'Bandixon', 'Sariosiyo', 'Uzun', 'Muzrabot', 'Denov', 'Boysun', "Qumqo'rg'on"];

function chipsKeyboard(awaitingDistrict) {
  const items = awaitingDistrict ? DISTRICT_NAMES.map((n) => ({ t: n, q: n })) : CHIPS;
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2).map((c) => Markup.button.callback(c.t, `chip:${c.q}`)));
  }
  return Markup.inlineKeyboard(rows);
}

export async function chatbotReply(ctx, text) {
  const awaitingDistrict = Boolean(ctx.session.awaitingDistrict);
  const result = findAnswer(text, awaitingDistrict);
  if (!result) {
    ctx.session.awaitingDistrict = false;
    await ctx.reply(htmlToTelegram(FALLBACK()), { parse_mode: 'HTML', ...chipsKeyboard(false) });
    return;
  }
  ctx.session.awaitingDistrict = result.nextAwaitingDistrict;
  await ctx.reply(htmlToTelegram(result.html), { parse_mode: 'HTML', ...chipsKeyboard(result.nextAwaitingDistrict) });
}
