import mongoose from 'mongoose';
import { ROLES } from '../constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    status: { type: String, enum: ['onlayn', 'offlayn', 'bloklangan'], default: 'offlayn' },
    notificationPrefs: {
      applications: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      expiringContracts: { type: Boolean, default: true },
      violations: { type: Boolean, default: true },
      dailyEmailSummary: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
