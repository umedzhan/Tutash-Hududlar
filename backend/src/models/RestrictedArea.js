import mongoose from 'mongoose';
import { RESTRICTED_AREA_TYPE } from '../constants.js';

const restrictedAreaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(RESTRICTED_AREA_TYPE), required: true },
    name: { type: String, default: '' },
    geometry: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

restrictedAreaSchema.index({ geometry: '2dsphere' });

export default mongoose.model('RestrictedArea', restrictedAreaSchema);
