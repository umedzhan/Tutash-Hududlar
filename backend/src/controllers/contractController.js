import Contract from '../models/Contract.js';
import Application from '../models/Application.js';
import Region from '../models/Region.js';
import Company from '../models/Company.js';
import District from '../models/District.js';
import { generateContractPdf } from '../services/contractPdf.js';
import * as eimzo from '../services/integrations/eimzo.js';
import * as soliq from '../services/integrations/soliq.js';
import { logAction } from '../middleware/auditLogger.js';
import { ROLES, APPLICATION_STATUS, REGION_STATUS } from '../constants.js';

async function nextContractNumber() {
  const count = await Contract.countDocuments();
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}/${mm}/${String(count + 1).padStart(6, '0')}`;
}

export async function listContracts(req, res) {
  const filter = req.user.role === ROLES.TADBIRKOR ? { companyId: req.user.companyId } : {};
  const contracts = await Contract.find(filter)
    .populate('hududId')
    .populate('companyId')
    .sort({ createdAt: -1 });
  res.json(contracts);
}

export async function getContract(req, res) {
  const contract = await Contract.findById(req.params.id).populate('hududId').populate('companyId');
  if (!contract) {
    return res.status(404).json({ message: 'Shartnoma topilmadi' });
  }
  res.json(contract);
}

// Ariza yakuniy tasdiqlangach avtomatik chaqiriladi (qo'lda summalar kiritilmaydi —
// application.priceSnapshot'dan olinadi). Agar tadbirkor o'zi chizgan bo'lsa (hududId yo'q),
// shu geometriyadan "zaxirada" holatidagi yangi Region yaratiladi.
export async function autoGenerateContract(application, req) {
  const company = await Company.findById(application.companyId);

  let region = application.hududId ? await Region.findById(application.hududId) : null;
  if (!region) {
    const district = await District.findById(application.districtId);
    region = await Region.create({
      name: application.address,
      address: application.address,
      district: district?.name ?? '',
      geometry: application.geometry,
      areaM2: application.areaM2,
      status: REGION_STATUS.ZAXIRADA,
    });
    application.hududId = region._id;
  } else {
    region.status = REGION_STATUS.ZAXIRADA;
    await region.save();
  }

  const contractNumber = await nextContractNumber();
  const { monthlyRent, exploitationFee, total } = application.priceSnapshot;

  const contract = await Contract.create({
    contractNumber,
    applicationId: application._id,
    hududId: region._id,
    companyId: company._id,
    districtId: application.districtId,
    purposeId: application.purposeId,
    geometry: application.geometry,
    areaM2: application.areaM2,
    priceSnapshot: application.priceSnapshot,
    rentPayment: monthlyRent,
    operationalPayment: exploitationFee,
    total,
    period: application.period,
  });

  const pdfPath = await generateContractPdf({ contract, region, company });
  contract.pdfPath = pdfPath;
  await contract.save();

  application.status = APPLICATION_STATUS.CONTRACT_GENERATED;
  application.history.push({
    status: APPLICATION_STATUS.CONTRACT_GENERATED,
    date: new Date(),
    byUserId: req.user.id,
    comment: `Shartnoma yaratildi: ${contractNumber}`,
  });
  await application.save();

  await logAction({ req, action: 'create', entity: 'Contract', entityId: contract._id });
  return contract;
}

export async function signContract(req, res) {
  const contract = await Contract.findById(req.params.id);
  if (!contract) {
    return res.status(404).json({ message: 'Shartnoma topilmadi' });
  }

  const signature = await eimzo.sign(Buffer.from(contract.contractNumber), req.user.id);
  contract.eSign = signature;
  await contract.save();

  const application = await Application.findById(contract.applicationId);
  application.status = APPLICATION_STATUS.SIGNED;
  application.history.push({
    status: APPLICATION_STATUS.SIGNED,
    date: new Date(),
    byUserId: req.user.id,
    comment: "E-IMZO bilan imzolandi",
  });
  application.status = APPLICATION_STATUS.ACTIVE;
  application.history.push({
    status: APPLICATION_STATUS.ACTIVE,
    date: new Date(),
    byUserId: req.user.id,
    comment: 'Shartnoma faollashtirildi',
  });
  await application.save();

  await Region.findByIdAndUpdate(contract.hududId, { status: REGION_STATUS.BAND, currentContractId: contract._id });
  await soliq.syncContract(contract);

  await logAction({ req, action: 'sign', entity: 'Contract', entityId: contract._id });
  res.json(contract);
}
