import Region from '../models/Region.js';
import Application from '../models/Application.js';
import Contract from '../models/Contract.js';
import Payment from '../models/Payment.js';
import { PAYMENT_STATUS, APPLICATION_STATUS } from '../constants.js';

export async function dashboardSummary(req, res) {
  const [jami, band, bosh, muammoli] = await Promise.all([
    Region.countDocuments(),
    Region.countDocuments({ status: 'band' }),
    Region.countDocuments({ status: 'bosh' }),
    Region.countDocuments({ status: 'muammoli' }),
  ]);

  const recentApplications = await Application.find()
    .populate('hududId')
    .populate('companyId')
    .sort({ createdAt: -1 })
    .limit(4);

  const now = new Date();
  const [kutilayotgan, undirilgan, qarzdorlik] = await Promise.all([
    Payment.aggregate([{ $match: { status: PAYMENT_STATUS.KUTILMOQDA } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: PAYMENT_STATUS.TOLANGAN } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.KUTILMOQDA, dueDate: { $lt: now } } },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]),
  ]);

  res.json({
    regionStats: {
      jami,
      band,
      bosh,
      muammoli,
      bandPercent: jami ? Math.round((band / jami) * 1000) / 10 : 0,
      boshPercent: jami ? Math.round((bosh / jami) * 1000) / 10 : 0,
      muammoliPercent: jami ? Math.round((muammoli / jami) * 1000) / 10 : 0,
    },
    recentApplications,
    paymentStats: {
      kutilayotgan: kutilayotgan[0]?.sum || 0,
      undirilgan: undirilgan[0]?.sum || 0,
      qarzdorlik: qarzdorlik[0]?.sum || 0,
    },
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
