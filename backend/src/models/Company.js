import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    stir: { type: String, required: true, trim: true },
    director: { type: String, required: true, trim: true },
    phones: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 3,
        message: '1 tadan 3 tagacha telefon raqam kiritish mumkin',
      },
    },
    email: { type: String, trim: true, default: '' },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', default: null },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
    address: { type: String, trim: true, default: '' },
    registrationDocument: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Company', companySchema);
