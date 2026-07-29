# Tutash Hududlar

Yer osti/tutash hududlarni ijaraga berish jarayonini raqamlashtirish uchun platforma: tadbirkorlar hudud chegarasini xaritada o'zi chizib ariza topshiradi, ariza 4 bosqichli davlat organlari nazorati (Kadastr → Arxitektura → Soliq → Yakuniy tasdiq) orqali o'tadi, narx avtomatik hisoblanadi va shartnoma avtomatik generatsiya qilinadi.

## Texnologiyalar

- **Backend:** Node.js, Express, MongoDB (Mongoose), `@turf/turf` (aniq geometriya/poligon kesishuv hisob-kitoblari), JWT autentifikatsiya, PDFKit (shartnoma PDF generatsiyasi)
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, React Query, React Leaflet (interaktiv xarita + poligon chizish), Zustand, React Hook Form + Zod

> OneID, E-IMZO, Payme/Click kabi tashqi integratsiyalar hozircha **mock** rejimda ishlaydi.

## Asosiy funksiyalar

- **Rollar:** `SUPER_ADMIN`, `KADASTR`, `ARXITEKTURA`, `SOLIQ`, `TADBIRKOR`
- **Ariza jarayoni:** tadbirkor xaritada o'z poligonini chizadi → geo-validatsiya (band/taqiqlangan hududlar bilan kesishuv tekshiruvi) → narx avtomatik hisoblanadi (tuman, zona, maqsad, mavsum koeffitsiyentlari asosida) → 4 bosqichli ketma-ket ko'rib chiqish (har bosqichda: tasdiqlash / o'zgartirish bilan tasdiqlash / rad etish / qo'shimcha ma'lumot so'rash)
- **Geometriya versiyalash:** admin chizmani o'zgartirsa, tadbirkordan rozilik so'raladi
- **Avtomatik shartnoma:** yakuniy tasdiqdan so'ng shartnoma va PDF avtomatik yaratiladi
- **Hududlar xaritasi, monitoring, hisobotlar, to'lovlar** — admin panelda

## Loyiha tuzilishi

```
backend/    Express API, MongoDB modellari, biznes-mantiq (geo-validatsiya, narx hisoblash, workflow)
frontend/   React + Vite admin va tadbirkor kabinetlari
roadmap/    Texnik topshiriqlar (TZ) va rejalashtirish hujjatlari
```

## Ishga tushirish

### Talablar
- Node.js 20+
- MongoDB (lokal yoki masofaviy)

### O'rnatish

```bash
npm install
cp .env.example backend/.env   # va qiymatlarni to'ldiring
```

### Test ma'lumotlarini yuklash

```bash
npm run seed
```

Namunaviy foydalanuvchilar (parol: `parol123`):

| Rol          | Telefon        |
|--------------|----------------|
| Super admin  | +998900000001  |
| Kadastr      | +998900000002  |
| Tadbirkor    | +998900000003  |
| Arxitektura  | +998900000004  |
| Soliq        | +998900000005  |

### Development rejimida ishga tushirish

```bash
npm run dev
```

Bu backend (`:5000`) va frontend (`:5173`) serverlarini bir vaqtda ishga tushiradi.

## Litsenziya

Ichki loyiha — barcha huquqlar himoyalangan.
