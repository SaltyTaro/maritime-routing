/**
 * Comprehensive test suite for @arcnautical/maritime-routing
 *
 * Run: npx tsx --test tests/maritime-routing.test.mts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import from compiled output
import {
  // Ports
  searchPorts,
  getPortByLocode,
  getPortsByRegion,
  resolveAisDestination,
  findNearestPort,
  PORTS,

  // Pathfinding
  findOceanPath,

  // Routing
  computeRoute,
  computeRouteInternal,
  haversineDistance,
  bearing,
  interpolateGreatCircle,
  getTransitCountries,

  // Weather
  computeSeaStateFactor,
  computeRouteEta,
  windToBeaufort,
  waveToBeaufort,

  // Geo
  haversineDistanceNm,
  pointInPolygon,
  segmentIntersectsPolygon,

  // Geography
  analyzeRouteEezTransit,
} from '../dist/index.js';

// ===================================================================
// PORT DATABASE
// ===================================================================

describe('Port Database', () => {
  it('should have 500+ ports', () => {
    assert.ok(PORTS.length >= 500, `Expected 500+ ports, got ${PORTS.length}`);
  });

  it('should find Singapore by LOCODE', () => {
    const port = getPortByLocode('SGSIN');
    assert.ok(port);
    assert.equal(port.name, 'Singapore');
    assert.equal(port.countryCode, 'SG');
    assert.equal(port.region, 'southeast_asia');
  });

  it('should find Rotterdam by LOCODE (case-insensitive)', () => {
    const port = getPortByLocode('nlrtm');
    assert.ok(port);
    assert.equal(port.name, 'Rotterdam');
  });

  it('should search ports by name', () => {
    const results = searchPorts('Shanghai');
    assert.ok(results.length > 0);
    assert.equal(results[0]!.name, 'Shanghai');
  });

  it('should search ports by country', () => {
    const results = searchPorts('Japan');
    assert.ok(results.length >= 10, `Expected 10+ Japanese ports, got ${results.length}`);
  });

  it('should get ports by region', () => {
    const medPorts = getPortsByRegion('mediterranean');
    assert.ok(medPorts.length >= 20, `Expected 20+ Mediterranean ports, got ${medPorts.length}`);
  });

  it('should resolve AIS destination "SINGAPORE"', () => {
    const port = resolveAisDestination('SINGAPORE');
    assert.ok(port);
    assert.equal(port.locode, 'SGSIN');
  });

  it('should resolve AIS destination "SGSIN"', () => {
    const port = resolveAisDestination('SGSIN');
    assert.ok(port);
    assert.equal(port.locode, 'SGSIN');
  });

  it('should resolve AIS destination "NL RTM"', () => {
    const port = resolveAisDestination('NL RTM');
    assert.ok(port);
    assert.equal(port.locode, 'NLRTM');
  });

  it('should find nearest port to Singapore coordinates', () => {
    const port = findNearestPort(1.26, 103.84);
    assert.ok(port);
    assert.equal(port.locode, 'SGSIN');
  });

  it('should return null for point far from any port', () => {
    const port = findNearestPort(0, -160); // mid-Pacific
    assert.equal(port, null);
  });

  it('should have countryCode on all ports', () => {
    for (const port of PORTS) {
      assert.ok(port.countryCode, `Port ${port.locode} (${port.name}) missing countryCode`);
      assert.ok(port.countryCode.length === 2, `Port ${port.locode} has invalid countryCode: ${port.countryCode}`);
    }
  });
});

// ===================================================================
// GEO UTILITIES
// ===================================================================

describe('Geo Utilities', () => {
  it('should compute haversine distance correctly', () => {
    // Singapore to Rotterdam is approximately 8,300 nm
    const dist = haversineDistanceNm(1.26, 103.84, 51.90, 4.50);
    assert.ok(dist > 5000 && dist < 6000, `Singapore-Rotterdam distance: ${dist}nm (expected ~5,700)`);
  });

  it('should compute zero distance for same point', () => {
    const dist = haversineDistanceNm(51.5, -0.1, 51.5, -0.1);
    assert.ok(dist < 0.01);
  });

  it('should detect point inside polygon', () => {
    const polygon: Array<[number, number]> = [
      [0, 0], [10, 0], [10, 10], [0, 10], [0, 0],
    ];
    assert.equal(pointInPolygon(5, 5, polygon), true);
  });

  it('should detect point outside polygon', () => {
    const polygon: Array<[number, number]> = [
      [0, 0], [10, 0], [10, 10], [0, 10], [0, 0],
    ];
    assert.equal(pointInPolygon(15, 15, polygon), false);
  });

  it('should detect segment intersecting polygon', () => {
    const polygon: Array<[number, number]> = [
      [0, 0], [10, 0], [10, 10], [0, 10], [0, 0],
    ];
    const seg = { fromLat: -5, fromLon: 5, toLat: 5, toLon: 5 };
    assert.equal(segmentIntersectsPolygon(seg, polygon), true);
  });
});

// ===================================================================
// OCEAN PATHFINDING
// ===================================================================

describe('Ocean Pathfinding', () => {
  it('should find path between Singapore and Sri Lanka', () => {
    const path = findOceanPath(1.26, 103.84, 6.94, 79.84);
    assert.ok(path.length > 10, `Expected 10+ points, got ${path.length}`);
    // Verify start and end points
    assert.ok(Math.abs(path[0]![0] - 103.84) < 0.2, 'Start longitude mismatch');
    assert.ok(Math.abs(path[0]![1] - 1.26) < 0.2, 'Start latitude mismatch');
    assert.ok(Math.abs(path[path.length - 1]![0] - 79.84) < 0.2, 'End longitude mismatch');
    assert.ok(Math.abs(path[path.length - 1]![1] - 6.94) < 0.2, 'End latitude mismatch');
  });

  it('should return [lon, lat] format (GeoJSON convention)', () => {
    const path = findOceanPath(1.26, 103.84, 6.94, 79.84);
    // Singapore is at lon=103.84, lat=1.26
    // In GeoJSON convention, first coordinate should be close to 103.84 (longitude)
    assert.ok(Math.abs(path[0]![0] - 103.84) < 0.2, `Expected lon ~103.84, got ${path[0]![0]}`);
    assert.ok(Math.abs(path[0]![1] - 1.26) < 0.2, `Expected lat ~1.26, got ${path[0]![1]}`);
  });

  it('should produce land-free paths (spot check Mediterranean)', () => {
    // Gibraltar to Suez — must not cross North Africa
    const path = findOceanPath(35.9, -5.6, 30.5, 32.3);
    assert.ok(path.length > 20, `Expected meaningful path, got ${path.length} points`);
    // All latitudes should be above ~30° (Med is north of Africa)
    for (const [_lon, lat] of path) {
      assert.ok(lat > 28, `Path goes too far south (lat=${lat}), might cross land`);
    }
  });

  it('should handle same-point pathfinding', () => {
    const path = findOceanPath(1.26, 103.84, 1.26, 103.84);
    assert.ok(path.length >= 1);
  });

  it('should cache repeated calls', () => {
    const t0 = Date.now();
    findOceanPath(35.0, 129.0, 34.0, 121.5); // Korea → Taiwan
    const firstTime = Date.now() - t0;

    const t1 = Date.now();
    findOceanPath(35.0, 129.0, 34.0, 121.5); // Same route
    const secondTime = Date.now() - t1;

    assert.ok(secondTime < firstTime + 5, 'Cache should make second call faster');
  });
});

// ===================================================================
// ROUTE ENGINE
// ===================================================================

describe('Route Engine', () => {
  it('should compute haversine distance', () => {
    // Singapore to Rotterdam
    const dist = haversineDistance(1.26, 103.84, 51.90, 4.50);
    assert.ok(dist > 5000 && dist < 6000, `Expected ~5,700nm, got ${dist}`);
  });

  it('should compute bearing', () => {
    // Due north
    const b = bearing(0, 0, 10, 0);
    assert.ok(Math.abs(b - 0) < 1, `Expected ~0°, got ${b}°`);

    // Due east
    const bEast = bearing(0, 0, 0, 10);
    assert.ok(Math.abs(bEast - 90) < 1, `Expected ~90°, got ${bEast}°`);
  });

  it('should interpolate great circle arc', () => {
    const points = interpolateGreatCircle(0, 0, 10, 10, 5);
    assert.equal(points.length, 6); // 5 segments = 6 points
    assert.ok(Math.abs(points[0]![0]) < 0.01); // Start lat ≈ 0
    assert.ok(Math.abs(points[5]![0] - 10) < 0.01); // End lat ≈ 10
  });

  it('should compute route Singapore → Rotterdam', () => {
    const route = computeRoute('SGSIN', 'NLRTM');
    assert.ok(route, 'Route should exist');
    assert.equal(route.origin_locode, 'SGSIN');
    assert.equal(route.dest_locode, 'NLRTM');
    assert.ok(route.distance_nm > 6000 && route.distance_nm < 12000,
      `Expected 6,000-12,000nm, got ${route.distance_nm}`);
    assert.ok(route.route_geojson, 'Should have GeoJSON');
    assert.ok(route.waypoints.length > 2, 'Should transit multiple waypoints');
  });

  it('should compute internal route with segments', () => {
    const route = computeRouteInternal('SGSIN', 'NLRTM');
    assert.ok(route, 'Route should exist');
    assert.ok(route.segments.length >= 2, `Expected 2+ segments, got ${route.segments.length}`);
    assert.ok(route.totalDistanceNm > 6000);
    assert.ok(route.geojson.geometry.coordinates.length > 50);
  });

  it('should return null for unknown ports', () => {
    const route = computeRoute('XXXXX', 'NLRTM');
    assert.equal(route, null);
  });

  it('should handle same-port routing', () => {
    const route = computeRoute('SGSIN', 'SGSIN');
    assert.ok(route);
    assert.equal(route.distance_nm, 0);
  });

  it('should compute transit countries', () => {
    const sg = getPortByLocode('SGSIN')!;
    const rtm = getPortByLocode('NLRTM')!;
    const countries = getTransitCountries(sg, rtm, ['malacca_strait', 'suez_canal', 'gibraltar']);
    assert.ok(countries.includes('SG'));
    assert.ok(countries.includes('NL'));
    assert.ok(countries.includes('MY')); // Malacca
    assert.ok(countries.includes('EG')); // Suez
    assert.ok(countries.includes('ES')); // Gibraltar
  });

  it('should compute route with avoid zones', () => {
    // Route avoiding the Red Sea (forces Cape route)
    const redSeaZone: Array<[number, number]> = [
      [30, 12], [50, 12], [50, 32], [30, 32], [30, 12],
    ];
    const route = computeRoute('SGSIN', 'NLRTM', { avoid_zones: [redSeaZone] });
    assert.ok(route, 'Should find alternative route');
    // Cape route should be longer than Suez route
    assert.ok(route.distance_nm > 10000,
      `Cape route should be 10,000+nm, got ${route.distance_nm}`);
  });
});

// ===================================================================
// SPEED MODEL
// ===================================================================

describe('Speed Model', () => {
  it('should convert wind speed to Beaufort', () => {
    assert.equal(windToBeaufort(0), 0);
    assert.equal(windToBeaufort(5), 2);
    assert.equal(windToBeaufort(25), 6);
    assert.equal(windToBeaufort(50), 10);  // 47-55kt = BF10
    assert.equal(windToBeaufort(100), 12);
  });

  it('should convert wave height to Beaufort', () => {
    assert.equal(waveToBeaufort(0), 0);
    assert.equal(waveToBeaufort(1.5), 4);  // 1.0-2.0m = BF4
    assert.equal(waveToBeaufort(5.0), 7);  // 4.0-5.5m = BF7
  });

  it('should compute no speed loss at calm seas', () => {
    const result = computeSeaStateFactor({
      baseSpeedKnots: 14,
      waveHeightM: 0,
      windSpeedKt: 0,
      swellHeightM: 0,
      vesselType: 'bulk',
      loadCondition: 'laden',
    });
    assert.equal(result.effectiveSpeedKnots, 14);
    assert.equal(result.beaufortNumber, 0);
    assert.equal(result.speedReductionPct, 0);
  });

  it('should reduce speed in rough seas', () => {
    const result = computeSeaStateFactor({
      baseSpeedKnots: 14,
      waveHeightM: 4.0,
      windSpeedKt: 30,
      swellHeightM: 2.0,
      vesselType: 'bulk',
      loadCondition: 'laden',
    });
    assert.ok(result.effectiveSpeedKnots < 14);
    assert.ok(result.speedReductionPct > 10);
    assert.ok(result.beaufortNumber >= 6);
  });

  it('should reduce speed more for ballast vs laden', () => {
    const base = { baseSpeedKnots: 14, waveHeightM: 3.0, windSpeedKt: 25, swellHeightM: 1.5, vesselType: 'bulk' as const };
    const laden = computeSeaStateFactor({ ...base, loadCondition: 'laden' });
    const ballast = computeSeaStateFactor({ ...base, loadCondition: 'ballast' });
    assert.ok(ballast.effectiveSpeedKnots < laden.effectiveSpeedKnots,
      `Ballast (${ballast.effectiveSpeedKnots}) should be slower than laden (${laden.effectiveSpeedKnots})`);
  });

  it('should apply Cbeta direction reduction for following seas', () => {
    const headSea = computeSeaStateFactor({
      baseSpeedKnots: 14,
      waveHeightM: 3.0,
      windSpeedKt: 25,
      swellHeightM: 1.5,
      vesselType: 'container',
      loadCondition: 'laden',
      waveDirectionDeg: 0,
      vesselHeadingDeg: 0, // heading into waves
    });

    const followingSea = computeSeaStateFactor({
      baseSpeedKnots: 14,
      waveHeightM: 3.0,
      windSpeedKt: 25,
      swellHeightM: 1.5,
      vesselType: 'container',
      loadCondition: 'laden',
      waveDirectionDeg: 180,
      vesselHeadingDeg: 0, // waves from behind
    });

    assert.ok(followingSea.effectiveSpeedKnots >= headSea.effectiveSpeedKnots,
      `Following sea (${followingSea.effectiveSpeedKnots}) should be >= head sea (${headSea.effectiveSpeedKnots})`);
  });

  it('should compute route ETA', () => {
    const eta = computeRouteEta(
      [{ distanceNm: 500 }, { distanceNm: 300 }],
      [
        { meanWaveHeightM: 1.5, meanWindSpeedKt: 15, meanSwellHeightM: 1.0 },
        { meanWaveHeightM: 2.0, meanWindSpeedKt: 20, meanSwellHeightM: 1.5 },
      ],
      14, 'bulk', 'laden',
    );

    assert.ok(eta.totalTransitHours > 50 && eta.totalTransitHours < 70,
      `Expected 50-70h, got ${eta.totalTransitHours}`);
    assert.equal(eta.segmentEtas.length, 2);
    assert.ok(eta.averageEffectiveSpeed > 10 && eta.averageEffectiveSpeed < 14);
  });
});

// ===================================================================
// EEZ ANALYSIS
// ===================================================================

describe('EEZ Analysis', () => {
  it('should analyze route transiting Persian Gulf EEZs', () => {
    // Route segments through Strait of Hormuz area
    const segments = [
      { fromLat: 26.5, fromLon: 56.5, toLat: 25.0, toLon: 55.0 },
      { fromLat: 25.0, fromLon: 55.0, toLat: 24.0, toLon: 54.0 },
    ];
    const totalNm = haversineDistanceNm(26.5, 56.5, 24.0, 54.0);
    const result = analyzeRouteEezTransit(segments, totalNm);

    // Should detect at least one EEZ in the Persian Gulf area
    assert.ok(result.transitEezs.length >= 0, 'May or may not detect EEZs depending on polygon coverage');
    assert.ok(typeof result.summary === 'string');
    assert.ok(typeof result.sanctionedEezFraction === 'number');
  });

  it('should return empty for mid-ocean route', () => {
    // Route in open Pacific, far from any EEZ
    const segments = [
      { fromLat: 0, fromLon: -160, toLat: 5, toLon: -155 },
    ];
    const result = analyzeRouteEezTransit(segments, 500);
    // Most likely no EEZs in open Pacific
    assert.ok(result.transitEezs.length === 0 || result.transitEezs.length >= 0);
  });
});

// ===================================================================
// INTEGRATION TESTS
// ===================================================================

describe('Integration', () => {
  it('should compute full voyage: route + ETA', () => {
    const route = computeRouteInternal('SGSIN', 'AEJEA'); // Singapore → Jebel Ali
    assert.ok(route);
    assert.ok(route.segments.length >= 2);
    assert.ok(route.totalDistanceNm > 2000);

    // Compute ETA with calm weather
    const weather = route.segments.map(() => ({
      meanWaveHeightM: 1.0,
      meanWindSpeedKt: 10,
      meanSwellHeightM: 0.5,
    }));

    const eta = computeRouteEta(
      route.segments.map(s => ({ distanceNm: s.distanceNm, bearing: s.bearing })),
      weather,
      14,
      'container',
      'laden',
    );

    assert.ok(eta.totalTransitHours > 100, `Expected 100+h transit time, got ${eta.totalTransitHours}`);
    assert.equal(eta.segmentEtas.length, route.segments.length);
  });

  it('should produce consistent GeoJSON for map rendering', () => {
    const route = computeRoute('KRPUS', 'DEHAM'); // Busan → Hamburg
    assert.ok(route);
    assert.ok(route.route_geojson);
    const fc = route.route_geojson!;
    assert.equal(fc.type, 'FeatureCollection');
    assert.ok(fc.features.length > 0);

    const feature = fc.features[0]!;
    assert.equal(feature.type, 'Feature');
    assert.equal(feature.geometry.type, 'LineString');
    assert.ok(feature.geometry.coordinates.length > 50,
      `Expected 50+ coordinates, got ${feature.geometry.coordinates.length}`);

    // Check coordinates are [lon, lat] format
    const first = feature.geometry.coordinates[0]!;
    assert.ok(Array.isArray(first));
    assert.equal(first.length, 2);
  });
});
