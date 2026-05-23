# @arcnautical/maritime-routing

[![npm version](https://img.shields.io/npm/v/@arcnautical/maritime-routing.svg?style=flat-square)](https://www.npmjs.com/package/@arcnautical/maritime-routing)
[![npm downloads](https://img.shields.io/npm/dm/@arcnautical/maritime-routing.svg?style=flat-square)](https://www.npmjs.com/package/@arcnautical/maritime-routing)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Tests: 42 passing](https://img.shields.io/badge/tests-42%20passing-success?style=flat-square)](./tests/maritime-routing.test.mts)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-success?style=flat-square)](./package.json)
[![GitHub stars](https://img.shields.io/github/stars/SaltyTaro/maritime-routing?style=flat-square)](https://github.com/SaltyTaro/maritime-routing)

Production-grade maritime routing engine for JavaScript/TypeScript. **Zero dependencies.**

Compute realistic ocean routes between any two ports worldwide, with guaranteed land avoidance, weather-aware ETA, and EEZ transit analysis.

## Why this exists

Every shipping tech startup reinvents maritime routing. The existing open-source options ([searoute-js](https://www.npmjs.com/package/searoute-js) — unmaintained since 2020, uses year-2000 data) are inadequate for production use. Commercial APIs charge EUR 600-6,900/year.

This library is extracted from [ArcNautical](https://arcnautical.com), a maritime risk intelligence platform. It has been tested against 1,790 real-world routes with 0% land crossing.

## Features

| Feature | Description |
|---------|-------------|
| **A\* Ocean Pathfinding** | Routes on a 0.05° ocean bitmap (7200x3600 cells) derived from OpenStreetMap. Routes are guaranteed to never cross land. |
| **Dijkstra Waypoint Routing** | 48 strategic chokepoints (Suez, Panama, Malacca, Gibraltar, etc.) with distance-weighted graph routing. |
| **510+ Port Database** | UN/LOCODE standard. Search by name, country, or code. Includes coordinates, port type, and ocean region. |
| **Weather Speed Model** | Beaufort-based speed reduction (Kwon 2008, Lu et al. 2015). Per vessel type and load condition. Direction-aware with Cbeta factors. |
| **EEZ Transit Analysis** | Detect which Exclusive Economic Zones a route transits. Sanctions flagging included. |
| **Avoid Zones** | Route around user-specified polygons (e.g., piracy areas, conflict zones). |
| **Via Waypoints** | Force routes through specific coordinates. |
| **GeoJSON Output** | All routes returned as GeoJSON LineString, ready for map rendering. |

## Install

```bash
npm install @arcnautical/maritime-routing
```

Requires Node.js >= 18.

## Quick Start

```ts
import { computeRoute } from '@arcnautical/maritime-routing';

// Compute a route from Singapore to Rotterdam
const route = computeRoute('SGSIN', 'NLRTM');

console.log(route.distance_nm);        // ~8,440 nm
console.log(route.duration_hours);      // ~603 hours at 14 knots
console.log(route.waypoints.length);    // waypoints transited
console.log(route.hazard_zones_crossed); // chokepoints on route

// GeoJSON for map rendering
const geojson = route.route_geojson;
// -> FeatureCollection with LineString geometry
```

## API Reference

### Route Computation

```ts
import {
  computeRoute,
  computeRouteInternal,
} from '@arcnautical/maritime-routing';

// Simple route (returns handler-compatible format)
const route = computeRoute('SGSIN', 'NLRTM');

// Route with options
const route = computeRoute('SGSIN', 'NLRTM', {
  avoid_zones: [[[30, 12], [50, 12], [50, 32], [30, 32], [30, 12]]], // avoid Red Sea
  via_waypoints: [{ lat: -34.4, lon: 18.5 }], // force via Cape of Good Hope
});

// Internal format (with segment breakdown)
const internal = computeRouteInternal('SGSIN', 'NLRTM');
console.log(internal.segments);       // per-leg distance + bearing
console.log(internal.totalDistanceNm);
console.log(internal.geojson);        // GeoJSON Feature
```

### Ocean Pathfinding

```ts
import { findOceanPath } from '@arcnautical/maritime-routing';

// Find a path between two coordinates
// Returns [lon, lat][] (GeoJSON convention)
const path = findOceanPath(1.26, 103.84, 51.90, 4.50);
// -> ~500 coordinate pairs, guaranteed to never cross land

// Performance: 8-50ms for typical segments
// Automatically subdivides routes > 5,000nm
```

### Port Database

```ts
import {
  searchPorts,
  getPortByLocode,
  getPortsByRegion,
  resolveAisDestination,
  findNearestPort,
  PORTS,
} from '@arcnautical/maritime-routing';

// Search by name, country, or LOCODE
const ports = searchPorts('Singapore');    // [{ locode: 'SGSIN', ... }]
const ports = searchPorts('Japan', 50);   // up to 50 results

// Exact lookup
const sg = getPortByLocode('SGSIN');      // { name: 'Singapore', lat: 1.26, ... }

// By region
const medPorts = getPortsByRegion('mediterranean'); // 30+ ports

// Parse messy AIS destination strings
const port = resolveAisDestination('NL RTM');   // -> Rotterdam
const port = resolveAisDestination('>>SGSIN<<'); // -> Singapore

// Find nearest port to coordinates
const port = findNearestPort(51.9, 4.5);  // -> Rotterdam

// All 510+ ports
console.log(PORTS.length);
```

### Weather Speed Model

```ts
import {
  computeSeaStateFactor,
  computeRouteEta,
  windToBeaufort,
  waveToBeaufort,
} from '@arcnautical/maritime-routing';

// Compute speed reduction from weather
const result = computeSeaStateFactor({
  baseSpeedKnots: 14,
  waveHeightM: 3.0,
  windSpeedKt: 25,
  swellHeightM: 1.5,
  vesselType: 'bulk',     // container | bulk | tanker | lng | general
  loadCondition: 'laden', // laden | ballast
  // Optional direction-aware inputs:
  waveDirectionDeg: 270,
  vesselHeadingDeg: 90,   // heading into waves = worst case
});

console.log(result.effectiveSpeedKnots); // reduced speed
console.log(result.beaufortNumber);      // 6
console.log(result.speedReductionPct);   // % reduction
console.log(result.seaStateFactor);      // 0-1 retention

// Compute ETA for a full route
const eta = computeRouteEta(
  segments,          // [{ distanceNm, bearing }]
  segmentWeather,    // per-segment weather data
  14,                // base speed (knots)
  'container',       // vessel type
  'laden',           // load condition
);
console.log(eta.totalTransitHours);
console.log(eta.worstSegmentIndex);
```

### EEZ Transit Analysis

```ts
import { analyzeRouteEezTransit } from '@arcnautical/maritime-routing';

const result = analyzeRouteEezTransit(segments, totalDistanceNm);

for (const eez of result.transitEezs) {
  console.log(`${eez.countryName}: ${(eez.routeFraction * 100).toFixed(1)}%`);
  if (eez.isSanctioned) console.log('  ⚠ SANCTIONED');
}

console.log(result.sanctionedEezFraction); // 0-1
console.log(result.summary);              // human-readable
```

### Geodesic Utilities

```ts
import {
  haversineDistance,
  haversineDistanceNm,
  bearing,
  interpolateGreatCircle,
  pointInPolygon,
} from '@arcnautical/maritime-routing';

// Distance in nautical miles
const nm = haversineDistanceNm(1.26, 103.84, 51.90, 4.50); // ~5,700

// Initial bearing (degrees)
const brg = bearing(1.26, 103.84, 51.90, 4.50); // ~315°

// Great circle arc interpolation
const points = interpolateGreatCircle(0, 0, 45, 90, 100);
// -> 101 [lat, lon] pairs along the arc

// Point-in-polygon test
const inside = pointInPolygon(5, 5, [[0,0], [10,0], [10,10], [0,10]]);
```

## Data Sources

| Data | Source | License |
|------|--------|---------|
| Ocean grid | OpenStreetMap water polygons | ODbL |
| Port database | UN/LOCODE + public maritime data | Public domain |
| Speed model | Kwon 2008, Lu et al. 2015 | Academic literature |
| EEZ boundaries | UN CLCS / Flanders Marine Institute | Public domain |
| Waypoint graph | Public maritime knowledge | N/A |

## Performance

| Operation | Time |
|-----------|------|
| Port lookup (by LOCODE) | < 0.1ms |
| Port search (by name) | < 1ms |
| Ocean pathfinding (single segment) | 8-50ms |
| Full route computation (Singapore → Rotterdam) | ~250ms |
| Speed model computation | < 0.1ms |
| Grid loading (first call only) | ~900ms |

Package size: ~200KB (compiled JS) + 106KB (ocean grid) + 90KB (EEZ data).

## Comparison with searoute-js

| Feature | @arcnautical/maritime-routing | searoute-js |
|---------|-------------------------------|-------------|
| Last updated | 2026 | 2020 |
| TypeScript | Native | No |
| Dependencies | **Zero** | Multiple |
| Land avoidance | **Guaranteed** (bitmap) | No (graph only) |
| Port database | 510+ ports | None |
| Weather model | Beaufort + Cbeta | None |
| EEZ analysis | Yes | None |
| Avoid zones | Yes | No |
| Via waypoints | Yes | No |
| Narrow passages | Suez, Panama, Bosphorus, etc. | Limited |
| Resolution | 0.05° (~5.5km) | Variable |
| Data source | OSM (2024) | ORNL (2000) |

## Advanced Usage

### Custom Ocean Grid

```ts
import { setGridPath, loadGridFromBuffer } from '@arcnautical/maritime-routing';

// Use a custom grid file
setGridPath('/path/to/my-ocean-grid.bin.gz');

// Or load from a buffer (e.g., fetched from CDN)
const buffer = await fetch('https://cdn.example.com/ocean-grid.bin.gz')
  .then(r => r.arrayBuffer());
loadGridFromBuffer(new Uint8Array(buffer));
```

### Generate Your Own Ocean Grid

The ocean grid is generated from OSM water polygon shapefiles:

```bash
# Download water polygons from osmdata.openstreetmap.de
# Then run the generator:
npx tsx scripts/generate-ocean-grid.ts /path/to/water_polygons.shp
```

### Ocean Regions

Ports are classified into 16 ocean regions used for routing:

`pacific`, `south_china_sea`, `southeast_asia`, `indian_ocean`, `persian_gulf`, `red_sea`, `mediterranean`, `atlantic_north`, `atlantic_south`, `caribbean`, `north_sea`, `baltic`, `black_sea`, `arctic`, `oceania`, `east_pacific`

### Vessel Types

The speed model supports 5 vessel types with distinct sea-keeping characteristics:

| Type | Reference Speed | Typical DWT |
|------|----------------|-------------|
| `container` | 20 kt | 50,000-200,000 |
| `bulk` | 14 kt | 30,000-400,000 |
| `tanker` | 14 kt | 50,000-320,000 |
| `lng` | 19 kt | 70,000-180,000 |
| `general` | 14 kt | 5,000-40,000 |

## License

MIT - see [LICENSE](LICENSE).

## About

Built by [ArcNautical](https://arcnautical.com) — maritime risk intelligence for fleet managers, underwriters, and compliance teams.

ArcNautical provides voyage risk scoring, sanctions screening, piracy/conflict threat intelligence, and automated compliance reports. The routing engine you're using here powers our commercial platform.

If you need maritime risk intelligence beyond routing, [get in touch](https://arcnautical.com).
