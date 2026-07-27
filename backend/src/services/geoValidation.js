import * as turf from '@turf/turf';
import Region from '../models/Region.js';
import Application from '../models/Application.js';
import RestrictedArea from '../models/RestrictedArea.js';
import Tariff from '../models/Tariff.js';
import { REGION_STATUS, APPLICATION_STATUS } from '../constants.js';

export class GeometryValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.status = 400;
    this.details = details;
  }
}

const OCCUPYING_REGION_STATUSES = [
  REGION_STATUS.BAND,
  REGION_STATUS.MUAMMOLI,
  REGION_STATUS.AVTOTURARGOH,
  REGION_STATUS.ZAXIRADA,
];

const ACTIVE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.IN_REVIEW_CADASTRE,
  APPLICATION_STATUS.IN_REVIEW_ARCHITECTURE,
  APPLICATION_STATUS.IN_REVIEW_TAX,
  APPLICATION_STATUS.FINAL_APPROVAL,
  APPLICATION_STATUS.AWAITING_CONSENT,
  APPLICATION_STATUS.INFO_REQUESTED,
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.CONTRACT_GENERATED,
  APPLICATION_STATUS.SIGNED,
  APPLICATION_STATUS.ACTIVE,
];

// Chizilgan poligonni tekshiradi: shakl to'g'riligi, maydon chegarasi, band hududlar/
// boshqa faol arizalar/taqiqlangan zonalar bilan kesishuv. Kesishsa aniq sabab bilan xato qaytaradi.
export async function validateGeometry({ geometry, excludeApplicationId = null }) {
  if (!geometry || geometry.type !== 'Polygon' || !Array.isArray(geometry.coordinates)) {
    throw new GeometryValidationError("Chizma noto'g'ri formatda");
  }
  const ring = geometry.coordinates[0];
  if (!ring || ring.length < 4) {
    throw new GeometryValidationError('Kamida 3 nuqta chizilishi kerak');
  }
  if (ring.length > 500) {
    throw new GeometryValidationError('Nuqtalar soni 500 dan oshmasligi kerak');
  }
  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];
  if (firstLng !== lastLng || firstLat !== lastLat) {
    throw new GeometryValidationError("Chizma halqasi yopilmagan");
  }

  let polygon;
  try {
    polygon = turf.polygon(geometry.coordinates);
  } catch {
    throw new GeometryValidationError("Chizma geometriyasi noto'g'ri");
  }

  const areaM2 = Math.round(turf.area(polygon));

  const tariff = await Tariff.findOne().sort({ validFrom: -1 });
  const minArea = tariff?.minAreaM2 ?? 5;
  const maxArea = tariff?.maxAreaM2 ?? 500;
  if (areaM2 < minArea || areaM2 > maxArea) {
    throw new GeometryValidationError(
      `Maydon ${minArea} m² dan ${maxArea} m² gacha bo'lishi kerak (hozirgi: ${areaM2} m²)`,
      { code: 'AREA_OUT_OF_RANGE', areaM2, minArea, maxArea },
    );
  }

  const candidateRegions = await Region.find({
    status: { $in: OCCUPYING_REGION_STATUSES },
    geometry: { $geoIntersects: { $geometry: geometry } },
  });
  for (const region of candidateRegions) {
    const other = turf.polygon(region.geometry.coordinates);
    if (turf.booleanIntersects(polygon, other)) {
      throw new GeometryValidationError(`Chizma "${region.address}" bandi bilan kesishmoqda`, {
        code: 'PLOT_OVERLAP',
        regionId: region._id,
      });
    }
  }

  const applicationFilter = {
    status: { $in: ACTIVE_APPLICATION_STATUSES },
    geometry: { $geoIntersects: { $geometry: geometry } },
  };
  if (excludeApplicationId) {
    applicationFilter._id = { $ne: excludeApplicationId };
  }
  const candidateApplications = await Application.find(applicationFilter);
  for (const app of candidateApplications) {
    const other = turf.polygon(app.geometry.coordinates);
    if (turf.booleanIntersects(polygon, other)) {
      throw new GeometryValidationError(`Chizma "${app.applicationNumber}" arizasi bilan kesishmoqda`, {
        code: 'APPLICATION_OVERLAP',
        applicationId: app._id,
      });
    }
  }

  const restrictedCandidates = await RestrictedArea.find({
    geometry: { $geoIntersects: { $geometry: geometry } },
  });
  for (const area of restrictedCandidates) {
    const other = turf.polygon(area.geometry.coordinates);
    if (turf.booleanIntersects(polygon, other)) {
      throw new GeometryValidationError('Chizma taqiqlangan zona bilan kesishmoqda', {
        code: 'RESTRICTED_AREA',
        areaId: area._id,
      });
    }
  }

  return { areaM2 };
}
