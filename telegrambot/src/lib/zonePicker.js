import { norm } from './kb.js';

// Mahalla nomlarini qidirish (chatbotdagi normalizatsiya bilan bir xil) — tumanlarda
// o'nlab-yuzlab mahalla borligi sabab, inline keyboardda hammasini ko'rsatish o'rniga
// foydalanuvchi nom yozadi, mos kelganlar tugma sifatida taklif qilinadi.
export function matchZones(query, zones) {
  const q = norm(query);
  if (!q) return [];
  return zones.filter((z) => norm(z.name).includes(q)).slice(0, 10);
}
