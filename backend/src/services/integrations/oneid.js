// Mock OneID integratsiyasi. Real integratsiya ulanganda shu faylni almashtirish kifoya.
export async function authenticate(token) {
  return {
    pinfl: '30001019999999',
    firstName: 'Mock',
    lastName: 'Foydalanuvchi',
    verified: Boolean(token),
  };
}
