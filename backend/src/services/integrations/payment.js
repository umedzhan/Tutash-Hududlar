import crypto from 'node:crypto';

// Mock Click/Payme integratsiyasi. Real API ulanganda shu faylni almashtirish kifoya.
export async function createInvoice(payment) {
  return {
    transactionRef: `MOCK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    invoiceUrl: `https://mock-payme.local/pay/${payment._id}`,
  };
}

export async function checkStatus(transactionRef) {
  return {
    transactionRef,
    status: 'to_langan',
    checkedAt: new Date(),
  };
}
