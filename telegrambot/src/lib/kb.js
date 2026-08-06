/* =====================================================================
   TUTASH HUDUDLAR — qoidalarga asoslangan chatbot (bilimlar bazasi)
   frontend/src/components/chatbot/kb.ts dan Telegram bot uchun portlangan
   (TypeScript turlari olib tashlangan, mantiq o'zgarmagan).
   ===================================================================== */
import { MAHALLA } from './mahallaData.js';

/* ---------- Tuman kesimida 2026-yil bazaviy yer solig'i stavkalari ---------- */
export const DISTRICTS = {
  'termiz shahri': { keys: ['termiz shah', 'termiz sh'], yur: '57,68 mln so‘m (1 ga)', jis: '522,59 so‘m (1 kv.m)', extra: 'Mahallalar kesimida 0,7–3,0 gacha kamaytiruvchi/oshiruvchi koeffitsiyentlar qo‘llaniladi. Yuridik shaxslar mol-mulk solig‘i minimal qiymati: viloyat markazida 1 kv.m uchun 2 350 000 so‘m.' },
  'termiz tumani': { keys: ['termiz tuman'], yur: '52,78 mln so‘m (1 ga)', jis: '427,3 so‘m (1 kv.m)', extra: 'Mahallalar kesimida 0,7–3,0 koeffitsiyentlar qo‘llaniladi.' },
  angor: { keys: ['angor', 'ангор'], yur: '48,07 mln so‘m (1 ga)', jis: '441,38 so‘m (1 kv.m)', extra: 'Mahallalar kesimida kamaytiruvchi/oshiruvchi koeffitsiyentlar qo‘llaniladi.' },
  'jarqo‘rg‘on': { keys: ['jarqorgon', 'jarqo', 'жарқўрғон'], yur: '52,78 mln so‘m (1 ga)', jis: '441,38 so‘m (1 kv.m)', extra: 'Mahallalar kesimida koeffitsiyentlar qo‘llaniladi.' },
  oltinsoy: { keys: ['oltinsoy', 'олтинсой'], yur: '35 856 888 so‘m (1 ga)', jis: '319,04 so‘m (1 kv.m)', extra: 'Mahallalar kesimida koeffitsiyentlar qo‘llaniladi.' },
  qiziriq: { keys: ['qiziriq', 'kiziriq', 'қизириқ'], yur: '43 355 000 so‘m (1 ga)', jis: '388,41 so‘m (1 kv.m)', extra: 'Suv resurslari va yer qa’ridan foydalanish soliqlariga ham koeffitsiyentlar belgilangan (SK 429-, 437-, 445-, 452-moddalar).' },
  sherobod: { keys: ['sherobod', 'шеробод'], yur: '43 355 000 so‘m (1 ga)', jis: '402,53 so‘m (1 kv.m)', extra: 'Mahallalar kesimida 0,7–3,0 koeffitsiyentlar qo‘llaniladi.' },
  'sho‘rchi': { keys: ['shorchi', 'shurchi', 'шўрчи'], yur: '43 355 000 so‘m (1 ga)', jis: '388,41 so‘m (1 kv.m)', extra: 'Mahallalar kesimida koeffitsiyentlar qo‘llaniladi.' },
  bandixon: { keys: ['bandixon', 'bandikhon', 'бандихон'], yur: '43 355 000 so‘m (1 ga)', jis: '388,41 so‘m (1 kv.m)', extra: 'Mahallalar kesimida koeffitsiyentlar qo‘llaniladi.' },
  sariosiyo: { keys: ['sariosiyo', 'сариосиё'], yur: '49 010 000 so‘m atrofida (1 ga)', jis: '402 so‘m atrofida (1 kv.m)', extra: 'Mol-mulk solig‘i minimal qiymati: tuman markazi va qishloq joylarda 1 kv.m uchun 1 390 000 so‘m.' },
  uzun: { keys: ['uzun', 'узун'], yur: 'Kengash qarorida mahallalar kesimida koeffitsiyentlar bilan belgilangan', jis: 'Kengash qarorida mahallalar kesimida belgilangan', extra: 'Mol-mulk minimal qiymati: boshqa shahar va qishloq joylarda 1 kv.m uchun 1 390 000 so‘m.' },
  muzrabot: { keys: ['muzrabot', 'музработ'], yur: 'Soliq kodeksi bazaviy stavkalari asosida, mahallalar kesimida koeffitsiyentlar bilan', jis: 'Mahallalar kesimida koeffitsiyentlar bilan', extra: 'Suv resurslari va yer qa’ridan foydalanish soliqlariga ham koeffitsiyentlar belgilangan.' },
  denov: { keys: ['denov', 'денов', 'denau'], yur: 'Soliq kodeksi bazaviy stavkalari asosida, mahallalar kesimida koeffitsiyentlar bilan', jis: 'Mahallalar kesimida koeffitsiyentlar bilan', extra: 'Aniq stavka o‘z mahallangiz bo‘yicha tuman soliq inspeksiyasidan aniqlanadi.' },
  boysun: { keys: ['boysun', 'бойсун'], yur: 'Soliq kodeksi bazaviy stavkalari asosida, mahallalar kesimida koeffitsiyentlar bilan', jis: 'Mahallalar kesimida koeffitsiyentlar bilan', extra: 'Aniq stavka tuman soliq inspeksiyasidan aniqlanadi.' },
  'qumqo‘rg‘on': { keys: ['qumqorgon', 'qumqo', 'кумкурган', 'қумқўрғон'], yur: 'Soliq kodeksi bazaviy stavkalari asosida (SK 412-, 422-, 429-, 437-, 445-moddalar)', jis: 'Mahallalar kesimida koeffitsiyentlar bilan', extra: 'Yer, suv va yer qa’ri soliqlari stavkalari tuman Kengashi qarorida belgilangan.' },
};

/* DISTRICTS kaliti -> MAHALLA sarlavhasi */
export const DIST2DOC = {
  'termiz shahri': 'Termiz shahri', 'termiz tumani': 'Termiz tumani', angor: 'Angor tumani',
  'jarqo‘rg‘on': 'Jarqo‘rg‘on tumani', oltinsoy: 'Oltinsoy tumani', qiziriq: 'Qiziriq tumani',
  sherobod: 'Sherobod tumani', 'sho‘rchi': 'Sho‘rchi tumani', bandixon: 'Bandixon tumani',
  sariosiyo: 'Sariosiyo tumani', uzun: 'Uzun tumani', muzrabot: 'Muzrabot tumani',
  denov: 'Denov tumani', boysun: 'Boysun tumani', 'qumqo‘rg‘on': 'Qumqo‘rg‘on tumani',
};

/* ---------- Bilimlar bazasi (intentlar) ---------- */
export const KB = [
  {
    id: 'greet',
    keys: ['salom', 'assalomu', 'alaykum', 'assalom', 'hello', 'salam', 'hi ', 'hayrli kun', 'xayrli'],
    a: () => `Assalomu alaykum! 👋 Men <b>«Tutash Hududlar» elektron platformasi</b>ning yordamchi botiman.<br><br>Sizga quyidagi mavzularda yordam bera olaman:<ul><li>Tutash hududlardan <b>mavsumiy foydalanish</b> tartibi</li><li><b>Ijara shartnomasi</b> va to‘lovlar</li><li>Ariza berish va <b>xatlov</b> jarayoni</li><li>Tumanlar bo‘yicha <b>2026-yil yer solig‘i stavkalari</b></li><li>Taqiq va talablar (dizayn-kod, qurilish cheklovlari)</li></ul>Savolingizni yozing yoki quyidagi tugmalardan birini tanlang.`,
  },
  {
    id: 'about',
    keys: ['platforma', 'sayt', 'tutash hudud nima', 'nima bu', 'vazifasi', 'maqsad', 'haqida', 'tizim nima', 'qanday tizim', 'nima uchun kerak'],
    a: () => `<b>«Tutash Hududlar» (surxondaryo-th.uz)</b> — Surxondaryo viloyatida tadbirkorlik subyektlariga o‘z bino-inshootlari va yer uchastkalariga <b>tutash bo‘lgan umumiy foydalanishdagi yerlardan mavsumiy foydalanish</b>ni tashkil etuvchi elektron platforma.<br><br>Platforma imkoniyatlari:<ul><li>Tutash yer uchastkalari <b>hisobini yuritish</b></li><li>Mavsumiy foydalanish bo‘yicha <b>arizalarni elektron qabul qilish</b></li><li><b>Ijara shartnomalarini</b> onlayn tuzish</li><li>Shartnoma shartlari bajarilishini <b>monitoring</b> qilish</li></ul>2025-yil 1-oktabrdan boshlab umumiy ovqatlanish, savdo va xizmat ko‘rsatish sohasidagi tadbirkorlar o‘z obyektlariga tutash davlat yerlaridan haq evaziga ijara asosida foydalanishlari mumkin.<span class="src">Manba: VM 478-son qarori (31.07.2025); viloyat hokimining 79-8-0-F/26-son farmoyishi (08.05.2026)</span>`,
  },
  {
    id: 'who',
    keys: ['kim foydalanishi', 'kimlar', 'kim ariza', 'huquqi bor', 'foydalanish mumkinmi', 'tadbirkor', 'subyekt', 'yakka tartib', 'mchj', 'qatnash'],
    a: () => `Tutash hududlardan mavsumiy foydalanish huquqiga <b>umumiy ovqatlanish, savdo va xizmat ko‘rsatish</b> sohasidagi tadbirkorlik subyektlari ega:<ul><li>Kafe, restoran, choyxona, oshxonalar</li><li>Do‘kon va savdo shoxobchalari</li><li>Xizmat ko‘rsatish obyektlari</li></ul><b>Shartlar:</b><ul><li>Yer uchastkasi tadbirkorning o‘z bino/inshooti yoki yer uchastkasiga <b>tutash</b> yoki undan <b>5 metrdan uzoq bo‘lmagan</b> bo‘sh maydon bo‘lishi kerak</li><li>Hudud tuman hokimligining tasdiqlangan <b>joylashtirish sxemasiga</b> kiritilgan bo‘lishi lozim</li></ul>❗ <b>Istisno:</b> sog‘liqni saqlash, ta’lim va maktabgacha ta’lim tashkilotlariga tegishli yer uchastkalari ijaraga berilmaydi.<span class="src">Manba: VM 478-son qarori</span>`,
  },
  {
    id: 'contract',
    keys: ['shartnoma', 'ijara shartnoma', 'tuzish', 'tuziladi', 'rasmiylashtir', 'muddat', 'necha yil', 'qancha muddat', 'uzaytirish'],
    a: () => `<b>Ijara shartnomasi tartibi:</b><ul><li>Shartnoma <b>auksion savdolarisiz, to‘g‘ridan-to‘g‘ri</b> tuziladi</li><li>Muddati — <b>bir kalendar yil</b> uchun</li><li>Surxondaryoda shartnoma <b>«Surxondaryo Invest kompaniyasi» AJ</b> bilan elektron platforma orqali tuziladi (yer uchastkalari hokimliklar bilan topshiriq shartnomasi asosida kompaniyaga o‘tkazilgan)</li><li>Shartnomalar Soliq qo‘mitasining ijara shartnomalarini hisobga olish <b>elektron tizimida</b> ro‘yxatga olinadi</li></ul><b>Shartnomada nazarda tutiladi:</b><ul><li>Ijara to‘lovi + ekspluatatsiya va saqlash (obodonlashtirish, soliq va boshqa) xarajatlari</li><li>Tomonlarning huquq-majburiyatlari, «dizayn-kod» talablari</li><li>Qo‘shimcha qurilish taqiqlangani — buzilsa, obyekt buziladi va yangi shartnoma tuzilmaydi</li></ul><span class="src">Manba: VM 478-son qarori; farmoyish 10-band</span>`,
  },
  {
    id: 'payment',
    keys: ['tolov', 'to‘lov', 'tulov', 'ijara haqi', 'narx', 'qancha turadi', 'summa', 'qiymat', 'hisoblanadi', 'baravar'],
    a: () => `<b>Ijara to‘lovi qanday hisoblanadi?</b><br><br>Ijara to‘lovi yerning <b>har bir kvadrat metri</b> uchun yer solig‘i stavkasi asosida hisoblanadi:<br><br><b>Yillik ijara = mahalladagi 1 kv.m stavkasi × maydon (kv.m)</b><br><br>Bundan tashqari shartnomada <b>ekspluatatsiya va saqlash to‘lovlari</b> (obodonlashtirish, soliq va boshqa xarajatlar) ham belgilanadi.<br><br>📌 Hisoblash uchun o‘z mahallangizdagi stavkani bilish kerak — menga <b>tuman va mahalla nomini</b> yozing (masalan: «Denov Yangiobod»), 2026-yil stavkasini aytib beraman.<span class="src">Manba: VM 478-son qarori; tuman Kengashlari qarorlari</span>`,
  },
  {
    id: 'tax',
    keys: ['soliq', 'stavka', 'yer soligi', 'solig‘i', 'bazaviy', 'koeffitsiyent', 'mol-mulk', '2026'],
    awaitsDistrict: true,
    a: () => `Albatta! 📍 Aniq stavkani aytishim uchun avval <b>qaysi hudud (tuman yoki shahar)</b>dan ekanligingizni ayting.<br><br>Quyidagilardan tanlang yoki yozing (masalan: <i>«Denov»</i>, <i>«Termiz shahri»</i>). Mahallangiz nomini ham qo‘shsangiz (masalan: <i>«Denov Yangiobod»</i>), aynan shu mahalla stavkasini topib beraman.`,
  },
  {
    id: 'apply',
    keys: ['ariza', 'qanday beriladi', 'topshirish', 'royxatdan', 'ro‘yxat', 'qadam', 'bosqich', 'qanday olsam', 'olish tartibi', 'murojaat qilish', 'hujjat'],
    a: () => `<b>Tutash hududdan foydalanish uchun qadamlar:</b><ul><li><b>1.</b> Botda /royxat orqali ro‘yxatdan o‘ting</li><li><b>2.</b> Mavsumiy foydalanish bo‘yicha <b>elektron ariza</b> yuboring — tuman, mahalla, faoliyat turi, kadastr raqami va hudud rasmlarini kiriting</li><li><b>3.</b> Kadastr xodimi hudud chegarasini belgilaydi, so‘ng arxitektura va soliq xodimlari ko‘rib chiqadi</li><li><b>4.</b> Chegara belgilangach botga xabar keladi — rozilik bildirasiz</li><li><b>5.</b> Yakuniy tasdiqdan so‘ng <b>ijara shartnomasi</b> avtomatik tuziladi va botga PDF sifatida yuboriladi</li><li><b>6.</b> Shartnomani <b>ijara.soliq.uz</b> saytiga kirib tasdiqlaysiz</li></ul><span class="src">Manba: farmoyish 3-, 5-, 10-bandlari</span>`,
  },
  {
    id: 'ban',
    keys: ['taqiq', 'mumkin emas', 'qurilish', 'kapital', 'qurish', 'buzish', 'cheklov', 'ruxsat berilmaydi', 'imorat', 'bino qurish'],
    a: () => `<b>Taqiqlar va cheklovlar:</b><ul><li>Yerni ijaraga olish <b>mulk huquqini bermaydi</b> — bu yer ajratish (realizatsiya) hisoblanmaydi</li><li><b>Kapital bino va inshootlar qurish mumkin emas</b></li><li>Ko‘chmas mulkka huquqlarni davlat ro‘yxatidan o‘tkazish huquqini bermaydi</li><li>«Dizayn-kod»ga zid har qanday qo‘shimcha qurilish, fasad va konstruksiyalarni o‘zgartirish <b>taqiqlanadi</b></li><li>Qoidabuzarlik aniqlansa: obyekt belgilangan tartibda <b>buziladi</b>, shartnoma <b>bekor qilinadi</b> va yangi shartnoma <b>tuzilmaydi</b></li></ul><span class="src">Manba: VM 478-son qarori; farmoyish 10-band</span>`,
  },
  {
    id: 'design',
    keys: ['dizayn', 'dizayn-kod', 'design', 'arxitektura', 'qiyofa', 'fasad', 'talablar', 'loyihalash'],
    a: () => `<b>«Dizayn-kod» nima?</b><br><br>Bu — tijorat faoliyati obyektlarini <b>ko‘cha va binolarga mos arxitektura qiyofasida</b>, aholi uchun qulay va xavfsiz qilib loyihalashga doir yagona talab va tavsiyalar to‘plami.<ul><li>Viloyat arxitektura-shaharsozlik kengashi tomonidan tasdiqlanadi</li><li>Joylashtirish sxemasi va dizayn-kod hokimliklarning <b>rasmiy veb-sahifalarida</b> e’lon qilinadi</li><li>Dizayn-kod asosida loyiha tasdiqlangunga qadar qo‘shimcha qurilishlar qurish taqiqlanadi</li></ul><span class="src">Manba: farmoyish 10-, 11-, 12-bandlari</span>`,
  },
  {
    id: 'audit',
    keys: ['xatlov', 'dalolatnoma', 'ishchi guruh', 'tekshiruv', 'norasmiy', 'royxatga olish', 'inventarizatsiya'],
    a: () => `<b>Xatlov jarayoni:</b><br><br>Tuman (shahar) ishchi guruhlari o‘ziga tegishli bo‘lmagan yerda norasmiy faoliyat yuritayotgan tadbirkorlarni xatlovdan o‘tkazadi:<ul><li><b>1-bosqich:</b> markaziy ko‘chalarda — 2026-yil 15-mayga qadar</li><li><b>2-bosqich:</b> qolgan ko‘chalarda — 2026-yil 1-iyunga qadar</li></ul>Xatlovda <b>dalolatnoma</b> tuziladi (joylashuv, faoliyat turi, egallangan maydon) va platformaga kiritiladi.<br><br>Xatlovda aniqlangan obyektlar yo <b>qonuniy shartnoma</b> tuzadi, yo hudud <b>bo‘shatiladi</b>.<span class="src">Manba: farmoyish 4-, 5-bandlari, 2-, 3-ilovalar</span>`,
  },
  {
    id: 'parking',
    keys: ['avtoturargoh', 'parkovka', 'turargoh', 'mashina', 'avtomobil', 'parking'],
    a: () => `<b>Avtoturargohlar bo‘yicha:</b><br><br>Viloyatda avtotransport ko‘payib borayotgani sababli, aholiga qulaylik uchun avtoturargohlar tashkil qilish maqsadida <b>mavjud avtoturargohlar xatlovi</b> o‘tkazilmoqda:<ul><li>Viloyat miqyosida Muvofiqlashtiruvchi ishchi guruhi tuzilgan</li><li>Tuman (shahar)larda avtoturargohlarni xatlovdan o‘tkazish, chegaralarini belgilash va ro‘yxatlarini shakllantirish bo‘yicha ishchi guruhlar faoliyat yuritadi</li><li>Har yili 1-yanvarga qadar tuman hokimi qarori bilan avtoturargohlarni joylashtirish sxemasi tasdiqlanadi</li></ul><span class="src">Manba: farmoyish 2-, 9-bandlari, 4-, 5-, 6-ilovalar</span>`,
  },
  {
    id: 'legal',
    keys: ['qaror', 'qonun', 'huquqiy', 'asos', 'farmoyish', '478', '151', 'hujjatlar', 'normativ', 'kodeks', 'lex'],
    a: () => `<b>Huquqiy asoslar:</b><ul><li>🏛 VM qarori <b>478-son (31.07.2025)</b> — «Tadbirkorlik subyektlariga tutash hududlardan mavsumiy foydalanishni tashkil etishni yanada soddalashtirish chora-tadbirlari to‘g‘risida» (lex.uz/uz/docs/7659063). 2025-yil 1-oktabrdan kuchda</li><li>🏛 VM qarori <b>151-son (08.04.2026)</b></li><li>📋 Surxondaryo viloyati hokimining <b>79-8-0-F/26-son farmoyishi (08.05.2026)</b> — viloyatda tizimni joriy etish, ishchi guruhlar, xatlov va elektron platforma</li><li>📜 <b>Yer kodeksi 64-moddasi</b> — umumiy foydalanishdagi yerlar</li><li>📜 <b>Soliq kodeksi 412-, 429-, 437-moddalari</b> — mol-mulk va yer solig‘i stavkalari</li><li>🗳 Xalq deputatlari tuman (shahar) Kengashlarining 2026-yil soliq stavkalari to‘g‘risidagi qarorlari</li></ul><span class="src">To‘liq matnlar: lex.uz</span>`,
  },
  {
    id: 'scheme',
    keys: ['sxema', 'joylashtirish', 'qayerda', 'hudud royxati', 'qaysi kocha', 'kocha', 'joy tanlash'],
    a: () => `<b>Joylashtirish sxemasi:</b><ul><li>Tuman hokimliklari kadastr, qurilish va soliq idoralari takliflari asosida tijorat obyektlari va avtoturargohlarni <b>joylashtirish sxemasini</b> tasdiqlaydi</li><li>Sxema har yili <b>1-yanvarga qadar</b> kelgusi yil uchun tasdiqlanadi</li><li>Ko‘cha nomlari ko‘rsatilgan sxema va dizayn-kod hokimliklarning <b>rasmiy veb-sahifalarida</b> doimiy e’lon qilinadi</li></ul>Hududingiz sxemada bor-yo‘qligini tuman hokimligi saytidan yoki platformadagi «Hududlar xaritasi» bo‘limidan tekshirishingiz mumkin.<span class="src">Manba: farmoyish 7-, 9-, 10-, 12-bandlari</span>`,
  },
  {
    id: 'contact',
    keys: ['aloqa', 'telefon', 'bog‘lanish', 'boglanish', 'kontakt', 'manzil', 'kimga murojaat', 'qayerga murojaat', 'yordam', 'operator'],
    a: () => `<b>Murojaat uchun:</b><ul><li>🏢 <b>Surxondaryo viloyati hokimligi</b> — tizimni umumiy muvofiqlashtirish</li><li>🏬 <b>«Surxondaryo Invest kompaniyasi» AJ</b> — ijara shartnomalarini tuzish masalalari</li><li>🏛 <b>Tuman (shahar) hokimliklari</b> — xatlov, joylashtirish sxemasi</li><li>💰 <b>Tuman soliq inspeksiyalari</b> — soliq stavkalari va to‘lovlar</li><li>🗺 <b>Kadastr agentligi viloyat boshqarmasi</b> — yer uchastkalari chegaralari</li></ul>Saytda ham murojaat qilishingiz mumkin: <b>surxondaryo-th.uz</b>`,
  },
  {
    id: 'thanks',
    keys: ['rahmat', 'raxmat', 'tashakkur', 'katta rahmat', 'yaxshi', 'zo‘r', 'tushunarli', 'ok', 'xop'],
    a: () => `Arzimaydi! 😊 Yana savollaringiz bo‘lsa, bemalol yozing — tutash hududlar, shartnomalar, to‘lovlar yoki soliq stavkalari bo‘yicha yordam berishga tayyorman.`,
  },
  {
    id: 'bye',
    keys: ['xayr', 'hayr', 'korishguncha', 'ko‘rishguncha', 'salomat'],
    a: () => `Xayr, salomat bo‘ling! 👋 Ishlaringizga omad. Kerak bo‘lganda yana murojaat qiling — surxondaryo-th.uz`,
  },
];

/* ---------- Chips (bot tugmalari uchun) ---------- */
export const CHIPS = [
  { t: 'Platforma nima?', q: 'Platforma haqida' },
  { t: 'Kimlar foydalanadi?', q: 'Kimlar foydalanishi mumkin' },
  { t: 'Ijara to‘lovi', q: 'Ijara to‘lovi qancha' },
  { t: 'Ariza berish', q: 'Ariza qanday beriladi' },
  { t: 'Soliq stavkalari', q: '2026 yil soliq stavkalari' },
  { t: 'Taqiqlar', q: 'Nimalar taqiqlangan' },
  { t: 'Huquqiy asos', q: 'Qaysi qarorlar asos' },
  { t: 'Aloqa', q: 'Kimga murojaat qilsam' },
];

/* ---------- Normalizatsiya (kirill → lotin, apostroflar) ---------- */
const CYR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
export function norm(s) {
  s = s.toLowerCase();
  s = s.split('').map((c) => (CYR[c] !== undefined ? CYR[c] : c)).join('');
  s = s.replace(/[‘’'`ʻʼ]/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}
export function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------- Soliq: hudud/mahalla javoblari ---------- */
function findDistrict(q) {
  for (const [name, d] of Object.entries(DISTRICTS)) {
    if (d.keys.some((k) => q.includes(norm(k)))) return name;
  }
  return null;
}
function mahallaRows(doc) {
  return MAHALLA[doc] || [];
}
function ijaraCalc(rateStr, m2) {
  const r = parseFloat(rateStr.replace(/\s/g, '').replace(',', '.'));
  if (isNaN(r)) return '—';
  return Math.round(r * m2).toLocaleString('ru-RU').replace(/,/g, ' ') + ' so‘m';
}
function districtAnswer(name, q) {
  const d = DISTRICTS[name];
  const doc = DIST2DOC[name];
  const rows = mahallaRows(doc);
  let q2 = q || '';
  d.keys.concat([norm(name)]).forEach((k) => {
    q2 = q2.split(norm(k)).join(' ');
  });
  q2 = q2.replace(/\s+/g, ' ').trim();
  if (rows.length && q2) {
    const hits = rows.filter((r) => {
      const nm = norm(r[0].replace(/\s*MFY\s*$/i, ''));
      return nm.length > 2 && q2.includes(nm);
    });
    if (hits.length) {
      const lis = hits.map((r) => `<li><b>${r[0]}</b>: 1 kv.m uchun <b>${r[1]} so‘m</b></li>`).join('');
      return `<b>${doc}</b> bo‘yicha topilgan mahalla stavkalari (jismoniy shaxslar, 2026-yil):<ul>${lis}</ul>💡 Ijara to‘lovi: stavka × maydon. Masalan, ${hits[0][0]} mahallasida 20 kv.m maydon uchun yillik ijara ≈ <b>${ijaraCalc(hits[0][1], 20)}</b>.<span class="src">Manba: mahallalar kesimidagi 2026-yil stavkalari jadvali (Kengash qarori ilovasi)</span>`;
    }
  }
  let tbl = '';
  if (rows.length) {
    const trs = rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
    tbl = `<br><b>Mahallalar kesimida stavkalar</b> (jismoniy shaxslar, 1 kv.m uchun, so‘mda):<table><tr><th>Mahalla (MFY)</th><th>1 kv.m (so‘m)</th></tr>${trs}</table>Mahallangiz stavkasini tez topish uchun nomini yozing: masalan, <i>«${name} ${rows[0][0].replace(/\s*MFY\s*$/i, '')}»</i>.`;
  }
  return `<b>${cap(name)} — 2026-yil yer solig‘i stavkalari</b> (qishloq xo‘jaligiga mo‘ljallanmagan yerlar):<ul><li>Yuridik shaxslar (bazaviy): <b>${d.yur}</b></li><li>Jismoniy shaxslar (bazaviy): <b>${d.jis}</b></li></ul>${d.extra}${tbl}<br>💡 Tutash hudud yillik ijara to‘lovi: <b>mahalladagi 1 kv.m stavkasi × maydon</b>.<span class="src">Manba: xalq deputatlari tuman (shahar) Kengashi qarori va mahallalar kesimidagi 2026-yil stavkalari jadvali</span>`;
}
function searchMahallaAll(q) {
  const out = [];
  for (const [doc, rows] of Object.entries(MAHALLA)) {
    for (const r of rows) {
      const nm = norm(r[0].replace(/\s*MFY\s*$/i, ''));
      if (nm.length > 3 && q.includes(nm)) out.push([doc, r[0], r[1]]);
      if (out.length > 8) return out;
    }
  }
  return out;
}

/* ---------- Javob topish ---------- */
export function findAnswer(raw, awaitingDistrict) {
  const q = norm(raw);
  if (!q) return null;

  const dist = findDistrict(q);
  if (dist) {
    return { html: districtAnswer(dist, q), nextAwaitingDistrict: false };
  }

  if (awaitingDistrict) {
    const found = searchMahallaAll(q);
    if (found.length) {
      const lis = found.map((f) => `<li><b>${f[0]}</b>, ${f[1]}: 1 kv.m — <b>${f[2]} so‘m</b></li>`).join('');
      return {
        html: `Mahalla nomi bo‘yicha topilgan stavkalar (jismoniy shaxslar, 2026-yil):<ul>${lis}</ul>Aniqroq javob uchun tuman nomi bilan birga yozing.<span class="src">Manba: mahallalar kesimidagi 2026-yil stavkalari jadvali</span>`,
        nextAwaitingDistrict: false,
      };
    }
    return {
      html: `Kechirasiz, bu hududni topa olmadim. 🗺 Iltimos, Surxondaryo viloyatidagi tuman yoki shahar nomini yozing (masalan: <b>Denov</b>, <b>Sherobod</b>, <b>Termiz shahri</b>).`,
      nextAwaitingDistrict: true,
    };
  }

  const mh = searchMahallaAll(q);
  if (mh.length && /mahalla|mfy|stavka|soliq/.test(q)) {
    const lis = mh.map((f) => `<li><b>${f[0]}</b>, ${f[1]}: 1 kv.m — <b>${f[2]} so‘m</b></li>`).join('');
    return {
      html: `Mahalla bo‘yicha topilgan stavkalar (jismoniy shaxslar, 2026-yil):<ul>${lis}</ul><span class="src">Manba: mahallalar kesimidagi 2026-yil stavkalari jadvali</span>`,
      nextAwaitingDistrict: false,
    };
  }

  let best = null;
  let bestScore = 0;
  for (const item of KB) {
    let s = 0;
    for (const k of item.keys) {
      const nk = norm(k);
      if (q.includes(nk)) s += nk.length >= 6 ? 3 : nk.length >= 4 ? 2 : 1;
    }
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }
  if (best && bestScore > 0) {
    return { html: best.a(), nextAwaitingDistrict: Boolean(best.awaitsDistrict) };
  }
  return null;
}

export const FALLBACK = () =>
  `Kechirasiz, savolingizni to‘liq tushunmadim. 🤔 Men <b>tutash hududlardan mavsumiy foydalanish</b> bo‘yicha maslahat beraman.<br><br>Quyidagicha so‘rashingiz mumkin:<ul><li>«Tutash hudud ijarasi qancha turadi?»</li><li>«Ariza qanday topshiriladi?»</li><li>«Denov tumanida soliq stavkasi qancha?»</li><li>«Nimalarni qurish mumkin emas?»</li></ul>Murakkab holatlar bo‘yicha tuman hokimligi yoki «Surxondaryo Invest kompaniyasi» AJ ga murojaat qilishni maslahat beraman.`;
