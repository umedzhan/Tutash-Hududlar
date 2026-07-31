// Mock email integratsiyasi. Real SMTP/xizmat ulanganda shu faylni almashtirish kifoya.
export async function sendEmail({ to, subject, body }) {
  console.log(`[MOCK EMAIL] -> ${to}\nMavzu: ${subject}\n${body}\n`);
  return { messageId: `MOCK-EMAIL-${Date.now()}`, sentAt: new Date() };
}
