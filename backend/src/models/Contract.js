import mongoose from 'mongoose';
import { CONTRACT_STATUS } from '../constants.js';

const contractSchema = new mongoose.Schema(
  {
    contractNumber: { type: String, required: true, unique: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    hududId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', default: null },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
    purposeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purpose', default: null },
    geometry: {
      type: { type: String, enum: ['Polygon'], default: null },
      coordinates: { type: [[[Number]]], default: undefined },
    },
    areaM2: { type: Number, default: null },
    priceSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    rentPayment: { type: Number, required: true },
    operationalPayment: { type: Number, required: true },
    total: { type: Number, required: true },
    period: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    status: { type: String, enum: Object.values(CONTRACT_STATUS), default: CONTRACT_STATUS.FAOL },
    pdfPath: { type: String, default: null },
    eSign: {
      signed: { type: Boolean, default: false },
      signedAt: { type: Date, default: null },
      mockSignatureId: { type: String, default: null },
    },
  },
  { timestamps: true },
);

export default mongoose.model('Contract', contractSchema);
