import { apiClient } from '../api/client';

export async function downloadFile(url: string, filename: string, params?: Record<string, string>) {
  const response = await apiClient.get(url, { responseType: 'blob', params });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function stamp() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function excelFilename(moduleName: string, section: string) {
  return `${moduleName}_${section}_${stamp()}.xlsx`;
}

export function wordFilename(moduleName: string, section: string) {
  return `${moduleName}_${section}_${stamp()}.docx`;
}
