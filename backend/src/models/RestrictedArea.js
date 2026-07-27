import mongoose from 'mongoose';

const restrictedAreaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['red_line', 'road', 'utility'], required: true },
    name: { type: String, default: '' },
    geometry: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
  },
  { timestamps: true },
);

restrictedAreaSchema.index({ geometry: '2dsphere' });

export default mongoose.model('RestrictedArea', restrictedAreaSchema);
