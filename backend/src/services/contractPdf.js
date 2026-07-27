import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const UPLOAD_DIR = path.resolve('uploads/contracts');

const MONTH_NAMES = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

const HOKIMIYAT_REKVIZIT = {
  name: 'TERMIZ SHAHAR HOKIMLIGI',
  address: "Surxondaryo viloyati, Termiz shahri, II Do'stlik mahallasi, At-Termiziy ko'chasi, 40",
  stir: '200473934',
  bank: 'MB BB HKKM Toshkent sh',
  mfo: '00014',
};

function formatSom(amount) {
  return `${Math.round(amount).toLocaleString('ru-RU')} so'm`;
}

function formatLongDate(date) {
  const d = new Date(date);
  return `"${d.getDate()}" ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} y.`;
}

function formatShortDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ');
}

function cityLabel(districtName) {
  if (!districtName) return 'Termiz sh.';
  return `${districtName.replace(/\s*shahri$/i, '')} sh.`;
}

function sectionTitle(doc, text) {
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).text(text);
  doc.font('Helvetica').fontSize(10.5);
  doc.moveDown(0.3);
}

function paragraph(doc, text) {
  doc.text(text, { align: 'justify' });
  doc.moveDown(0.5);
}

function fieldLine(doc, label, value) {
  doc.text(`${label}: ${value}`);
}

export async function generateContractPdf({ contract, region, company, district, zone, purpose, tariff }) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `${contract.contractNumber.replace(/\//g, '-')}.pdf`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const breakdown = contract.priceSnapshot?.breakdown ?? {};
  const months = contract.priceSnapshot?.months ?? 1;
  const penaltyPercent = tariff ? (tariff.penaltyRatePerDay * 100).toFixed(2) : '0.10';
  const penaltyCap = tariff ? Math.round(tariff.penaltyCapPercent * 100) : 15;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(15).text(`IJARA SHARTNOMASI No. ${contract.contractNumber}`, { align: 'center' });
    doc.moveDown(1);

    doc.font('Helvetica').fontSize(10.5);
    const dateY = doc.y;
    doc.text(cityLabel(region.district), 56, dateY);
    doc.text(formatLongDate(contract.createdAt ?? new Date()), 56, dateY, { align: 'right' });
    doc.moveDown(1);

    sectionTitle(doc, '1. Umumiy qoidalar');
    paragraph(
      doc,
      `${HOKIMIYAT_REKVIZIT.name} nomidan "Tutash hududlar" elektron platformasi orqali ish yurituvchi (keyingi o'rinlarda "Ijaraga beruvchi" deb yuritiladi) bir tomondan va "${company.name}" (keyingi o'rinlarda "Ijarachi" deb yuritiladi) nomidan Ustav asosida ish yurituvchi direktor ${company.director} ikkinchi tomondan, birgalikda "Tomonlar" deb ataluvchilar, mazkur shartnomani (keyingi o'rinlarda "Shartnoma" deb yuritiladi) O'zbekiston Respublikasi Fuqarolik kodeksining ijara shartnomasiga oid moddalari asosida quyidagilar to'g'risida tuzdilar.`,
    );

    sectionTitle(doc, '2. Shartnoma predmeti');
    paragraph(
      doc,
      "Ijaraga beruvchi quyidagi hudud uchastkasini Ijarachiga vaqtincha egalik qilish va foydalanish huquqi asosida ijaraga beradi, Ijarachi esa uni qabul qilib, belgilangan haqni to'lash majburiyatini oladi:",
    );
    fieldLine(doc, 'Manzil', region.address);
    fieldLine(doc, 'Tuman/shahar', region.district);
    if (zone) fieldLine(doc, 'Mahalla', zone.name);
    fieldLine(doc, 'Maydon', `${contract.areaM2 ?? region.areaM2} m²`);
    if (purpose) fieldLine(doc, 'Foydalanish maqsadi', purpose.name);
    fieldLine(doc, 'Ijara muddati', `${formatShortDate(contract.period.from)} — ${formatShortDate(contract.period.to)}`);
    doc.moveDown(0.5);

    sectionTitle(doc, "3. To'lov shartlari");
    paragraph(
      doc,
      "Ijara haqi amaldagi tarif asosida quyidagi formula bo'yicha hisoblanadi: Oylik ijara = Sbaza x M x Ktuman x Kzona x Kmaqsad x Kmavsum.",
    );
    fieldLine(doc, 'Baza narx (Sbaza)', `${formatSom(breakdown.sbaza ?? 0)}/m²`);
    fieldLine(doc, 'Maydon (M)', `${breakdown.m ?? contract.areaM2} m²`);
    fieldLine(doc, 'Tuman koeffitsiyenti (Ktuman)', breakdown.ktuman ?? '-');
    fieldLine(doc, 'Zona koeffitsiyenti (Kzona)', breakdown.kzona ?? '-');
    fieldLine(doc, 'Maqsad koeffitsiyenti (Kmaqsad)', breakdown.kmaqsad ?? '-');
    fieldLine(doc, 'Mavsumiy koeffitsiyent (Kmavsum)', breakdown.kmavsum ?? '-');
    doc.moveDown(0.4);
    fieldLine(doc, 'Oylik ijara to\'lovi', formatSom(contract.rentPayment));
    fieldLine(doc, "Ekspluatatsiya to'lovi", formatSom(contract.operationalPayment));
    fieldLine(doc, 'Muddat', `${months} oy`);
    doc.font('Helvetica-Bold').text(`Jami: ${formatSom(contract.total)}`);
    doc.font('Helvetica');
    doc.moveDown(0.3);

    sectionTitle(doc, '4. Tomonlarning huquq va majburiyatlari');
    doc.font('Helvetica-Bold').text('Ijaraga beruvchining majburiyatlari:');
    doc.font('Helvetica');
    paragraph(
      doc,
      "hudud uchastkasini Shartnomada ko'rsatilgan holatda Ijarachiga topshirish; Ijarachining ushbu Shartnoma doirasidagi qonuniy foydalanishiga to'sqinlik qilmaslik.",
    );
    doc.font('Helvetica-Bold').text('Ijarachining majburiyatlari:');
    doc.font('Helvetica');
    paragraph(
      doc,
      "hudud uchastkasidan faqat Shartnomada ko'rsatilgan maqsadda foydalanish; ijara va ekspluatatsiya to'lovlarini belgilangan muddatlarda to'liq to'lash; hudud chegaralari va holatini o'zboshimchalik bilan o'zgartirmaslik, o'zgartirish zarurati tug'ilganda oldindan Ijaraga beruvchidan rozilik olish.",
    );

    sectionTitle(doc, '5. Tomonlarning javobgarligi');
    paragraph(
      doc,
      `Ijara to'lovini belgilangan muddatda to'lamaganlik uchun Ijarachiga har bir kechiktirilgan kun uchun qarz summasining ${penaltyPercent}% miqdorida penya hisoblanadi, biroq uning umumiy summasi qarz miqdorining ${penaltyCap}%idan oshmaydi. Boshqa hollarda ushbu Shartnoma bo'yicha majburiyatlarni bajarmaganlik yoki lozim darajada bajarmaganlik uchun Tomonlar O'zbekiston Respublikasi qonun hujjatlariga muvofiq javobgar bo'ladilar.`,
    );

    sectionTitle(doc, '6. Boshqa shartlar');
    paragraph(
      doc,
      `Ushbu Shartnoma Tomonlar tomonidan elektron raqamli imzo (E-IMZO) bilan imzolangan kundan boshlab kuchga kiradi va ${formatShortDate(contract.period.from)} dan ${formatShortDate(contract.period.to)} gacha amal qiladi. Shartnoma bajarilishi mobaynida yuzaga keladigan barcha nizolar va kelishmovchiliklar muzokaralar yo'li bilan, kelishuvga erishilmagan taqdirda O'zbekiston Respublikasi qonun hujjatlarida belgilangan tartibda sud tomonidan hal qilinadi.`,
    );

    sectionTitle(doc, "7. Tomonlarning rekvizitlari");
    const colWidth = 230;
    const leftX = 56;
    const rightX = 56 + colWidth + 30;
    let y = doc.y;

    doc.font('Helvetica-Bold').text('IJARAGA BERUVCHI', leftX, y, { width: colWidth });
    doc.text('IJARACHI', rightX, y, { width: colWidth });
    y = doc.y + 4;

    doc.font('Helvetica').fontSize(9.5);
    doc.text(HOKIMIYAT_REKVIZIT.name, leftX, y, { width: colWidth });
    doc.text(`"${company.name}"`, rightX, y, { width: colWidth });
    y = doc.y + 6;

    doc.text(`Manzil: ${HOKIMIYAT_REKVIZIT.address}`, leftX, y, { width: colWidth });
    doc.text(`STIR: ${company.stir}`, rightX, y, { width: colWidth });
    y = Math.max(doc.heightOfString(`Manzil: ${HOKIMIYAT_REKVIZIT.address}`, { width: colWidth }), 12) + y + 6;

    doc.text(`STIR: ${HOKIMIYAT_REKVIZIT.stir}`, leftX, y, { width: colWidth });
    doc.text(`Direktor: ${company.director}`, rightX, y, { width: colWidth });
    y += 16;

    doc.text(`Bank: ${HOKIMIYAT_REKVIZIT.bank}`, leftX, y, { width: colWidth });
    doc.text(`Telefon: ${company.phone}`, rightX, y, { width: colWidth });
    y += 16;

    doc.text(`MFO: ${HOKIMIYAT_REKVIZIT.mfo}`, leftX, y, { width: colWidth });
    y += 30;

    doc.font('Helvetica-Bold').fontSize(10.5);
    doc.text('Hokim', leftX, y, { width: colWidth });
    doc.text('Direktor', rightX, y, { width: colWidth });
    y += 30;

    doc.font('Helvetica').fontSize(10.5);
    doc.text('_______________________', leftX, y, { width: colWidth });
    doc.text(`${company.director}  _______________________`, rightX, y, { width: colWidth });

    doc.moveDown(3);
    doc.fontSize(9).fillColor('#666666').text(
      contract.eSign?.signed
        ? `Ushbu hujjat E-IMZO orqali imzolangan (ID: ${contract.eSign.mockSignatureId ?? '-'}, sana: ${contract.eSign.signedAt ? formatShortDate(contract.eSign.signedAt) : '-'}).`
        : 'Ushbu hujjat "Tutash hududlar" elektron platformasi tomonidan avtomatik generatsiya qilingan va hozircha E-IMZO orqali imzolanmagan.',
      { align: 'center' },
    );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return `/uploads/contracts/${fileName}`;
}
