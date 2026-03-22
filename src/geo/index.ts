/**
 * Zero-dependency geospatial utilities for maritime routing.
 *
 * Replaces Turf.js with lightweight, purpose-built implementations:
 *   - Haversine distance (WGS84 geodesic)
 *   - Ray-casting point-in-polygon
 *   - Point-to-segment distance
 *   - Segment/polygon intersection
 *   - Route fraction in polygon
 *
 * All coordinates follow GeoJSON convention: [longitude, latitude].
 * Distances are in nautical miles unless otherwise noted.
 *
 * @module @arcnautical/maritime-routing/geo
 */

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_NM = 3440.065;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RouteSegment {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
}

export interface GeoEvent {
  lat: number;
  lon: number;
  timestamp?: number;
}

// ---------------------------------------------------------------------------
// Haversine distance (nautical miles)
// ---------------------------------------------------------------------------

/**
 * Compute the great-circle distance between two points in nautical miles.
 * Uses the haversine formula on a WGS84 sphere.
 */
export function haversineDistanceNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) *
      Math.cos(lat2 * DEG_TO_RAD) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_NM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Point-in-polygon (ray casting)
// ---------------------------------------------------------------------------

/**
 * Test if a point is inside a polygon using the ray-casting algorithm.
 *
 * @param lat - Latitude of the test point
 * @param lon - Longitude of the test point
 * @param polygon - Array of [lon, lat] pairs (GeoJSON convention).
 *   The ring does not need to be explicitly closed.
 */
export function pointInPolygon(
  lat: number,
  lon: number,
  polygon: Array<[number, number]>,
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const yi = polygon[i]![1];
    const yj = polygon[j]![1];
    if ((yi > lat) !== (yj > lat)) {
      const xi = polygon[i]![0];
      const xj = polygon[j]![0];
      if (lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

// ---------------------------------------------------------------------------
// Point-to-segment distance
// ---------------------------------------------------------------------------

/**
 * Compute the minimum distance from a point to a line segment in nautical miles.
 *
 * Projects the point onto the segment and returns the geodesic distance
 * to the nearest point on the segment (including endpoints).
 */
export function pointToSegmentDistanceNm(
  pointLat: number,
  pointLon: number,
  segStartLat: number,
  segStartLon: number,
  segEndLat: number,
  segEndLon: number,
): number {
  // Use projection in Cartesian approximation, then measure geodesic distance
  const dx = segEndLon - segStartLon;
  const dy = segEndLat - segStartLat;
  const lenSq = dx * dx + dy * dy;

  let t: number;
  if (lenSq === 0) {
    t = 0;
  } else {
    t = ((pointLon - segStartLon) * dx + (pointLat - segStartLat) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
  }

  const projLon = segStartLon + t * dx;
  const projLat = segStartLat + t * dy;

  return haversineDistanceNm(pointLat, pointLon, projLat, projLon);
}

// ---------------------------------------------------------------------------
// Point-to-route distance
// ---------------------------------------------------------------------------

/**
 * Compute the minimum distance from a point to any segment in a route.
 */
export function pointToRouteDistanceNm(
  pointLat: number,
  pointLon: number,
  segments: RouteSegment[],
): number {
  let minDist = Infinity;
  for (const seg of segments) {
    const d = pointToSegmentDistanceNm(
      pointLat,
      pointLon,
      seg.fromLat,
      seg.fromLon,
      seg.toLat,
      seg.toLon,
    );
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// ---------------------------------------------------------------------------
// Corridor filtering
// ---------------------------------------------------------------------------

/**
 * Filter geo-events to only those within a corridor around the route.
 */
export function filterEventsInCorridor<T extends GeoEvent>(
  events: T[],
  segments: RouteSegment[],
  corridorNm: number,
): Array<T & { distanceNm: number }> {
  const results: Array<T & { distanceNm: number }> = [];
  for (const event of events) {
    const distanceNm = pointToRouteDistanceNm(event.lat, event.lon, segments);
    if (distanceNm <= corridorNm) {
      results.push({ ...event, distanceNm });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Polygon intersection
// ---------------------------------------------------------------------------

/**
 * Check if a route segment intersects a polygon by sampling points along it.
 */
export function segmentIntersectsPolygon(
  segment: RouteSegment,
  polygon: Array<[number, number]>,
  samplePoints: number = 10,
): boolean {
  if (pointInPolygon(segment.fromLat, segment.fromLon, polygon)) return true;
  if (pointInPolygon(segment.toLat, segment.toLon, polygon)) return true;

  for (let i = 1; i < samplePoints; i++) {
    const t = i / samplePoints;
    const lat = segment.fromLat + t * (segment.toLat - segment.fromLat);
    const lon = segment.fromLon + t * (segment.toLon - segment.fromLon);
    if (pointInPolygon(lat, lon, polygon)) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Route fraction in polygon
// ---------------------------------------------------------------------------

/**
 * Calculate what fraction of a route's length passes through a polygon.
 */
export function routeFractionInPolygon(
  segments: RouteSegment[],
  polygon: Array<[number, number]>,
  totalDistanceNm: number,
): number {
  if (totalDistanceNm <= 0) return 0;

  let distanceInPolygon = 0;
  for (const seg of segments) {
    const segLen = haversineDistanceNm(
      seg.fromLat,
      seg.fromLon,
      seg.toLat,
      seg.toLon,
    );
    const samples = Math.max(5, Math.ceil(segLen / 20));

    let pointsInside = 0;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const lat = seg.fromLat + t * (seg.toLat - seg.fromLat);
      const lon = seg.fromLon + t * (seg.toLon - seg.fromLon);
      if (pointInPolygon(lat, lon, polygon)) pointsInside++;
    }

    distanceInPolygon += segLen * (pointsInside / (samples + 1));
  }

  return distanceInPolygon / totalDistanceNm;
}

// ---------------------------------------------------------------------------
// Decay functions
// ---------------------------------------------------------------------------

/** Exponential recency decay (lambda = 0.05/day). */
export function recencyDecay(
  timestampMs: number,
  nowMs: number = Date.now(),
): number {
  const ageDays = (nowMs - timestampMs) / (24 * 60 * 60 * 1000);
  if (ageDays < 0) return 1;
  return Math.exp(-0.05 * ageDays);
}

/** Linear proximity decay. Returns 0 at corridor edge, 1 at center. */
export function proximityDecay(
  distanceNm: number,
  corridorNm: number,
): number {
  if (distanceNm >= corridorNm) return 0;
  return 1 - distanceNm / corridorNm;
}
