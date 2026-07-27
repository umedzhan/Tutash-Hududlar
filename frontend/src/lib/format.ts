export function formatSom(amount: number): string {
  return `${Math.round(amount).toLocaleString('ru-RU')} so'm`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('uz-UZ');
}

export function daysUntil(date: string | Date): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
