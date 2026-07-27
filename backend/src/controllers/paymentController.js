import Payment from '../models/Payment.js';
import Contract from '../models/Contract.js';
import * as paymentGateway from '../services/integrations/payment.js';
import { logAction } from '../middleware/auditLogger.js';
import { ROLES, PAYMENT_STATUS } from '../constants.js';

export async function listPayments(req, res) {
  let filter = {};
  if (req.user.role === ROLES.TADBIRKOR) {
    const contracts = await Contract.find({ companyId: req.user.companyId }).select('_id');
    filter = { contractId: { $in: contracts.map((c) => c._id) } };
  }
  const payments = await Payment.find(filter).populate({ path: 'contractId', populate: ['hududId', 'companyId'] }).sort({ dueDate: -1 });
  res.json(payments);
}

export async function createPayment(req, res) {
  const { contractId, amount, dueDate, method } = req.body;
  const contract = await Contract.findById(contractId);
  if (!contract) {
    return res.status(404).json({ message: 'Shartnoma topilmadi' });
  }

  const payment = await Payment.create({ contractId, amount, dueDate, method: method || 'click' });
  const invoice = await paymentGateway.createInvoice(payment);
  payment.transactionRef = invoice.transactionRef;
  await payment.save();

  await logAction({ req, action: 'create', entity: 'Payment', entityId: payment._id });
  res.status(201).json({ payment, invoiceUrl: invoice.invoiceUrl });
}

export async function markPaid(req, res) {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ message: 'To\'lov topilmadi' });
  }

  await paymentGateway.checkStatus(payment.transactionRef);
  payment.status = PAYMENT_STATUS.TOLANGAN;
  payment.paidDate = new Date();
  await payment.save();

  await logAction({ req, action: 'markPaid', entity: 'Payment', entityId: payment._id });
  res.json(payment);
}

export async function paymentStats(req, res) {
  const [kutilayotgan, undirilgan] = await Promise.all([
    Payment.aggregate([{ $match: { status: PAYMENT_STATUS.KUTILMOQDA } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: PAYMENT_STATUS.TOLANGAN } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
  ]);
  const now = new Date();
  const qarzdorlik = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.KUTILMOQDA, dueDate: { $lt: now } } },
    { $group: { _id: null, sum: { $sum: '$amount' } } },
  ]);

  res.json({
    kutilayotgan: kutilayotgan[0]?.sum || 0,
    undirilgan: undirilgan[0]?.sum || 0,
    qarzdorlik: qarzdorlik[0]?.sum || 0,
  });
}
