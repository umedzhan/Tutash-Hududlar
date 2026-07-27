import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_TYPE } from '../constants.js';

const paymentSchema = new mongoose.Schema(
  {
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    type: { type: String, enum: Object.values(PAYMENT_TYPE), default: PAYMENT_TYPE.RENT },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date, default: null },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.KUTILMOQDA },
    method: { type: String, enum: ['click', 'payme', 'bank'], default: 'click' },
    transactionRef: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Payment', paymentSchema);
