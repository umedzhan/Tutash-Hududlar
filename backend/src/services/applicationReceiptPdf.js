import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const UPLOAD_DIR = path.resolve('uploads/applications');

const MONTH_NAMES = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

function formatLongDate(date) {
  const d = new Date(date);
  return `"${d.getDate()}" ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} y.`;
}

function formatShortDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ');
}

// Telegram bot orqali topshirilgan arizaning tasdiqlash varaqasi (kvitansiya) —
// arizachiga botga PDF sifatida yuborish uchun. Rasmiy shartnoma emas.
export async function generateApplicationReceiptPdf(application) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `ariza-${application._id}.pdf`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const company = application.companyId;
  const district = application.districtId;
  const zone = application.zoneId;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(15).text('ARIZANI QABUL QILISH TO\'G\'RISIDA MA\'LUMOTNOMA', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10.5).text(formatLongDate(application.createdAt ?? new Date()), { align: 'center' });
    doc.moveDown(1.2);

    doc.font('Helvetica-Bold').fontSize(11).text(`Ariza raqami: ${application.applicationNumber}`);
    doc.font('Helvetica').fontSize(10.5);
    doc.moveDown(0.6);

    const rows = [
      ['Korxona', company?.name ?? '-'],
      ['STIR', company?.stir ?? '-'],
      ['Rahbar', company?.director ?? '-'],
      ['Tuman/shahar', district?.name ?? '-'],
      ['Mahalla', zone?.name ?? '-'],
      ['Kadastr raqami', application.cadastreNumber || 'ko\'rsatilmagan'],
      ['Foydalanish maqsadi', application.purpose],
      ['Foydalanish turi', application.usageType],
      ['Davr', `${formatShortDate(application.period.from)} — ${formatShortDate(application.period.to)}`],
      ['Yuborilgan sana', formatShortDate(application.createdAt ?? new Date())],
    ];

    for (const [label, value] of rows) {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value));
      doc.moveDown(0.2);
    }

    if (application.comment) {
      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').text('Izoh:');
      doc.font('Helvetica').text(application.comment, { align: 'justify' });
    }

    doc.moveDown(1.2);
    doc.font('Helvetica-Bold').fontSize(10.5).text('Keyingi qadam:');
    doc.font('Helvetica').fontSize(10.5).text(
      'Ariza Kadastr xodimi tomonidan ko\'rib chiqiladi va tutash hudud chegarasi belgilanadi. ' +
      'Chegara belgilangach, tasdiqlash so\'rovi Telegram bot orqali sizga yuboriladi.',
      { align: 'justify' },
    );

    doc.moveDown(2.5);
    doc.fontSize(9).fillColor('#666666').text(
      'Ushbu hujjat "Tutash hududlar" elektron platformasi Telegram boti tomonidan avtomatik generatsiya qilingan va rasmiy shartnoma hisoblanmaydi.',
      { align: 'center' },
    );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}
