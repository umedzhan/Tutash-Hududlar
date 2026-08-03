import mongoose from 'mongoose';
import { INSPECTION_MODULE, VIOLATION_STATUS } from '../constants.js';

const landViolationSchema = new mongoose.Schema(
  {
    module: { type: String, enum: Object.values(INSPECTION_MODULE), required: true },
    inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionResult', default: null },
    address: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    areaM2: { type: Number, default: null },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', default: null },
    detectedDate: { type: Date, required: true },
    status: { type: String, enum: Object.values(VIOLATION_STATUS), default: VIOLATION_STATUS.ANIQLANGAN },
    description: { type: String, default: '' },
    files: { type: [String], default: [] },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resolutionNote: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('LandViolation', landViolationSchema);
