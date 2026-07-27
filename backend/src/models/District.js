import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    coefficient: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('District', districtSchema);
