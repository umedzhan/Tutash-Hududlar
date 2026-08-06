import 'dotenv/config';
import { Telegraf, Scenes, session, Markup } from 'telegraf';
import { telegramIpv4Agent } from './lib/httpAgent.js';
import { ensureAuth } from './lib/auth.js';
import { mainMenu, WELCOME_TEXT, BTN_APPLY, BTN_MY_APPLICATIONS, BTN_ASK, BTN_REGISTER } from './menu.js';
import { registerWizard, REGISTER_SCENE_ID } from './scenes/register.js';
import { applicationWizard, APPLICATION_SCENE_ID } from './scenes/application.js';
import { myApplicationsHandler } from './handlers/myApplications.js';
import { registerCallbackHandlers, handlePendingText } from './handlers/callbacks.js';
import { chatbotReply } from './handlers/chatbot.js';

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN .env faylida belgilanmagan');
}

const bot = new Telegraf(process.env.BOT_TOKEN, { telegram: { agent: telegramIpv4Agent } });
const stage = new Scenes.Stage([registerWizard, applicationWizard]);

bot.use(session());
bot.use(stage.middleware());

registerCallbackHandlers(bot);

bot.start(async (ctx) => {
  const auth = await ensureAuth(ctx);
  await ctx.reply(WELCOME_TEXT, { parse_mode: 'HTML', ...mainMenu(Boolean(auth)) });
});

bot.hears(BTN_REGISTER, (ctx) => ctx.scene.enter(REGISTER_SCENE_ID));

bot.hears(BTN_APPLY, async (ctx) => {
  const auth = await ensureAuth(ctx);
  if (!auth) {
    await ctx.reply(`Avval ro'yxatdan o'tishingiz kerak. "${BTN_REGISTER}" tugmasini bosing.`, mainMenu(false));
    return;
  }
  await ctx.scene.enter(APPLICATION_SCENE_ID);
});

bot.hears(BTN_MY_APPLICATIONS, myApplicationsHandler);

bot.hears(BTN_ASK, async (ctx) => {
  await ctx.reply("Savolingizni yozing, men javob berishga harakat qilaman. 💬", Markup.removeKeyboard());
});

bot.on('text', async (ctx) => {
  if (await handlePendingText(ctx)) return;
  await chatbotReply(ctx, ctx.message.text);
});

bot.catch((err, ctx) => {
  console.error(`[bot] xatolik (update ${ctx.updateType}):`, err);
});

bot
  .launch()
  .then(() => console.log('[bot] Tutash Hududlar Telegram boti ishga tushdi'))
  .catch((err) => {
    console.error('[bot] ishga tushmadi:', err.message);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
