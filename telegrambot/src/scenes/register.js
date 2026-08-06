import { Scenes, Markup } from 'telegraf';
import { publicApi, botRegister } from '../lib/api.js';
import { matchZones } from '../lib/zonePicker.js';
import { mainMenu } from '../menu.js';

export const REGISTER_SCENE_ID = 'register';

function districtsKeyboard(districts) {
  const rows = [];
  for (let i = 0; i < districts.length; i += 2) {
    rows.push(
      districts
        .slice(i, i + 2)
        .map((d) => Markup.button.callback(d.name, `reg_district:${d._id}`)),
    );
  }
  return Markup.inlineKeyboard(rows);
}

function zonesKeyboard(matches) {
  return Markup.inlineKeyboard(matches.map((z) => [Markup.button.callback(z.name, `reg_zone:${z._id}`)]));
}

export const registerWizard = new Scenes.WizardScene(
  REGISTER_SCENE_ID,
  async (ctx) => {
    ctx.wizard.state.data = {};
    await ctx.reply("Ro'yxatdan o'tishni boshlaymiz. 🏢\n\nKorxona (yoki YaTT) nomini kiriting:", Markup.removeKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return;
    ctx.wizard.state.data.companyName = ctx.message.text.trim();
    await ctx.reply("STIR (soliq to'lovchi identifikatsiya raqami)ni kiriting:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return;
    ctx.wizard.state.data.stir = ctx.message.text.trim();
    await ctx.reply('Rahbar F.I.Sh. kiriting:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return;
    ctx.wizard.state.data.director = ctx.message.text.trim();
    await ctx.reply(
      'Telefon raqamingizni yuboring:',
      Markup.keyboard([[Markup.button.contactRequest('📱 Raqamni yuborish')]])
        .resize()
        .oneTime(),
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const phone = ctx.message?.contact?.phone_number || ctx.message?.text?.trim();
    if (!phone) return;
    ctx.wizard.state.data.phone = phone.startsWith('+') ? phone : `+${phone}`;

    const { data: districts } = await publicApi.get('/references/districts');
    ctx.wizard.state.districts = districts;
    await ctx.reply('Tuman yoki shaharni tanlang:', Markup.removeKeyboard());
    await ctx.reply('Tumanlar:', districtsKeyboard(districts));
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.callbackQuery?.data?.startsWith('reg_district:')) {
      const districtId = ctx.callbackQuery.data.split(':')[1];
      const district = ctx.wizard.state.districts.find((d) => d._id === districtId);
      ctx.wizard.state.data.districtId = districtId;
      await ctx.answerCbQuery();
      await ctx.editMessageText(`Tuman: ${district?.name ?? ''} ✅`);

      const { data: zones } = await publicApi.get('/references/zones', { params: { districtId } });
      ctx.wizard.state.zones = zones;
      await ctx.reply(
        "Mahalla nomini yozing (masalan: Alisher Navoiy). Agar bilmasangiz, «-» deb yozib o'tkazib yuborishingiz mumkin.",
      );
      return ctx.wizard.next();
    }
    await ctx.reply('Iltimos, yuqoridagi tugmalardan tuman/shaharni tanlang.');
  },
  async (ctx) => {
    if (ctx.callbackQuery?.data?.startsWith('reg_zone:')) {
      const zoneId = ctx.callbackQuery.data.split(':')[1];
      const zone = ctx.wizard.state.zones.find((z) => z._id === zoneId);
      ctx.wizard.state.data.zoneId = zoneId;
      await ctx.answerCbQuery();
      await ctx.editMessageText(`Mahalla: ${zone?.name ?? ''} ✅`);
      await ctx.reply('Manzilni (ko\'cha, uy) kiriting:');
      return ctx.wizard.next();
    }
    if (!ctx.message?.text) return;
    const text = ctx.message.text.trim();
    if (text === '-') {
      ctx.wizard.state.data.zoneId = null;
      await ctx.reply('Manzilni (ko\'cha, uy) kiriting:');
      return ctx.wizard.next();
    }
    const matches = matchZones(text, ctx.wizard.state.zones || []);
    if (!matches.length) {
      await ctx.reply("Mahalla topilmadi. Qaytadan yozing yoki «-» deb o'tkazib yuboring.");
      return;
    }
    if (matches.length === 1) {
      ctx.wizard.state.data.zoneId = matches[0]._id;
      await ctx.reply(`Mahalla: ${matches[0].name} ✅`);
      await ctx.reply('Manzilni (ko\'cha, uy) kiriting:');
      return ctx.wizard.next();
    }
    await ctx.reply('Mos kelgan mahallalar, birini tanlang:', zonesKeyboard(matches));
  },
  async (ctx) => {
    if (!ctx.message?.text) return;
    ctx.wizard.state.data.address = ctx.message.text.trim();
    await ctx.reply("Kadastr raqami (mavjud bo'lsa kiriting, bo'lmasa «-» yozing):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return;
    const cadastreNumber = ctx.message.text.trim();
    ctx.wizard.state.data.cadastreNumber = cadastreNumber === '-' ? '' : cadastreNumber;

    try {
      const result = await botRegister({
        ...ctx.wizard.state.data,
        telegramChatId: ctx.chat.id,
      });
      ctx.session.auth = result;
      await ctx.reply(
        `✅ Ro'yxatdan muvaffaqiyatli o'tdingiz, ${result.user.name}!\n\nEndi ariza topshirishingiz mumkin.`,
        mainMenu(true),
      );
    } catch (err) {
      const message = err.response?.data?.message ?? "Ro'yxatdan o'tishda xatolik yuz berdi";
      await ctx.reply(`⛔ ${message}`, mainMenu(false));
    }
    return ctx.scene.leave();
  },
);
