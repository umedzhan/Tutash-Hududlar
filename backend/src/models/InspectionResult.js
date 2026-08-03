import mongoose from 'mongoose';
import { INSPECTION_MODULE } from '../constants.js';

const inspectionResultSchema = new mongoose.Schema(
  {
    module: { type: String, enum: Object.values(INSPECTION_MODULE), required: true },
    inspectionDate: { type: Date, required: true },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    areaM2: { type: Number, default: null },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', default: null },
    description: { type: String, default: '' },
    files: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('InspectionResult', inspectionResultSchema);
