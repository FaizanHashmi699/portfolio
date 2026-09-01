/** Qibla direction — the great-circle bearing from a location to the Kaaba. */

export const KAABA = { latitude: 21.4225, longitude: 39.8262 };

const DEG = Math.PI / 180;

/**
 * Initial great-circle bearing from a point to the Kaaba, in degrees
 * clockwise from true north.
 */
export function qiblaBearing(latitude: number, longitude: number): number {
  const phi1 = latitude * DEG;
  const phi2 = KAABA.latitude * DEG;
  const deltaLambda = (KAABA.longitude - longitude) * DEG;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  return (Math.atan2(y, x) / DEG + 360) % 360;
}

/** Great-circle distance to the Kaaba in kilometres. */
export function distanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371;
  const phi1 = latitude * DEG;
  const phi2 = KAABA.latitude * DEG;
  const dPhi = (KAABA.latitude - latitude) * DEG;
  const dLambda = (KAABA.longitude - longitude) * DEG;

  const a =
    Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** "ENE", "SE" and so on, for a bearing in degrees. */
export function compassPoint(bearing: number): string {
  const points = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  return points[Math.round(bearing / 22.5) % 16];
}
