import ExcelJS from 'exceljs';

function pad(n) {
  return String(n).padStart(2, '0');
}

// modul_bo'lim_YYYYMMDD_HHMM shabloni bo'yicha fayl nomi
export function exportFilename(moduleName, section, ext) {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${moduleName}_${section}_${stamp}.${ext}`;
}

export async function buildExcelBuffer({ sheetName, columns, rows }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tutash Hududlar';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 22 }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF9' } };
  rows.forEach((row) => sheet.addRow(row));

  return workbook.xlsx.writeBuffer();
}

export function sendExcel(res, buffer, filename) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}
