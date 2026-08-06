import https from 'node:https';

// Ba'zi tarmoq muhitlarida IPv6 yo'nalishi ishlamaydi va Node'ning standart dual-stack
// DNS tanlovi shu sabab ba'zan osilib qoladi (ETIMEDOUT) — Telegram serverlariga (bot API
// va fayl yuklab olish) qilingan so'rovlarni IPv4'ga majburlash buni oldini oladi.
export const telegramIpv4Agent = new https.Agent({ family: 4, keepAlive: true });
