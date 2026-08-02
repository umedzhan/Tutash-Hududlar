import mongoose from 'mongoose';
import { REGION_STATUS } from '../constants.js';

const regionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    region: { type: String, default: 'Termiz shahri' },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', default: null },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
    geometry: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
    areaM2: { type: Number, required: true },
    status: { type: String, enum: Object.values(REGION_STATUS), default: REGION_STATUS.BOSH },
    currentContractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },
  },
  { timestamps: true },
);

regionSchema.index({ geometry: '2dsphere' });

export default mongoose.model('Region', regionSchema);
