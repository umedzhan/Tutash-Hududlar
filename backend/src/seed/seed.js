import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Company from '../models/Company.js';
import Region from '../models/Region.js';
import Application from '../models/Application.js';
import Contract from '../models/Contract.js';
import Payment from '../models/Payment.js';
import Monitoring from '../models/Monitoring.js';
import Notification from '../models/Notification.js';
import District from '../models/District.js';
import Zone from '../models/Zone.js';
import Purpose from '../models/Purpose.js';
import Tariff from '../models/Tariff.js';
import RestrictedArea from '../models/RestrictedArea.js';
import InspectionResult from '../models/InspectionResult.js';
import LandViolation from '../models/LandViolation.js';

import {
  ROLES,
  REGION_STATUS,
  APPLICATION_STATUS,
  CONTRACT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  MONITORING_STATUS,
  VIOLATION_STATUS,
} from '../constants.js';
import { validateGeometry } from '../services/geoValidation.js';
import { calculatePrice } from '../services/pricing.js';
import { decideStage, initStages } from '../services/applicationWorkflow.js';
import { autoGenerateContract } from '../controllers/contractController.js';
import { generateContractPdf } from '../services/contractPdf.js';
import {
  DISTRICTS as SURXONDARYO_DISTRICTS,
  ZONES_BY_DISTRICT as SURXONDARYO_ZONES_BY_DISTRICT,
  REFERENCE_BASE_RATE as SURXONDARYO_REFERENCE_BASE_RATE,
} from './surxondaryoZones.js';

function squarePolygon(centerLng, centerLat, sizeDeg) {
  const half = sizeDeg / 2;
  const ring = [
    [centerLng - half, centerLat - half],
    [centerLng + half, centerLat - half],
    [centerLng + half, centerLat + half],
    [centerLng - half, centerLat + half],
    [centerLng - half, centerLat - half],
  ];
  return { type: 'Polygon', coordinates: [ring] };
}

const TERMIZ_CENTER = { lng: 67.278, lat: 37.224 };

const STREET_ADDRESSES = [
  'Alisher Navoiy ko\'chasi 12',
  'Alisher Navoiy ko\'chasi 25',
  'Istiqlol ko\'chasi 45',
  'Istiqlol ko\'chasi 60',
  'Amir Temur ko\'chasi 8',
  'Amir Temur ko\'chasi 18',
  'Mustaqillik ko\'chasi 3',
  'Mustaqillik ko\'chasi 21',
  'Bunyodkor ko\'chasi 5',
  'Bunyodkor ko\'chasi 14',
  'Yoshlik ko\'chasi 9',
  'Yoshlik ko\'chasi 33',
  'Sohibqiron ko\'chasi 7',
  'Sohibqiron ko\'chasi 40',
  'Termiz markaziy bozori yaqinida',
  'Termiz davlat universiteti yaqinida',
  'Do\'stlik ko\'chasi 11',
  'Do\'stlik ko\'chasi 22',
  'Navro\'z ko\'chasi 6',
  'Navro\'z ko\'chasi 19',
  'Bog\'ishamol ko\'chasi 2',
  'Bog\'ishamol ko\'chasi 17',
  'Chorsu ko\'chasi 13',
  'Chorsu ko\'chasi 28',
];

async function run() {
  await connectDb();

  console.log('[seed] eski ma\'lumotlar tozalanmoqda...');
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Region.deleteMany({}),
    Application.deleteMany({}),
    Contract.deleteMany({}),
    Payment.deleteMany({}),
    Monitoring.deleteMany({}),
    Notification.deleteMany({}),
    District.deleteMany({}),
    Zone.deleteMany({}),
    Purpose.deleteMany({}),
    Tariff.deleteMany({}),
    RestrictedArea.deleteMany({}),
    InspectionResult.deleteMany({}),
    LandViolation.deleteMany({}),
  ]);

  console.log('[seed] kompaniya va foydalanuvchilar yaratilmoqda...');
  const company = await Company.create({
    name: 'Alisher Navoiy MChJ',
    stir: '304123456',
    director: 'Alisher Navoiyev',
    phones: ['+998712031000'],
  });

  const passwordHash = await bcrypt.hash('parol123', 10);

  const adminUser = await User.create({
    name: 'Admin',
    phone: '+998900000001',
    passwordHash,
    role: ROLES.SUPER_ADMIN,
    status: 'offlayn',
  });

  const kadastrUser = await User.create({
    name: 'Kadastr xodimi',
    phone: '+998900000002',
    passwordHash,
    role: ROLES.KADASTR,
    status: 'offlayn',
  });

  const tadbirkorUser = await User.create({
    name: 'Alisher Navoiy MChJ',
    phone: '+998900000003',
    passwordHash,
    role: ROLES.TADBIRKOR,
    companyId: company._id,
    status: 'offlayn',
  });

  const arxitekturaUser = await User.create({
    name: 'Arxitektura xodimi',
    phone: '+998900000004',
    passwordHash,
    role: ROLES.ARXITEKTURA,
    status: 'offlayn',
  });

  const soliqUser = await User.create({
    name: 'Soliq xodimi',
    phone: '+998900000005',
    passwordHash,
    role: ROLES.SOLIQ,
    status: 'offlayn',
  });

  console.log('[seed] ma\'lumotnomalar (tuman, zonalar, maqsadlar, tarif) yaratilmoqda...');

  // Surxondaryo viloyati bo'yicha 15 ta tuman/shahar va ularning mahalla (zona)
  // koeffitsiyentlari — roadmap/qaror/*.pdf dagi 2026-yil yer solig'i qarorlaridan
  // (batafsil izoh surxondaryoZones.js faylida). Aniq GIS chegaralari mavjud
  // bo'lmagani uchun tadbirkor mahallani nomi bo'yicha ro'yxatdan tanlaydi.
  // Ktuman 6 xonagacha aniqlik bilan hisoblanadi — 2 xonali yaxlitlash Sbaza x Ktuman x
  // Kzona zanjirida ~0,1% xatolik berib, yakuniy narxni manbadagi (surxondaryoZones.js)
  // aniq mahalla stavkasidan chetlatgan edi.
  const districtDocs = {};
  for (const d of SURXONDARYO_DISTRICTS) {
    const coefficient = Math.round((d.baseRate / SURXONDARYO_REFERENCE_BASE_RATE) * 1e6) / 1e6;
    districtDocs[d.code] = await District.create({ name: d.name, code: d.code, coefficient });
  }
  const district = districtDocs.TERMIZ_SH;

  let zones = [];
  for (const [code, list] of Object.entries(SURXONDARYO_ZONES_BY_DISTRICT)) {
    const created = await Zone.insertMany(
      list.map(([name, coefficient]) => ({ districtId: districtDocs[code]._id, name, coefficient })),
    );
    zones = zones.concat(created);
  }
  const defaultZone = zones.find((z) => z.name === 'Alisher Navoiy' && String(z.districtId) === String(district._id));

  const purposeSavdo = await Purpose.create({ name: "Savdo va xizmat ko'rsatish", coefficient: 1.0, seasonalAllowed: false });
  await Purpose.create({ name: 'Umumiy ovqatlanish (terrassa)', coefficient: 1.3, seasonalAllowed: true });
  await Purpose.create({ name: 'Avtoturargoh', coefficient: 0.9, seasonalAllowed: false });
  await Purpose.create({ name: 'Mavsumiy savdo', coefficient: 1.1, seasonalAllowed: true });
  await Purpose.create({ name: 'Reklama konstruksiyasi', coefficient: 1.5, seasonalAllowed: false });

  // Sbaza — eng past tumandagi (Ktuman=1.0) yillik bazaviy yer solig'i stavkasi
  // (REFERENCE_BASE_RATE, so'm/m²/yil, jismoniy shaxslar uchun 1 kv.m stavkasidan —
  // surxondaryoZones.js). Ijara yiliga bir marta to'lanadi, shuning uchun Sbaza ham
  // to'g'ridan-to'g'ri yillik miqdorda olinadi (oylikka bo'linmaydi). Manbadagi aniqlikni
  // saqlab qolish uchun yaxlitlanmaydi — Sbaza x Ktuman x Kzona = mahalla stavkasi.
  const sbaza = SURXONDARYO_REFERENCE_BASE_RATE;

  await Tariff.create({
    baseRate: sbaza,
    seasonalCoefficient: 1.2,
    penaltyRatePerDay: 0.001,
    penaltyCapPercent: 0.15,
    minAreaM2: 5,
    maxAreaM2: 2000,
    validFrom: new Date(new Date().getFullYear() - 1, 0, 1),
  });

  await RestrictedArea.create({
    type: 'road',
    name: 'Chekka yo\'l zonasi',
    geometry: squarePolygon(TERMIZ_CENTER.lng - 0.018, TERMIZ_CENTER.lat + 0.012, 0.0015),
  });

  console.log('[seed] hududlar (avval ro\'yxatga olingan uchastkalar) yaratilmoqda...');
  const statusPlan = [
    ...Array(16).fill(REGION_STATUS.BAND),
    ...Array(6).fill(REGION_STATUS.BOSH),
    ...Array(2).fill(REGION_STATUS.MUAMMOLI),
  ];

  // Dashboard'da tuman/mahalla kesimidagi ko'rsatkichlar mazmunli bo'lishi uchun demo
  // hududlar Termiz shahridagi bir nechta haqiqiy mahallaga taqsimlanadi.
  const termizZones = zones.filter((z) => String(z.districtId) === String(district._id));

  const regions = [];
  for (let i = 0; i < STREET_ADDRESSES.length; i += 1) {
    const offsetLng = (Math.random() - 0.5) * 0.012;
    const offsetLat = (Math.random() - 0.5) * 0.012;
    const size = 0.0004 + Math.random() * 0.0003;
    const areaM2 = Math.round((60 + Math.random() * 180) / 10) * 10;
    const zone = termizZones[i % termizZones.length];

    const region = await Region.create({
      name: `Hudud #${i + 1}`,
      address: STREET_ADDRESSES[i],
      district: district.name,
      region: 'Surxondaryo viloyati',
      districtId: district._id,
      zoneId: zone?._id ?? null,
      geometry: squarePolygon(TERMIZ_CENTER.lng + offsetLng, TERMIZ_CENTER.lat + offsetLat, size),
      areaM2,
      status: statusPlan[i],
    });
    regions.push(region);
  }

  for (let i = 0; i < 2; i += 1) {
    const offsetLng = (Math.random() - 0.5) * 0.012;
    const offsetLat = (Math.random() - 0.5) * 0.012;
    const zone = termizZones[i % termizZones.length];
    await Region.create({
      name: `Avtoturargoh #${i + 1}`,
      address: `Termiz markaziy bozori yaqinida, turargoh ${i + 1}`,
      district: district.name,
      region: 'Surxondaryo viloyati',
      districtId: district._id,
      zoneId: zone?._id ?? null,
      geometry: squarePolygon(TERMIZ_CENTER.lng + offsetLng, TERMIZ_CENTER.lat + offsetLat, 0.0003),
      areaM2: 200,
      status: REGION_STATUS.AVTOTURARGOH,
    });
  }

  const now = new Date();
  const monthsAgo = (n) => new Date(now.getFullYear(), now.getMonth() - n, 21);
  const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  const period = { from: monthsAgo(1), to: new Date(now.getFullYear(), now.getMonth() + 8, 30) };

  // Barcha demo arizalar uchun tadbirkor o'zi poligon chizadi ("markaziy" zonada,
  // mavjud tasodifiy hududlardan uzoqda — ustma-ust tushmasligi uchun)
  const demoLng = TERMIZ_CENTER.lng + 0.016;
  let appCounter = 300;

  async function submitDemoApplication({ user, comp, latOffset, purposeDoc, usageType, comment, zone = defaultZone }) {
    appCounter += 1;
    const geometry = squarePolygon(demoLng, TERMIZ_CENTER.lat + latOffset, 0.0004);
    const { areaM2 } = await validateGeometry({ geometry });
    const priceSnapshot = await calculatePrice({
      areaM2,
      districtId: district._id,
      purposeId: purposeDoc._id,
      zoneId: zone._id,
      usageType,
      dateFrom: period.from,
      dateTo: period.to,
    });
    const applicationNumber = `ARZ-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(appCounter).padStart(5, '0')}`;
    const application = await Application.create({
      applicationNumber,
      applicantId: user._id,
      companyId: comp._id,
      districtId: district._id,
      zoneId: zone._id,
      purposeId: purposeDoc._id,
      purpose: purposeDoc.name,
      usageType,
      period,
      comment,
      address: `${district.name} — tadbirkor tomonidan chizilgan hudud`,
      geometry,
      areaM2,
      geometryVersions: [
        {
          version: 1,
          geometry,
          areaM2,
          authorType: 'business',
          authorId: user._id,
          changeNote: '',
          acceptedByBusiness: true,
          createdAt: new Date(),
        },
      ],
      currentStage: 'cadastre',
      stages: initStages(),
      priceSnapshot,
      status: APPLICATION_STATUS.IN_REVIEW_CADASTRE,
      history: [
        { status: APPLICATION_STATUS.IN_REVIEW_CADASTRE, date: new Date(), byUserId: user._id, comment: 'Ariza yuborildi' },
      ],
    });
    return application;
  }

  console.log('[seed] namunaviy arizalar (turli holatlarda) yaratilmoqda...');

  const otherCompany1 = await Company.create({ name: '"Oq oltin" MChJ', stir: '304987654', director: 'Bekzod Rahimov', phones: ['+998911112233'] });
  const otherCompany2 = await Company.create({ name: '"Baraka savdo" MChJ', stir: '304987655', director: 'Jasur Aliyev', phones: ['+998911112244'] });
  const otherCompany3 = await Company.create({ name: '"Zarafshon food" MChJ', stir: '304987656', director: 'Otabek Karimov', phones: ['+998911112255'] });
  const otherCompany4 = await Company.create({ name: '"Mega servis" MChJ', stir: '304987657', director: 'Dilshod Yusupov', phones: ['+998911112266'] });

  const otherUser1 = await User.create({ name: 'Bekzod Rahimov', phone: '+998911112233', passwordHash, role: ROLES.TADBIRKOR, companyId: otherCompany1._id });
  const otherUser2 = await User.create({ name: 'Jasur Aliyev', phone: '+998911112244', passwordHash, role: ROLES.TADBIRKOR, companyId: otherCompany2._id });
  const otherUser3 = await User.create({ name: 'Otabek Karimov', phone: '+998911112255', passwordHash, role: ROLES.TADBIRKOR, companyId: otherCompany3._id });
  const otherUser4 = await User.create({ name: 'Dilshod Yusupov', phone: '+998911112266', passwordHash, role: ROLES.TADBIRKOR, companyId: otherCompany4._id });

  // 1) To'liq faol (ACTIVE) shartnoma bilan — tadbirkorning o'z hisobidagi asosiy demo
  const activeApp = await submitDemoApplication({
    user: tadbirkorUser,
    comp: company,
    latOffset: -0.012,
    purposeDoc: purposeSavdo,
    usageType: 'Doimiy',
    comment: "Do'kon uchun",
  });
  decideStage(activeApp, { stage: 'cadastre', decision: 'approve', note: 'Chegaralar to\'g\'ri', byUserId: kadastrUser._id });
  await activeApp.save();
  decideStage(activeApp, { stage: 'architecture', decision: 'approve', note: 'Me\'yorlarga mos', byUserId: arxitekturaUser._id });
  await activeApp.save();
  decideStage(activeApp, { stage: 'tax', decision: 'approve', note: 'Qarzdorlik yo\'q', byUserId: soliqUser._id });
  await activeApp.save();
  const finalResult = decideStage(activeApp, { stage: 'final', decision: 'approve', note: 'Yakuniy tasdiqlandi', byUserId: adminUser._id });
  await activeApp.save();
  if (finalResult.finalApproved) {
    const fakeReq = { user: { id: adminUser._id.toString() }, ip: '127.0.0.1' };
    const contract = await autoGenerateContract(activeApp, fakeReq);

    const signature = { signed: true, signedAt: monthsAgo(1), mockSignatureId: 'MOCK-SEED-0001-SIGNATURE-ID' };
    contract.eSign = signature;
    contract.status = CONTRACT_STATUS.FAOL;

    const signedRegion = await Region.findById(contract.hududId);
    const tariffDoc = await Tariff.findById(contract.priceSnapshot.tariffId);
    contract.pdfPath = await generateContractPdf({
      contract,
      region: signedRegion,
      company,
      district,
      zone: defaultZone,
      purpose: purposeSavdo,
      tariff: tariffDoc,
    });
    await contract.save();

    activeApp.status = APPLICATION_STATUS.SIGNED;
    activeApp.history.push({ status: APPLICATION_STATUS.SIGNED, date: monthsAgo(1), byUserId: tadbirkorUser._id, comment: "E-IMZO bilan imzolandi" });
    activeApp.status = APPLICATION_STATUS.ACTIVE;
    activeApp.history.push({ status: APPLICATION_STATUS.ACTIVE, date: monthsAgo(1), byUserId: adminUser._id, comment: 'Shartnoma faollashtirildi' });
    await activeApp.save();

    await Region.findByIdAndUpdate(contract.hududId, { status: REGION_STATUS.BAND, currentContractId: contract._id });

    for (let i = 1; i >= 0; i -= 1) {
      await Payment.create({
        contractId: contract._id,
        type: PAYMENT_TYPE.RENT,
        amount: contract.total,
        dueDate: monthsAgo(i),
        paidDate: monthsAgo(i),
        status: PAYMENT_STATUS.TOLANGAN,
        method: 'click',
        transactionRef: `MOCK-PAID-${i}`,
      });
    }
    await Payment.create({
      contractId: contract._id,
      type: PAYMENT_TYPE.RENT,
      amount: contract.total,
      dueDate: daysFromNow(10),
      status: PAYMENT_STATUS.KUTILMOQDA,
      method: 'click',
    });

    await Monitoring.create({
      hududId: contract.hududId,
      contractId: contract._id,
      inspectionDate: daysFromNow(-5),
      status: MONITORING_STATUS.MUVOFIQ,
      inspectorId: adminUser._id,
      notes: 'Hudud shartnoma shartlariga muvofiq ishlatilmoqda.',
    });
  }

  // 2) Yangi, hali ko'rib chiqilmagan (kadastr navbatida)
  await submitDemoApplication({
    user: otherUser1,
    comp: otherCompany1,
    latOffset: -0.008,
    purposeDoc: purposeSavdo,
    usageType: 'Doimiy',
    comment: 'Savdo do\'koni ochish uchun',
  });

  // 3) Arxitektura bosqichida chizma tuzatilgan — tadbirkor roziligini kutmoqda
  const consentApp = await submitDemoApplication({
    user: otherUser2,
    comp: otherCompany2,
    latOffset: -0.004,
    purposeDoc: purposeSavdo,
    usageType: 'Doimiy',
    comment: 'Xizmat ko\'rsatish shoxobchasi',
  });
  decideStage(consentApp, { stage: 'cadastre', decision: 'approve', note: 'Chegaralar to\'g\'ri', byUserId: kadastrUser._id });
  await consentApp.save();
  const adjustedGeometry = squarePolygon(demoLng + 0.00006, TERMIZ_CENTER.lat - 0.004, 0.00035);
  const { areaM2: adjustedArea } = await validateGeometry({ geometry: adjustedGeometry, excludeApplicationId: consentApp._id });
  decideStage(consentApp, {
    stage: 'architecture',
    decision: 'approve_with_changes',
    note: "Chegara yo'lakdan 1 metr ichkariga suriltirildi",
    geometryVersion: { geometry: adjustedGeometry, areaM2: adjustedArea },
    byUserId: arxitekturaUser._id,
  });
  await consentApp.save();

  // 4) Kadastr bosqichida qo'shimcha hujjat so'ralgan
  const infoApp = await submitDemoApplication({
    user: otherUser3,
    comp: otherCompany3,
    latOffset: 0.0,
    purposeDoc: purposeSavdo,
    usageType: 'Doimiy',
    comment: 'Umumiy ovqatlanish shoxobchasi',
  });
  decideStage(infoApp, {
    stage: 'cadastre',
    decision: 'request_info',
    note: "Uchastka egaligini tasdiqlovchi qo'shimcha hujjat talab qilinadi",
    byUserId: kadastrUser._id,
  });
  await infoApp.save();

  // 5) Arxitektura bosqichida rad etilgan
  const rejectedApp = await submitDemoApplication({
    user: otherUser4,
    comp: otherCompany4,
    latOffset: 0.004,
    purposeDoc: purposeSavdo,
    usageType: 'Doimiy',
    comment: 'Reklama konstruksiyasi',
  });
  decideStage(rejectedApp, { stage: 'cadastre', decision: 'approve', note: 'Chegaralar to\'g\'ri', byUserId: kadastrUser._id });
  await rejectedApp.save();
  decideStage(rejectedApp, {
    stage: 'architecture',
    decision: 'reject',
    note: "Qizil chiziq zonasiga juda yaqin, shaharsozlik normalariga mos emas",
    byUserId: arxitekturaUser._id,
  });
  await rejectedApp.save();

  console.log('[seed] xatlov natijalari va noqonuniy foydalanish reestri yaratilmoqda...');
  const inspection1 = await InspectionResult.create({
    module: 'kadastr',
    inspectionDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    inspectorId: kadastrUser._id,
    address: 'Termiz shahri, Bog\'ishamol ko\'chasi yaqinidagi bo\'sh yer',
    location: { lat: TERMIZ_CENTER.lat + 0.02, lng: TERMIZ_CENTER.lng - 0.01 },
    areaM2: 340,
    districtId: district._id,
    description: 'Dala tekshiruvi natijasida uchastkada ruxsatsiz qurilish belgilari aniqlandi.',
  });
  await InspectionResult.create({
    module: 'soliq',
    inspectionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    inspectorId: soliqUser._id,
    address: 'Termiz shahri, Alisher Navoiy mahallasi hududi',
    location: { lat: TERMIZ_CENTER.lat - 0.015, lng: TERMIZ_CENTER.lng + 0.02 },
    areaM2: 120,
    districtId: district._id,
    description: 'Soliq organi tekshiruvida shartnomasiz savdo faoliyati aniqlandi.',
  });

  await LandViolation.create({
    module: 'kadastr',
    inspectionId: inspection1._id,
    address: inspection1.address,
    location: inspection1.location,
    areaM2: inspection1.areaM2,
    districtId: district._id,
    detectedDate: inspection1.inspectionDate,
    status: VIOLATION_STATUS.TEKSHIRILMOQDA,
    description: 'Ruxsatsiz qurilish tufayli holat qo\'shimcha tekshirilmoqda.',
    inspectorId: kadastrUser._id,
  });
  await LandViolation.create({
    module: 'soliq',
    address: 'Termiz shahri, Sharq bozori orqa hududi',
    location: { lat: TERMIZ_CENTER.lat + 0.008, lng: TERMIZ_CENTER.lng + 0.03 },
    areaM2: 85,
    districtId: district._id,
    detectedDate: new Date(Date.now() - 40 * 24 * 3600 * 1000),
    status: VIOLATION_STATUS.BARTARAF_ETILGAN,
    description: 'Shartnomasiz egallab olingan savdo maydonchasi.',
    inspectorId: soliqUser._id,
    resolutionNote: 'Uchastka bo\'shatildi, tadbirkor rasmiy ariza orqali qonuniy ijaraga o\'tdi.',
    resolvedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
  });

  console.log('[seed] xabarnomalar yaratilmoqda...');
  await Notification.create([
    { userId: tadbirkorUser._id, type: 'payment', message: 'Keyingi to\'lov muddati yaqinlashmoqda.' },
    { userId: tadbirkorUser._id, type: 'application', message: 'Arizangiz faollashtirildi.' },
    { userId: tadbirkorUser._id, type: 'info', message: 'Platformaga xush kelibsiz!' },
    { userId: kadastrUser._id, type: 'application', message: 'Yangi ariza ko\'rib chiqishni kutmoqda.' },
    { userId: arxitekturaUser._id, type: 'application', message: 'Sizning navbatingizda ariza bor.' },
  ]);

  console.log('[seed] tayyor!');
  console.log('----------------------------------------');
  console.log('Super admin:   +998900000001 / parol123');
  console.log('Kadastr:       +998900000002 / parol123');
  console.log('Tadbirkor:     +998900000003 / parol123');
  console.log('Arxitektura:   +998900000004 / parol123');
  console.log('Soliq:         +998900000005 / parol123');
  console.log('----------------------------------------');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] xatolik:', err);
  process.exit(1);
});
