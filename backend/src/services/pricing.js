import * as turf from '@turf/turf';
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
// Kzona ko'p zonaga tushgan holatda maydon ulushiga proporsional og'irlashtirilgan o'rtacha
export async function calculatePrice({ geometry, areaM2, districtId, purposeId, usageType, dateFrom, dateTo }) {
  const [district, purpose, tariff] = await Promise.all([
    District.findById(districtId),
    Purpose.findById(purposeId),
    Tariff.findOne({ validFrom: { $lte: new Date() } }).sort({ validFrom: -1 }),
  ]);
  if (!district) throw new PricingError('Tuman topilmadi');
  if (!purpose) throw new PricingError('Foydalanish maqsadi topilmadi');
  if (!tariff) throw new PricingError('Amaldagi tarif topilmadi');

  const polygon = turf.polygon(geometry.coordinates);
  const zones = await Zone.find({ districtId, geometry: { $geoIntersects: { $geometry: geometry } } });

  let weightedZoneSum = 0;
  let coveredArea = 0;
  for (const zone of zones) {
    const zonePolygon = turf.polygon(zone.geometry.coordinates);
    let intersection = null;
    try {
      intersection = turf.intersect(turf.featureCollection([polygon, zonePolygon]));
    } catch {
      intersection = null;
    }
    if (!intersection) continue;
    const partArea = turf.area(intersection);
    weightedZoneSum += zone.coefficient * partArea;
    coveredArea += partArea;
  }
  const kZona = coveredArea > 0 ? weightedZoneSum / coveredArea : 1.0;

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
      kzona: Math.round(kZona * 100) / 100,
      kmaqsad: purpose.coefficient,
      kmavsum: kMavsum,
    },
    tariffId: tariff._id,
    calculatedAt: new Date(),
  };
}
