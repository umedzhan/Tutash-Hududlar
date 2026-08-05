import mongoose from 'mongoose';

const registrationRequestSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    stir: { type: String, required: true, trim: true },
    director: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', default: null },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
    address: { type: String, default: '' },
    cadastreNumber: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['kutilmoqda', 'tasdiqlangan', 'rad_etilgan'], default: 'kutilmoqda' },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('RegistrationRequest', registrationRequestSchema);
