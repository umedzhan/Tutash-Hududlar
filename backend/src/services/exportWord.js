import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from 'docx';

function pad(n) {
  return String(n).padStart(2, '0');
}

export function exportFilename(moduleName, section, ext) {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${moduleName}_${section}_${stamp}.${ext}`;
}

const CELL_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
  left: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
  right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
};

function fieldRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: CELL_BORDER,
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 21 })] })],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: CELL_BORDER,
        children: [new Paragraph({ children: [new TextRun({ text: String(value ?? '-'), size: 21 })] })],
      }),
    ],
  });
}

// Rasmiy hujjat shakli: tashkilot sarlavhasi, hujjat nomi/raqami, sana, jadval ko'rinishida
// asosiy ma'lumotlar, mas'ul shaxs F.I.Sh. va imzo/muhr uchun joy.
export async function buildRecordWordBuffer({ title, docNumber, date, fields, note }) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'TUTASH HUDUDLAR — Elektron platformasi', size: 20, color: '666666' })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: title, bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: `Hujjat raqami: ${docNumber}    Sana: ${date}`, size: 20 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: fields.map(([label, value]) => fieldRow(label, value)),
          }),
          new Paragraph({ text: '', spacing: { before: 500 } }),
          ...(note
            ? [new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: note, size: 20 })] })]
            : []),
          new Paragraph({
            spacing: { before: 400 },
            children: [new TextRun({ text: "Mas'ul shaxs: _______________________    F.I.Sh: _______________________", size: 21 })],
          }),
          new Paragraph({
            spacing: { before: 300 },
            children: [new TextRun({ text: 'Imzo / muhr: _______________________', size: 21 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
            children: [
              new TextRun({
                text: 'Ushbu hujjat "Tutash hududlar" elektron platformasi tomonidan avtomatik generatsiya qilingan.',
                size: 16,
                color: '999999',
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// Ro'yxat darajasidagi umumlashtirilgan hisobot (masalan: tanlangan davr uchun barcha holatlar)
export async function buildListWordBuffer({ title, generatedAt, columns, rows }) {
  const headerRow = new TableRow({
    children: columns.map(
      (c) =>
        new TableCell({
          borders: CELL_BORDER,
          shading: { fill: 'E8EEF9' },
          children: [new Paragraph({ children: [new TextRun({ text: c.header, bold: true, size: 19 })] })],
        }),
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: columns.map(
          (c) =>
            new TableCell({
              borders: CELL_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: String(row[c.key] ?? '-'), size: 19 })] })],
            }),
        ),
      }),
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'TUTASH HUDUDLAR — Elektron platformasi', size: 20, color: '666666' })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: title, bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: `Shakllantirilgan sana: ${generatedAt}    Jami: ${rows.length} ta`, size: 20 })],
          }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function sendWord(res, buffer, filename) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}
