import fs from 'node:fs';
import { Scenes, Markup } from 'telegraf';
import FormData from 'form-data';
import axios from 'axios';
import { publicApi, userApi } from '../lib/api.js';
import { telegramIpv4Agent } from '../lib/httpAgent.js';
import { matchZones } from '../lib/zonePicker.js';
import { USAGE_TYPES } from '../lib/labels.js';
import { mainMenu } from '../menu.js';

export const APPLICATION_SCENE_ID = 'application';

const PHOTO_SIDES = [
  { key: 'shimol', label: 'Shimol' },
  { key: 'janub', label: 'Janub' },
  { key: 'sharq', label: 'Sharq' },
  { key: 'gharb', label: "G'arb" },
];

function districtsKeyboard(districts) {
  const rows = [];
  for (let i = 0; i < districts.length; i += 2) {
    rows.push(districts.slice(i, i + 2).map((d) => Markup.button.callback(d.name, `app_district:${d._id}`)));
  }
  return Markup.inlineKeyboard(rows);
}

function zonesKeyboard(matches) {
  return Markup.inlineKeyboard(matches.map((z) => [Markup.button.callback(z.name, `app_zone:${z._id}`)]));
}

function purposesKeyboard(purposes) {
  return Markup.inlineKeyboard(purposes.map((p) => [Markup.button.callback(p.name, `app_purpose:${p._id}`)]));
}

function isoDate(text) {
  const t = text.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : t;
}

async function downloadTelegramPhoto(ctx, fileId) {
  const link = await ctx.telegram.getFileLink(fileId);
  const { data } = await axios.get(link.href, { responseType: 'arraybuffer', httpsAgent: telegramIpv4Agent });
  return Buffer.from(data);
}

export const applicationWizard = new Scenes.WizardScene(
  APPLICATION_SCENE_ID,
  async (ctx) => {
    ctx.wizard.state.data = { photos: {} };
    const { data: districts } = await publicApi.get('/references/districts');
    ctx.wizard.state.districts = districts;
    await ctx.reply('Yangi ariza. 📝\n\nAvval hudud joylashgan tuman/shaharni tanlang:', districtsKeyboard(districts));
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery?.data?.startsWith('app_district:')) {
      await ctx.reply('Iltimos, tugmalardan tuman/shaharni tanlang.');
      return;
    }
    const districtId = ctx.callbackQuery.data.split(':')[1];
    const district = ctx.wizard.state.districts.find((d) => d._id === districtId);
    ctx.wizard.state.data.districtId = districtId;
    await ctx.answerCbQuery();
    await ctx.editMessageText(`Tuman: ${district?.name ?? ''} ✅`);

    const { data: zones } = await publicApi.get('/references/zones', { params: { districtId } });
    ctx.wizard.state.zones = zones;
    await ctx.reply('Mahalla nomini yozing (masalan: Alisher Navoiy):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.callbackQuery?.data?.startsWith('app_zone:')) {
      const zoneId = ctx.callbackQuery.data.split(':')[1];
      const zone = ctx.wizard.state.zones.find((z) => z._id === zoneId);
      ctx.wizard.state.data.zoneId = zoneId;
      await ctx.answerCbQuery();
      await ctx.editMessageText(`Mahalla: ${zone?.name ?? ''} ✅`);

      const { data: purposes } = await userApi(ctx.session.auth.token).get('/references/purposes');
      ctx.wizard.state.purposes = purposes;
      await ctx.reply('Foydalanish maqsadini tanlang:', purposesKeyboard(purposes));
      return ctx.wizard.next();
    }
    if (!ctx.message?.text) return;
    const matches = matchZones(ctx.message.text.trim(), ctx.wizard.state.zones || []);
    if (!matches.length) {
      await ctx.reply('Mahalla topilmadi. Qaytadan yozing (masalan: Alisher Navoiy).');
      return;
    }
    if (matches.length === 1) {
      ctx.wizard.state.data.zoneId = matches[0]._id;
      await ctx.reply(`Mahalla: ${matches[0].name} ✅`);
      const { data: purposes } = await userApi(ctx.session.auth.token).get('/references/purposes');
      ctx.wizard.state.purposes = purposes;
      await ctx.reply('Foydalanish maqsadini tanlang:', purposesKeyboard(purposes));
      return ctx.wizard.next();
    }
    await ctx.reply('Mos kelgan mahallalar, birini tanlang:', zonesKeyboard(matches));
  },
  async (ctx) => {
    if (!ctx.callbackQuery?.data?.startsWith('app_purpose:')) {
      await ctx.reply('Iltimos, tugmalardan maqsadni tanlang.');
      return;
    }
    const purposeId = ctx.callbackQuery.data.split(':')[1];
    const purpose = ctx.wizard.state.purposes.find((p) => p._id === purposeId);
    ctx.wizard.state.data.purposeId = purposeId;
    ctx.wizard.state.data.purpose = purpose?.name ?? '';
    await ctx.answerCbQuery();
    await ctx.editMessageText(`Maqsad: ${purpose?.name ?? ''} ✅`);
    await ctx.reply(
      'Foydalanish turini tanlang:',
      Markup.inlineKeyboard(USAGE_TYPES.map((u) => [Markup.button.callback(u, `app_usage:${u}`)])),
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery?.data?.startsWith('app_usage:')) {
      await ctx.reply('Iltimos, tugmalardan foydalanish turini tanlang.');
      return;
    }
    const usageType = ctx.callbackQuery.data.split(':')[1];
    ctx.wizard.state.data.usageType = usageType;
    await ctx.answerCbQuery();
    await ctx.editMessageText(`Foydalanish turi: ${usageType} ✅`);
    await ctx.reply("Foydalanish davri boshlanish sanasini kiriting (masalan: 2026-09-01):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const from = isoDate(ctx.message?.text ?? '');
    if (!from) {
      await ctx.reply('Sana formati noto\'g\'ri. Masalan: 2026-09-01 ko\'rinishida kiriting.');
      return;
    }
    ctx.wizard.state.data.periodFrom = from;
    await ctx.reply('Tugash sanasini kiriting (masalan: 2027-09-01):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const to = isoDate(ctx.message?.text ?? '');
    if (!to) {
      await ctx.reply('Sana formati noto\'g\'ri. Masalan: 2027-09-01 ko\'rinishida kiriting.');
      return;
    }
    ctx.wizard.state.data.periodTo = to;
    await ctx.reply('Kadastr raqamini kiriting (MAJBURIY — yer uchastkasi tegishli bo\'lgan kadastr raqami):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const cadastreNumber = ctx.message?.text?.trim();
    if (!cadastreNumber) {
      await ctx.reply('Kadastr raqami majburiy. Iltimos, kiriting:');
      return;
    }
    ctx.wizard.state.data.cadastreNumber = cadastreNumber;
    await ctx.reply("Qo'shimcha izoh kiriting (bo'lmasa «-» yozing):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return;
    const comment = ctx.message.text.trim();
    ctx.wizard.state.data.comment = comment === '-' ? '' : comment;
    await ctx.reply(
      "Endi hududni 4 tarafdan (shimol, janub, sharq, g'arb) rasmga olib yuboring.\n\n📸 Avval SHIMOL tarafdan rasm yuboring:",
    );
    ctx.wizard.state.photoStep = 0;
    return ctx.wizard.next();
  },
  async (ctx) => {
    const photo = ctx.message?.photo;
    if (!photo?.length) {
      await ctx.reply(`Iltimos, ${PHOTO_SIDES[ctx.wizard.state.photoStep].label} tarafdan rasm (foto) yuboring.`);
      return;
    }
    const side = PHOTO_SIDES[ctx.wizard.state.photoStep];
    const fileId = photo[photo.length - 1].file_id;
    try {
      ctx.wizard.state.data.photos[side.key] = await downloadTelegramPhoto(ctx, fileId);
    } catch {
      await ctx.reply("Rasmni yuklab olishda xatolik yuz berdi, qaytadan yuboring:");
      return;
    }
    ctx.wizard.state.photoStep += 1;
    if (ctx.wizard.state.photoStep < PHOTO_SIDES.length) {
      const next = PHOTO_SIDES[ctx.wizard.state.photoStep];
      await ctx.reply(`✅ ${side.label} qabul qilindi.\n\n📸 Endi ${next.label} tarafdan rasm yuboring:`);
      return;
    }

    await ctx.reply(`✅ ${side.label} qabul qilindi.\n\n⏳ Ariza yuborilmoqda...`);
    try {
      const d = ctx.wizard.state.data;
      const form = new FormData();
      form.append('districtId', d.districtId);
      form.append('zoneId', d.zoneId);
      form.append('purposeId', d.purposeId);
      form.append('purpose', d.purpose);
      form.append('usageType', d.usageType);
      form.append('period', JSON.stringify({ from: d.periodFrom, to: d.periodTo }));
      form.append('comment', d.comment ?? '');
      form.append('cadastreNumber', d.cadastreNumber);
      for (const s of PHOTO_SIDES) {
        form.append(s.key, d.photos[s.key], { filename: `${s.key}.jpg`, contentType: 'image/jpeg' });
      }

      const client = userApi(ctx.session.auth.token);
      const { data: application } = await client.post('/applications', form, { headers: form.getHeaders() });

      await ctx.reply(
        `✅ Arizangiz qabul qilindi!\n\nAriza raqami: <b>${application.applicationNumber}</b>\n\n` +
          `Hudud chegarasini Kadastr xodimi belgilaydi, so'ng sizga botda xabar keladi.`,
        { parse_mode: 'HTML', ...mainMenu(true) },
      );

      if (application.receiptPdfPath && fs.existsSync(application.receiptPdfPath)) {
        await ctx.replyWithDocument({ source: application.receiptPdfPath, filename: `ariza-${application.applicationNumber}.pdf` });
      }
    } catch (err) {
      const message = err.response?.data?.message ?? 'Ariza yuborishda xatolik yuz berdi';
      await ctx.reply(`⛔ ${message}`, mainMenu(true));
    }
    return ctx.scene.leave();
  },
);
