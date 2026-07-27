const EARTH_RADIUS_M = 6378137;

// Kichik uchastkalar uchun taxminiy geodezik yuza (ekvirektangulyar proyeksiya, m²)
export function polygonAreaM2(ring: [number, number][]): number {
  if (ring.length < 3) return 0;

  const latRef = (ring.reduce((sum, [, lat]) => sum + lat, 0) / ring.length) * (Math.PI / 180);
  const cosLat = Math.cos(latRef);

  const points = ring.map(([lng, lat]) => ({
    x: (lng * Math.PI) / 180 * EARTH_RADIUS_M * cosLat,
    y: (lat * Math.PI) / 180 * EARTH_RADIUS_M,
  }));

  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.round(Math.abs(area) / 2);
}
