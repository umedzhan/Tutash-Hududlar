import District from '../models/District.js';
import Zone from '../models/Zone.js';
import Purpose from '../models/Purpose.js';
import Tariff from '../models/Tariff.js';

export class PricingError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

function monthsBetween(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months + (end.getDate() >= start.getDate() ? 1 : 0));
}

// oylik_ijara = Sbaza x M x Ktuman x Kzona x Kmaqsad x Kmavsum
// Kzona — tadbirkor tanlagan mahalla (Zone) uchun belgilangan koeffitsiyent
// (Termiz shahar Xalq deputatlari Kengashining yer solig'i stavkalari qaroriga asosan).
export async function calculatePrice({ areaM2, districtId, purposeId, zoneId, usageType, dateFrom, dateTo }) {
  const [district, purpose, zone, tariff] = await Promise.all([
    District.findById(districtId),
    Purpose.findById(purposeId),
    Zone.findById(zoneId),
    Tariff.findOne({ validFrom: { $lte: new Date() } }).sort({ validFrom: -1 }),
  ]);
  if (!district) throw new PricingError('Tuman topilmadi');
  if (!purpose) throw new PricingError('Foydalanish maqsadi topilmadi');
  if (!zone) throw new PricingError('Mahalla (zona) topilmadi');
  if (!tariff) throw new PricingError('Amaldagi tarif topilmadi');

  const kZona = zone.coefficient;

  const isSeasonal = usageType.toLowerCase().includes('mavsum');
  const kMavsum = isSeasonal ? tariff.seasonalCoefficient : 1.0;

  const monthlyRent = Math.round(tariff.baseRate * areaM2 * district.coefficient * kZona * purpose.coefficient * kMavsum);
  const months = monthsBetween(dateFrom, dateTo);
  const exploitationFee = Math.round(tariff.exploitationRate * areaM2 * months);
  const total = monthlyRent * months + exploitationFee;

  return {
    monthlyRent,
    exploitationFee,
    months,
    total,
    breakdown: {
      sbaza: tariff.baseRate,
      m: areaM2,
      ktuman: district.coefficient,
      kzona: kZona,
      kmaqsad: purpose.coefficient,
      kmavsum: kMavsum,
      zoneName: zone.name,
    },
    tariffId: tariff._id,
    calculatedAt: new Date(),
  };
}
