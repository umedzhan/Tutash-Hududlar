import axios from 'axios';
import 'dotenv/config';

const API_BASE_URL = process.env.API_BASE_URL;
const BOT_API_KEY = process.env.BOT_API_KEY;

// X-Bot-Key bilan himoyalangan bot-maxsus endpointlar (register/session) — bular orqali
// oddiy JWT olinadi, undan keyin saytdagi kabi Bearer token bilan ishlaydi.
export const botApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Bot-Key': BOT_API_KEY },
});

// Foydalanuvchi nomidan (JWT bilan) saytdagi bilan bir xil endpointlarni chaqirish uchun.
export function userApi(token) {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Tuman/mahalla ro'yxati autentifikatsiyasiz ochiq (ro'yxatdan o'tishdan oldin kerak bo'ladi).
export const publicApi = axios.create({ baseURL: API_BASE_URL });

export async function botRegister(payload) {
  const { data } = await botApi.post('/bot/register', payload);
  return data;
}

export async function botSession(telegramChatId) {
  const { data } = await botApi.post('/bot/session', { telegramChatId });
  return data;
}
