import mongoose from 'mongoose';

const tariffSchema = new mongoose.Schema(
  {
    baseRate: { type: Number, required: true }, // Sbaza — 1 m² uchun yillik boshlang'ich narx (so'm); eng past tumandagi yillik yer solig'i bazaviy stavkasi asosida — ijara yiliga bir marta to'lanadi
    seasonalCoefficient: { type: Number, default: 1.2 }, // Kmavsum (mavsumiy foydalanish uchun)
    penaltyRatePerDay: { type: Number, default: 0.001 }, // kuniga 0,1%
    penaltyCapPercent: { type: Number, default: 0.15 }, // asosiy qarzning 15% idan oshmaydi
    minAreaM2: { type: Number, default: 5 },
    maxAreaM2: { type: Number, default: 500 },
    validFrom: { type: Date, required: true, default: Date.now },
    validTo: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Tariff', tariffSchema);
