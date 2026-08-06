import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutash_hududlar',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  // Telegram bot xizmati -> shu backend orasidagi ichki ishonchli chaqiruvlar uchun umumiy
  // maxfiy kalit (Telegram botning o'zi tokeni EMAS — uni telegrambot/.env da BOT_TOKEN
  // sifatida ayrim saqlaymiz).
  botSharedSecret: process.env.BOT_SHARED_SECRET || '',
};
