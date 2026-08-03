import Contract from '../models/Contract.js';
import Application from '../models/Application.js';
import Region from '../models/Region.js';
import Company from '../models/Company.js';
import District from '../models/District.js';
import Zone from '../models/Zone.js';
import Purpose from '../models/Purpose.js';
import Tariff from '../models/Tariff.js';
import { generateContractPdf } from '../services/contractPdf.js';
import * as eimzo from '../services/integrations/eimzo.js';
import * as soliq from '../services/integrations/soliq.js';
import { logAction } from '../middleware/auditLogger.js';
import { ROLES, APPLICATION_STATUS, REGION_STATUS } from '../constants.js';
import { buildExcelBuffer, sendExcel, exportFilename as excelFilename } from '../services/exportExcel.js';
import { buildRecordWordBuffer, sendWord, exportFilename as wordFilename } from '../services/exportWord.js';

const CONTRACT_STATUS_LABEL_UZ = {
  faol: 'Faol',
  tugagan: 'Tugagan',
  bekor_qilingan: 'Bekor qilingan',
};

function formatSom(amount) {
  return `${Math.round(amount).toLocaleString('ru-RU')} so'm`;
}

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

export async function exportContractsExcel(req, res) {
  const filter = req.user.role === ROLES.TADBIRKOR ? { companyId: req.user.companyId } : {};
  const contracts = await Contract.find(filter).populate('hududId').populate('companyId').sort({ createdAt: -1 });

  const buffer = await buildExcelBuffer({
    sheetName: 'Shartnomalar',
    columns: [
      { header: 'Shartnoma №', key: 'num', width: 18 },
      { header: 'Kompaniya', key: 'company', width: 28 },
      { header: 'Hudud', key: 'region', width: 30 },
      { header: 'Jami (so\'m)', key: 'total', width: 18 },
      { header: 'Davr', key: 'period', width: 26 },
      { header: 'E-IMZO', key: 'esign', width: 16 },
      { header: 'Holati', key: 'status', width: 18 },
    ],
    rows: contracts.map((c) => ({
      num: c.contractNumber,
      company: c.companyId?.name ?? '',
      region: c.hududId?.address ?? '',
      total: formatSom(c.total),
      period: `${c.period.from.toLocaleDateString('uz-UZ')} — ${c.period.to.toLocaleDateString('uz-UZ')}`,
      esign: c.eSign?.signed ? 'Imzolangan' : 'Kutilmoqda',
      status: CONTRACT_STATUS_LABEL_UZ[c.status] ?? c.status,
    })),
  });

  const filename = excelFilename('soliq', 'shartnomalar', 'xlsx');
  await logAction({ req, action: 'export', entity: 'Contract', entityId: null, diff: { format: 'xlsx', count: contracts.length } });
  sendExcel(res, buffer, filename);
}

export async function exportContractWord(req, res) {
  const contract = await Contract.findById(req.params.id).populate('hududId').populate('companyId');
  if (!contract) {
    return res.status(404).json({ message: 'Shartnoma topilmadi' });
  }

  const buffer = await buildRecordWordBuffer({
    title: 'SHARTNOMA KARTOCHKASI',
    docNumber: contract.contractNumber,
    date: contract.createdAt.toLocaleDateString('uz-UZ'),
    fields: [
      ['Kompaniya', contract.companyId?.name],
      ['STIR', contract.companyId?.stir],
      ['Hudud', contract.hududId?.address],
      ['Maydon', contract.areaM2 ? `${contract.areaM2} m²` : '-'],
      ['Yillik ijara', contract.priceSnapshot?.annualRent ? formatSom(contract.priceSnapshot.annualRent) : '-'],
      ['Jami', formatSom(contract.total)],
      ['Davr', `${contract.period.from.toLocaleDateString('uz-UZ')} — ${contract.period.to.toLocaleDateString('uz-UZ')}`],
      ['E-IMZO', contract.eSign?.signed ? 'Imzolangan' : 'Kutilmoqda'],
      ['Holati', CONTRACT_STATUS_LABEL_UZ[contract.status] ?? contract.status],
    ],
  });

  const filename = wordFilename('soliq', `shartnoma-${contract.contractNumber.replace(/\//g, '-')}`, 'docx');
  await logAction({ req, action: 'export', entity: 'Contract', entityId: contract._id, diff: { format: 'docx' } });
  sendWord(res, buffer, filename);
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
  const [company, district, zone, purpose] = await Promise.all([
    Company.findById(application.companyId),
    District.findById(application.districtId),
    Zone.findById(application.zoneId),
    Purpose.findById(application.purposeId),
  ]);
  const tariff = application.priceSnapshot?.tariffId ? await Tariff.findById(application.priceSnapshot.tariffId) : null;

  let region = application.hududId ? await Region.findById(application.hududId) : null;
  if (!region) {
    region = await Region.create({
      name: application.address,
      address: application.address,
      district: district?.name ?? '',
      districtId: application.districtId,
      zoneId: application.zoneId,
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
  const { annualRent, total } = application.priceSnapshot;

  const contract = await Contract.create({
    contractNumber,
    applicationId: application._id,
    hududId: region._id,
    companyId: company._id,
    districtId: application.districtId,
    zoneId: application.zoneId,
    purposeId: application.purposeId,
    geometry: application.geometry,
    areaM2: application.areaM2,
    priceSnapshot: application.priceSnapshot,
    rentPayment: annualRent,
    total,
    period: application.period,
  });

  const pdfPath = await generateContractPdf({ contract, region, company, district, zone, purpose, tariff });
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

  const [region, company, district, zone, purpose] = await Promise.all([
    Region.findById(contract.hududId),
    Company.findById(contract.companyId),
    District.findById(contract.districtId),
    Zone.findById(contract.zoneId),
    Purpose.findById(contract.purposeId),
  ]);
  const tariff = contract.priceSnapshot?.tariffId ? await Tariff.findById(contract.priceSnapshot.tariffId) : null;
  contract.pdfPath = await generateContractPdf({ contract, region, company, district, zone, purpose, tariff });

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
