import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const UPLOAD_DIR = path.resolve('uploads/contracts');

function formatSom(amount) {
  return `${amount.toLocaleString('ru-RU')} so'm`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ');
}

export async function generateContractPdf({ contract, region, company }) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `${contract.contractNumber.replace(/\//g, '-')}.pdf`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(16).text('IJARA SHARTNOMASI', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Shartnoma raqami: ${contract.contractNumber}`);
    doc.text(`Tuzilgan sana: ${formatDate(new Date())}`);
    doc.moveDown();

    doc.text(`Ijarachi (tadbirkor): ${company.name}`);
    doc.text(`STIR: ${company.stir}`);
    doc.text(`Direktor: ${company.director}`);
    doc.moveDown();

    doc.text(`Hudud: ${region.address}`);
    doc.text(`Maydon: ${region.areaM2} m²`);
    doc.text(`Foydalanish davri: ${formatDate(contract.period.from)} - ${formatDate(contract.period.to)}`);
    doc.moveDown();

    doc.text(`Ijara to'lovi: ${formatSom(contract.rentPayment)}`);
    doc.text(`Ekspluatatsiya to'lovi: ${formatSom(contract.operationalPayment)}`);
    doc.fontSize(12).text(`Jami: ${formatSom(contract.total)}`, { underline: true });

    doc.moveDown(3);
    doc.fontSize(10).text('Ushbu hujjat "Tutash hududlar" elektron platformasi tomonidan avtomatik generatsiya qilingan.', {
      align: 'center',
    });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return `/uploads/contracts/${fileName}`;
}
