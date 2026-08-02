import Region from '../models/Region.js';
import Application from '../models/Application.js';
import Contract from '../models/Contract.js';
import Payment from '../models/Payment.js';
import District from '../models/District.js';
import Zone from '../models/Zone.js';
import { PAYMENT_STATUS, APPLICATION_STATUS, STAGES } from '../constants.js';

const APPROVED_STATUSES = [
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.CONTRACT_GENERATED,
  APPLICATION_STATUS.SIGNED,
  APPLICATION_STATUS.ACTIVE,
];

// districtId/zoneId query parametrlaridan Region/Application/Contract uchun umumiy filtr yasaydi.
// zoneId berilgan bo'lsa u ustuvor, aks holda districtId bo'yicha filtrlanadi.
function hierarchyFilter(query) {
  const { districtId, zoneId } = query;
  if (zoneId) return { zoneId };
  if (districtId) return { districtId };
  return {};
}

async function contractIdsForFilter(query) {
  const filter = hierarchyFilter(query);
  if (Object.keys(filter).length === 0) return null;
  const contracts = await Contract.find(filter).select('_id');
  return contracts.map((c) => c._id);
}

export async function dashboardSummary(req, res) {
  const regionFilter = hierarchyFilter(req.query);
  const applicationFilter = hierarchyFilter(req.query);

  const [jami, band, bosh, muammoli, zaxirada] = await Promise.all([
    Region.countDocuments(regionFilter),
    Region.countDocuments({ ...regionFilter, status: 'band' }),
    Region.countDocuments({ ...regionFilter, status: 'bosh' }),
    Region.countDocuments({ ...regionFilter, status: 'muammoli' }),
    Region.countDocuments({ ...regionFilter, status: 'zaxirada' }),
  ]);

  const [totalApplications, approvedCount, rejectedCount] = await Promise.all([
    Application.countDocuments(applicationFilter),
    Application.countDocuments({ ...applicationFilter, status: { $in: APPROVED_STATUSES } }),
    Application.countDocuments({ ...applicationFilter, status: APPLICATION_STATUS.REJECTED }),
  ]);
  const inReviewCount = totalApplications - approvedCount - rejectedCount;

  const recentApplications = await Application.find(applicationFilter)
    .populate('hududId')
    .populate('companyId')
    .populate('districtId')
    .populate('zoneId')
    .sort({ createdAt: -1 })
    .limit(4);

  const contractIds = await contractIdsForFilter(req.query);
  const paymentMatch = contractIds ? { contractId: { $in: contractIds } } : {};
  const now = new Date();
  const [kutilayotgan, undirilgan, qarzdorlik] = await Promise.all([
    Payment.aggregate([{ $match: { ...paymentMatch, status: PAYMENT_STATUS.KUTILMOQDA } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { ...paymentMatch, status: PAYMENT_STATUS.TOLANGAN } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { ...paymentMatch, status: PAYMENT_STATUS.KUTILMOQDA, dueDate: { $lt: now } } },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]),
  ]);

  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const contractFilter = hierarchyFilter(req.query);
  const expiringSoon30 = await Contract.countDocuments({
    ...contractFilter,
    status: 'faol',
    'period.to': { $gte: now, $lte: in30Days },
  });

  res.json({
    regionStats: {
      jami,
      band,
      bosh,
      muammoli,
      zaxirada,
      bandPercent: jami ? Math.round((band / jami) * 1000) / 10 : 0,
      boshPercent: jami ? Math.round((bosh / jami) * 1000) / 10 : 0,
      muammoliPercent: jami ? Math.round((muammoli / jami) * 1000) / 10 : 0,
    },
    applicationStats: {
      total: totalApplications,
      approved: approvedCount,
      rejected: rejectedCount,
      inReview: Math.max(0, inReviewCount),
    },
    recentApplications,
    paymentStats: {
      kutilayotgan: kutilayotgan[0]?.sum || 0,
      undirilgan: undirilgan[0]?.sum || 0,
      qarzdorlik: qarzdorlik[0]?.sum || 0,
    },
    expiringSoon30,
  });
}

export async function myDashboard(req, res) {
  const companyId = req.user.companyId;

  const contracts = await Contract.find({ companyId }).populate('hududId');
  const contractIds = contracts.map((c) => c._id);

  const [payments, activeApplications] = await Promise.all([
    Payment.find({ contractId: { $in: contractIds } }).sort({ dueDate: 1 }),
    Application.countDocuments({
      applicantId: req.user.id,
      status: { $nin: [APPLICATION_STATUS.ACTIVE, APPLICATION_STATUS.REJECTED] },
    }),
  ]);

  const totalPaid = payments.filter((p) => p.status === PAYMENT_STATUS.TOLANGAN).reduce((sum, p) => sum + p.amount, 0);
  const totalDebt = payments
    .filter((p) => p.status === PAYMENT_STATUS.KUTILMOQDA && p.dueDate < new Date())
    .reduce((sum, p) => sum + p.amount, 0);
  const nextPayment = payments.find((p) => p.status === PAYMENT_STATUS.KUTILMOQDA) || null;

  res.json({
    jamiShartnomalar: contracts.length,
    faolShartnomalar: contracts.filter((c) => c.status === 'faol').length,
    jamiTolovlar: totalPaid,
    qarzdorlik: totalDebt,
    aktivArizalar: activeApplications,
    nextPayment,
    contracts,
    recentPayments: payments.slice(0, 5),
  });
}

// Ariza jarayoni bo'yicha holatlar soni + har bir bosqichda o'rtacha necha kun turgani.
export async function applicationFunnel(req, res) {
  const filter = hierarchyFilter(req.query);
  const applications = await Application.find(filter).select('status stages createdAt');

  const statusCounts = {};
  for (const status of Object.values(APPLICATION_STATUS)) statusCounts[status] = 0;
  for (const app of applications) {
    statusCounts[app.status] = (statusCounts[app.status] ?? 0) + 1;
  }

  const stageDurations = {};
  for (const stage of STAGES) stageDurations[stage] = [];
  for (const app of applications) {
    let prevTime = app.createdAt;
    for (const stage of STAGES) {
      const rec = app.stages?.find((s) => s.stage === stage);
      if (rec?.decidedAt) {
        const days = (rec.decidedAt.getTime() - prevTime.getTime()) / (1000 * 60 * 60 * 24);
        stageDurations[stage].push(days);
        prevTime = rec.decidedAt;
      }
    }
  }
  const avgStageDurationDays = {};
  for (const stage of STAGES) {
    const arr = stageDurations[stage];
    avgStageDurationDays[stage] = arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
  }

  res.json({ total: applications.length, statusCounts, avgStageDurationDays });
}

// Oylik to'lov trendi (kutilayotgan/to'langan/qarzdor) + eng ko'p qarzdor 10 ta subyekt.
export async function paymentTrend(req, res) {
  const contractIds = await contractIdsForFilter(req.query);
  const match = contractIds ? { contractId: { $in: contractIds } } : {};

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const trend = await Payment.aggregate([
    { $match: { ...match, dueDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$dueDate' }, month: { $month: '$dueDate' }, status: '$status' },
        sum: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthMap = {};
  for (const row of trend) {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    monthMap[key] ??= { month: key, kutilmoqda: 0, to_langan: 0, qarzdor: 0 };
    monthMap[key][row._id.status] = row.sum;
  }
  const monthlyTrend = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

  const now = new Date();
  const topDebtorsRaw = await Payment.aggregate([
    { $match: { ...match, status: PAYMENT_STATUS.KUTILMOQDA, dueDate: { $lt: now } } },
    { $group: { _id: '$contractId', debt: { $sum: '$amount' }, oldestDue: { $min: '$dueDate' } } },
    { $sort: { debt: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'contracts', localField: '_id', foreignField: '_id', as: 'contract' } },
    { $unwind: '$contract' },
    { $lookup: { from: 'companies', localField: 'contract.companyId', foreignField: '_id', as: 'company' } },
    { $unwind: '$company' },
    { $lookup: { from: 'regions', localField: 'contract.hududId', foreignField: '_id', as: 'region' } },
    { $unwind: { path: '$region', preserveNullAndEmptyArrays: true } },
  ]);

  const topDebtors = topDebtorsRaw.map((d) => ({
    contractId: d._id,
    contractNumber: d.contract.contractNumber,
    companyName: d.company.name,
    regionAddress: d.region?.address ?? '-',
    debt: d.debt,
    daysOverdue: Math.floor((now.getTime() - d.oldestDue.getTime()) / (1000 * 60 * 60 * 24)),
  }));

  res.json({ monthlyTrend, topDebtors });
}

// Muddati tugayotgan (30/60/90 kun) faol shartnomalar ro'yxati.
export async function expiringContracts(req, res) {
  const filter = { ...hierarchyFilter(req.query), status: 'faol' };
  const maxDays = req.query.range ? Number(req.query.range) : 90;

  const now = new Date();
  const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
  filter['period.to'] = { $gte: now, $lte: maxDate };

  const contracts = await Contract.find(filter)
    .populate('companyId')
    .populate('hududId')
    .populate('districtId')
    .populate('zoneId')
    .sort({ 'period.to': 1 });

  const contractIds = contracts.map((c) => c._id);
  const debtRows = await Payment.aggregate([
    { $match: { contractId: { $in: contractIds }, status: PAYMENT_STATUS.KUTILMOQDA, dueDate: { $lt: now } } },
    { $group: { _id: '$contractId', debt: { $sum: '$amount' } } },
  ]);
  const debtMap = new Map(debtRows.map((d) => [String(d._id), d.debt]));

  const result = contracts.map((c) => {
    const daysLeft = Math.ceil((c.period.to.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let group = '90';
    if (daysLeft <= 30) group = '30';
    else if (daysLeft <= 60) group = '60';
    return {
      _id: c._id,
      contractNumber: c.contractNumber,
      company: c.companyId,
      region: c.hududId,
      district: c.districtId,
      zone: c.zoneId,
      periodTo: c.period.to,
      daysLeft,
      group,
      debt: debtMap.get(String(c._id)) || 0,
    };
  });

  res.json(result);
}

// Eng faol tumanlar (ariza soni + o'rtacha ko'rib chiqish muddati) va eng band mahallalar.
export async function districtRanking(req, res) {
  const [applicationsByDistrict, districts, regionsByZone, zones] = await Promise.all([
    Application.aggregate([
      {
        $group: {
          _id: '$districtId',
          count: { $sum: 1 },
          avgDurationMs: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } },
        },
      },
      { $sort: { count: -1 } },
    ]),
    District.find(),
    Region.aggregate([
      { $match: { zoneId: { $ne: null } } },
      {
        $group: {
          _id: '$zoneId',
          total: { $sum: 1 },
          band: { $sum: { $cond: [{ $eq: ['$status', 'band'] }, 1, 0] } },
        },
      },
    ]),
    Zone.find(),
  ]);

  const districtMap = new Map(districts.map((d) => [String(d._id), d]));
  const districtRankingResult = applicationsByDistrict
    .filter((row) => row._id)
    .map((row) => ({
      districtId: row._id,
      districtName: districtMap.get(String(row._id))?.name ?? '-',
      applicationCount: row.count,
      avgDurationDays: row.avgDurationMs != null ? Math.round((row.avgDurationMs / (1000 * 60 * 60 * 24)) * 10) / 10 : null,
    }))
    .slice(0, 10);

  const zoneMap = new Map(zones.map((z) => [String(z._id), z]));
  const zoneRanking = regionsByZone
    .map((row) => {
      const zone = zoneMap.get(String(row._id));
      return {
        zoneId: row._id,
        zoneName: zone?.name ?? '-',
        districtName: zone ? districtMap.get(String(zone.districtId))?.name ?? '-' : '-',
        total: row.total,
        band: row.band,
        bandPercent: row.total ? Math.round((row.band / row.total) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.bandPercent - a.bandPercent)
    .slice(0, 10);

  res.json({ districts: districtRankingResult, zones: zoneRanking });
}
