// Chatbot bilimlar bazasi javoblari sayt uchun HTML (<ul>/<li>/<table>/<div>/<span>) formatida
// yozilgan, lekin Telegram HTML parse_mode faqat cheklangan teglar to'plamini (b, i, u, s, a,
// code, pre) qo'llab-quvvatlaydi. Bu funksiya KB javoblarini Telegramga xavfsiz matnga o'giradi.
export function htmlToTelegram(html) {
  let s = html;

  // Jadval -> "nom — qiymat" qatorlari (sarlavha qatori tashlab yuboriladi)
  s = s.replace(/<table>([\s\S]*?)<\/table>/g, (_, body) => {
    const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
    const lines = rows
      .map((row) => {
        if (/<th>/.test(row)) return null;
        const cells = [...row.matchAll(/<t[dh]>([\s\S]*?)<\/t[dh]>/g)].map((m) => m[1].trim());
        if (cells.length === 2) return `• ${cells[0]} — ${cells[1]}`;
        return null;
      })
      .filter(Boolean);
    return '\n' + lines.join('\n') + '\n';
  });

  s = s.replace(/<li>([\s\S]*?)<\/li>/g, '• $1\n');
  s = s.replace(/<\/?ul>/g, '\n');
  s = s.replace(/<br\s*\/?>/g, '\n');
  s = s.replace(/<span class="src">([\s\S]*?)<\/span>/g, '\n\n<i>$1</i>');
  s = s.replace(/<\/?div[^>]*>/g, '');

  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}
