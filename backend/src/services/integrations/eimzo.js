import crypto from 'node:crypto';

// Mock E-IMZO integratsiyasi. Real E-IMZO ulanganda shu faylni almashtirish kifoya.
export async function sign(documentBuffer, userId) {
  const mockSignatureId = crypto.randomUUID();
  return {
    signed: true,
    signedAt: new Date(),
    mockSignatureId,
    signedBy: userId,
  };
}
