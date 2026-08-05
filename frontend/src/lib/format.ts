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

/** "Alisher Navoiy" MChJ -> "AN"; bitta so'zli nomlar uchun dastlabki 2 harf. */
export function initials(name: string): string {
  const cleaned = name.replace(/["'«»]/g, '').trim();
  const words = cleaned.split(/\s+/).filter((w) => !/^(MChJ|XK|OK|LLC)$/i.test(w));
  if (words.length === 0) return '—';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
