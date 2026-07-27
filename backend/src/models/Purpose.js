import mongoose from 'mongoose';

const purposeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    coefficient: { type: Number, required: true },
    seasonalAllowed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Purpose', purposeSchema);
