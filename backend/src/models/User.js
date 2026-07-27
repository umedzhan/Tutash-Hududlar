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
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
