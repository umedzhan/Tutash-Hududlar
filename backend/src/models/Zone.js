import mongoose from 'mongoose';

// Zonalar endi mahalla nomiga bog'liq (Termiz shahar Xalq deputatlari Kengashining
// yer solig'i stavkalari to'g'risidagi qaroridagi mahalla koeffitsiyentlariga asosan) —
// mahalla chegaralari GIS ma'lumoti mavjud bo'lmaganligi sababli geometriya ixtiyoriy.
const zoneSchema = new mongoose.Schema(
  {
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    name: { type: String, required: true, trim: true },
    coefficient: { type: Number, required: true },
    geometry: {
      type: { type: String, enum: ['Polygon'] },
      coordinates: { type: [[[Number]]] },
    },
  },
  { timestamps: true },
);

zoneSchema.index({ geometry: '2dsphere' });

export default mongoose.model('Zone', zoneSchema);
