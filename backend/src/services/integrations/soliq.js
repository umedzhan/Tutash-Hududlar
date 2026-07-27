// Mock Soliq (e-ijara) integratsiyasi. Real API ulanganda shu faylni almashtirish kifoya.
export async function syncContract(contract) {
  return {
    success: true,
    soliqRegistryId: `EI-${contract.contractNumber}`,
    syncedAt: new Date(),
  };
}
