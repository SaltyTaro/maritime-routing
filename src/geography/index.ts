/**
 * EEZ Transit Analyzer — determines which Exclusive Economic Zones a route transits.
 *
 * Uses simplified EEZ polygons to detect when a maritime route passes through
 * a country's jurisdictional waters. Enhances routing with jurisdictional
 * awareness for compliance, sanctions screening, and risk assessment.
 *
 * @module @arcnautical/maritime-routing/geography
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  segmentIntersectsPolygon,
  routeFractionInPolygon,
  type RouteSegment,
} from '../geo/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EezZone {
  countryCode: string;
  countryName: string;
  riskCategory: 'sanctioned' | 'conflict' | 'piracy' | 'chokepoint' | 'context';
  polygon: Array<[number, number]>;
}

export interface EezTransitEntry {
  countryCode: string;
  countryName: string;
  riskCategory: string;
  /** Fraction of route that transits this EEZ (0-1) */
  routeFraction: number;
  /** Whether the country is under sanctions */
  isSanctioned: boolean;
  /** Polygon coordinates for map rendering [lon, lat] pairs */
  polygon: Array<[number, number]>;
}

export interface EezTransitResult {
  transitEezs: EezTransitEntry[];
  /** Total fraction of route in sanctioned EEZs (0-1) */
  sanctionedEezFraction: number;
  /** Human-readable summary */
  summary: string;
}

// ---------------------------------------------------------------------------
// EEZ data loading
// ---------------------------------------------------------------------------

const SANCTIONED_CATEGORIES = new Set(['sanctioned']);

let eezZones: EezZone[] | null = null;

function loadEezZones(): EezZone[] {
  if (eezZones) return eezZones;

  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Look for data in data/ relative to package root
    const candidates = [
      join(__dirname, '..', '..', 'data', 'eez-zones.json'),
      join(__dirname, '..', 'data', 'eez-zones.json'),
    ];

    let raw: string | null = null;
    for (const p of candidates) {
      try {
        raw = readFileSync(p, 'utf-8');
        break;
      } catch { /* try next */ }
    }

    if (!raw) {
      eezZones = [];
      return eezZones;
    }

    const geojson = JSON.parse(raw) as {
      features: Array<{
        properties: Record<string, unknown>;
        geometry: { type: string; coordinates: unknown };
      }>;
    };

    eezZones = [];
    for (const f of geojson.features) {
      const countryCode = String(f.properties?.countryCode ?? '');
      const countryName = String(f.properties?.countryName ?? '');
      const riskCategory = (f.properties?.riskCategory ?? 'context') as EezZone['riskCategory'];
      if (!countryCode) continue;

      if (f.geometry.type === 'Polygon') {
        const ring = (f.geometry.coordinates as number[][][])[0] as Array<[number, number]>;
        if (ring && ring.length >= 3) {
          eezZones.push({ countryCode, countryName, riskCategory, polygon: ring });
        }
      } else if (f.geometry.type === 'MultiPolygon') {
        for (const polyCoords of f.geometry.coordinates as number[][][][]) {
          const ring = polyCoords[0] as Array<[number, number]>;
          if (ring && ring.length >= 3) {
            eezZones.push({ countryCode, countryName, riskCategory, polygon: ring });
          }
        }
      }
    }

    return eezZones;
  } catch {
    eezZones = [];
    return eezZones;
  }
}

// ---------------------------------------------------------------------------
// Main analysis function
// ---------------------------------------------------------------------------

/**
 * Analyze which EEZs a route transits and what fraction of the route
 * passes through each zone.
 *
 * @example
 * ```ts
 * import { analyzeRouteEezTransit } from '@arcnautical/maritime-routing/geography';
 *
 * const result = analyzeRouteEezTransit(segments, totalDistanceNm);
 * for (const eez of result.transitEezs) {
 *   console.log(`${eez.countryName}: ${(eez.routeFraction * 100).toFixed(1)}%`);
 * }
 * ```
 */
export function analyzeRouteEezTransit(
  segments: RouteSegment[],
  totalDistanceNm: number,
): EezTransitResult {
  const zones = loadEezZones();

  if (zones.length === 0 || segments.length === 0) {
    return {
      transitEezs: [],
      sanctionedEezFraction: 0,
      summary: 'EEZ data unavailable',
    };
  }

  const countryMap = new Map<string, { zone: EezZone; totalFraction: number }>();

  for (const zone of zones) {
    let intersects = false;
    for (const seg of segments) {
      if (segmentIntersectsPolygon(seg, zone.polygon)) {
        intersects = true;
        break;
      }
    }

    if (!intersects) continue;

    const fraction = routeFractionInPolygon(segments, zone.polygon, totalDistanceNm);
    if (fraction < 0.001) continue;

    const existing = countryMap.get(zone.countryCode);
    if (existing) {
      existing.totalFraction += fraction;
    } else {
      countryMap.set(zone.countryCode, { zone, totalFraction: fraction });
    }
  }

  const transitEezs: EezTransitEntry[] = [];
  let sanctionedEezFraction = 0;

  for (const [, { zone, totalFraction }] of countryMap) {
    const isSanctioned = SANCTIONED_CATEGORIES.has(zone.riskCategory);

    transitEezs.push({
      countryCode: zone.countryCode,
      countryName: zone.countryName,
      riskCategory: zone.riskCategory,
      routeFraction: Math.round(totalFraction * 1000) / 1000,
      isSanctioned,
      polygon: zone.polygon,
    });

    if (isSanctioned) {
      sanctionedEezFraction += totalFraction;
    }
  }

  transitEezs.sort((a, b) => b.routeFraction - a.routeFraction);

  const summaryParts: string[] = [];
  if (transitEezs.length === 0) {
    summaryParts.push('Route does not transit any monitored EEZ');
  } else {
    const sanctionedEezs = transitEezs.filter(e => e.isSanctioned);
    if (sanctionedEezs.length > 0) {
      summaryParts.push(
        `Route transits ${sanctionedEezs.length} sanctioned EEZ(s): ${sanctionedEezs.map(e => `${e.countryName} (${Math.round(e.routeFraction * 100)}%)`).join(', ')}`,
      );
    }
    const otherEezs = transitEezs.filter(e => !e.isSanctioned);
    if (otherEezs.length > 0) {
      summaryParts.push(
        `${otherEezs.length} other EEZ(s): ${otherEezs.map(e => `${e.countryName} (${Math.round(e.routeFraction * 100)}%)`).join(', ')}`,
      );
    }
  }

  return {
    transitEezs,
    sanctionedEezFraction: Math.round(sanctionedEezFraction * 1000) / 1000,
    summary: summaryParts.join('. '),
  };
}

/**
 * Get country codes from EEZ transit for merging into transit countries.
 */
export function getEezTransitCountries(eezResult: EezTransitResult): string[] {
  return eezResult.transitEezs.map(e => e.countryCode);
}
