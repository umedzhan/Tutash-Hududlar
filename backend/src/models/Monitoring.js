import mongoose from 'mongoose';
import { MONITORING_STATUS } from '../constants.js';

const monitoringSchema = new mongoose.Schema(
  {
    hududId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    inspectionDate: { type: Date, required: true },
    status: { type: String, enum: Object.values(MONITORING_STATUS), required: true },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
    photos: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('Monitoring', monitoringSchema);
