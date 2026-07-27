import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['central', 'middle', 'outer'], required: true },
    coefficient: { type: Number, required: true },
    geometry: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
  },
  { timestamps: true },
);

zoneSchema.index({ geometry: '2dsphere' });

export default mongoose.model('Zone', zoneSchema);
