import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const UPLOAD_DIR = path.resolve('uploads/violations');

const MONTH_NAMES = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

const STATUS_LABEL = {
  aniqlangan: 'Aniqlangan',
  tekshirilmoqda: 'Tekshirilmoqda',
  bartaraf_etilgan: 'Bartaraf etilgan',
};

const MODULE_LABEL = {
  kadastr: 'Kadastr',
  soliq: 'Soliq',
};

function formatLongDate(date) {
  const d = new Date(date);
  return `"${d.getDate()}" ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} y.`;
}

// Noqonuniy yer foydalanish holati bo'yicha dalolatnoma (akt) — kadastr/soliq
// xodimi tomonidan aniqlangan holatni rasmiylashtirish uchun.
export async function generateViolationPdf(violation) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `dalolatnoma-${violation._id}.pdf`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(15).text('NOQONUNIY YER FOYDALANISH HOLATI BO\'YICHA DALOLATNOMA', {
      align: 'center',
    });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10.5).text(formatLongDate(violation.detectedDate), { align: 'center' });
    doc.moveDown(1.2);

    doc.font('Helvetica-Bold').fontSize(11).text(`Holat raqami: ${violation._id}`);
    doc.font('Helvetica').fontSize(10.5);
    doc.moveDown(0.6);

    const rows = [
      ['Aniqlagan modul', MODULE_LABEL[violation.module] ?? violation.module],
      ['Manzil', violation.address],
      ['Maydon', violation.areaM2 ? `${violation.areaM2} m²` : "ko'rsatilmagan"],
      [
        'Koordinatalar',
        violation.location?.lat && violation.location?.lng
          ? `${violation.location.lat}, ${violation.location.lng}`
          : "ko'rsatilmagan",
      ],
      ['Holati', STATUS_LABEL[violation.status] ?? violation.status],
      ['Aniqlangan sana', new Date(violation.detectedDate).toLocaleDateString('uz-UZ')],
      ['Mas\'ul xodim', violation.inspectorId?.name ?? '-'],
    ];

    for (const [label, value] of rows) {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value));
      doc.moveDown(0.2);
    }

    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').text('Tavsif:');
    doc.font('Helvetica').text(violation.description || '—', { align: 'justify' });

    if (violation.status === 'bartaraf_etilgan' && violation.resolutionNote) {
      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').text('Bartaraf etilishi bo\'yicha izoh:');
      doc.font('Helvetica').text(violation.resolutionNote, { align: 'justify' });
    }

    doc.moveDown(3);
    doc.font('Helvetica').fontSize(10.5);
    const y = doc.y;
    doc.text('Mas\'ul xodim: _______________________', 56, y);
    doc.text(`${violation.inspectorId?.name ?? ''}`, 56, y + 16);

    doc.moveDown(2.5);
    doc.fontSize(9).fillColor('#666666').text(
      'Ushbu dalolatnoma "Tutash hududlar" elektron platformasi tomonidan avtomatik generatsiya qilingan.',
      { align: 'center' },
    );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}
