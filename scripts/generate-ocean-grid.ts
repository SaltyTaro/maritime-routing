/**
 * Ocean Grid Generator
 *
 * Reads OSM water-polygons-split-4326 shapefile and generates a packed
 * bitmap of ocean/land cells at 0.05° resolution (~5.5km at equator).
 *
 * Usage: npx tsx scripts/generate-ocean-grid.ts <path-to-water_polygons.shp>
 *
 * Output: server/arcnautical/routing/v1/ocean-grid.bin.gz
 *   - Packed bitmap: 7200×3600 cells, 1 bit per cell (1=water, 0=land)
 *   - Gzip compressed (~200-400KB)
 */

import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { gzipSync } from 'zlib';
import { resolve } from 'path';

const esmRequire = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Grid parameters
// ---------------------------------------------------------------------------

const RESOLUTION = 0.05;
const LON_CELLS = 7200;  // -180 to +180
const LAT_CELLS = 3600;  // -90 to +90
const TOTAL_CELLS = LON_CELLS * LAT_CELLS;
const TOTAL_BYTES = Math.ceil(TOTAL_CELLS / 8);

const bitmap = new Uint8Array(TOTAL_BYTES);

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

function coordToCell(lon: number, lat: number): [number, number] {
  const ix = Math.floor((lon + 180) / RESOLUTION);
  const iy = Math.floor((lat + 90) / RESOLUTION);
  return [
    Math.max(0, Math.min(LON_CELLS - 1, ix)),
    Math.max(0, Math.min(LAT_CELLS - 1, iy)),
  ];
}

function cellToCoord(ix: number, iy: number): [number, number] {
  return [-180 + (ix + 0.5) * RESOLUTION, -90 + (iy + 0.5) * RESOLUTION];
}

function setWater(ix: number, iy: number) {
  const idx = iy * LON_CELLS + ix;
  bitmap[idx >> 3] |= 1 << (idx & 7);
}

function isWater(ix: number, iy: number): boolean {
  const idx = iy * LON_CELLS + ix;
  return (bitmap[idx >> 3]! & (1 << (idx & 7))) !== 0;
}

function countWater(): number {
  let count = 0;
  for (let i = 0; i < TOTAL_BYTES; i++) {
    let b = bitmap[i]!;
    while (b) { count++; b &= b - 1; }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Fast ray-casting point-in-polygon
// ---------------------------------------------------------------------------

function pointInRing(px: number, py: number, ring: number[][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const yi = ring[i]![1]!, yj = ring[j]![1]!;
    if ((yi > py) !== (yj > py)) {
      const xi = ring[i]![0]!, xj = ring[j]![0]!;
      if (px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

// ---------------------------------------------------------------------------
// Polygon processing
// ---------------------------------------------------------------------------

function processPolygon(rings: number[][][]) {
  const outerRing = rings[0];
  if (!outerRing || outerRing.length < 3) return;

  // Bounding box from outer ring
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  for (const coord of outerRing) {
    const lon = coord[0]!, lat = coord[1]!;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  const [ix0, iy0] = coordToCell(minLon, minLat);
  const [ix1, iy1] = coordToCell(maxLon, maxLat);

  // Skip tiny polygons (smaller than one cell)
  if (ix0 === ix1 && iy0 === iy1) return;

  const holeRings = rings.slice(1);

  for (let iy = iy0; iy <= iy1; iy++) {
    for (let ix = ix0; ix <= ix1; ix++) {
      if (isWater(ix, iy)) continue;

      const [lon, lat] = cellToCoord(ix, iy);

      if (!pointInRing(lon, lat, outerRing)) continue;

      // Check holes (islands inside the water polygon)
      let inHole = false;
      for (const hole of holeRings) {
        if (pointInRing(lon, lat, hole)) { inHole = true; break; }
      }
      if (inHole) continue;

      setWater(ix, iy);
    }
  }
}

// ---------------------------------------------------------------------------
// Forced water cells for narrow passages
// ---------------------------------------------------------------------------

const FORCED_PATHS = [
  {
    name: 'Bosphorus',
    points: [[29.05, 41.0], [29.02, 41.06], [29.0, 41.12], [29.02, 41.18], [29.05, 41.22]],
  },
  {
    name: 'Dardanelles',
    points: [[26.2, 40.05], [26.35, 40.12], [26.5, 40.2], [26.6, 40.3], [26.7, 40.4]],
  },
  {
    name: 'Sea of Marmara',
    points: [[29.0, 40.72], [28.6, 40.7], [28.2, 40.68], [27.8, 40.65], [27.4, 40.6], [27.0, 40.5], [26.7, 40.4]],
  },
  {
    name: 'Suez Canal',
    points: [[32.32, 31.27], [32.33, 31.0], [32.34, 30.7], [32.38, 30.4], [32.45, 30.1], [32.55, 29.97]],
  },
  {
    name: 'Panama Canal',
    points: [[-79.92, 9.38], [-79.85, 9.3], [-79.75, 9.2], [-79.65, 9.1], [-79.55, 9.0], [-79.5, 8.95]],
  },
  {
    name: 'Kiel Canal',
    points: [[9.14, 53.89], [9.35, 53.95], [9.55, 54.05], [9.75, 54.15], [9.95, 54.25], [10.15, 54.33]],
  },
  {
    name: 'Strait of Messina',
    points: [[15.58, 38.0], [15.62, 38.15], [15.65, 38.3]],
  },
  {
    name: 'Corinth Canal',
    points: [[22.93, 37.92], [22.97, 37.94], [23.0, 37.97]],
  },
];

function bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const cells: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0, cy = y0;

  while (true) {
    cells.push([cx, cy]);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
  return cells;
}

function applyForcedPaths() {
  for (const path of FORCED_PATHS) {
    let forced = 0;
    for (let i = 0; i < path.points.length - 1; i++) {
      const [lon0, lat0] = path.points[i]!;
      const [lon1, lat1] = path.points[i + 1]!;
      const [ix0, iy0] = coordToCell(lon0!, lat0!);
      const [ix1, iy1] = coordToCell(lon1!, lat1!);

      for (const [cx, cy] of bresenhamLine(ix0, iy0, ix1, iy1)) {
        // 5-cell wide brush (±2 cells) to ensure canals are wide enough
        // for A* smoothing with corridor margin=2
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < LON_CELLS && ny >= 0 && ny < LAT_CELLS && !isWater(nx, ny)) {
              setWater(nx, ny);
              forced++;
            }
          }
        }
      }
    }
    console.log(`  ${path.name}: ${forced} cells forced`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const shpPath = process.argv[2];
  if (!shpPath) {
    console.error('Usage: npx tsx scripts/generate-ocean-grid.ts <path-to-water_polygons.shp>');
    process.exit(1);
  }

  const outputPath = resolve(
    process.argv[3] ?? 'server/arcnautical/routing/v1/ocean-grid.bin.gz',
  );

  console.log(`Grid: ${LON_CELLS}x${LAT_CELLS} @ ${RESOLUTION}° (${TOTAL_CELLS.toLocaleString()} cells)`);
  console.log(`Reading: ${shpPath}\n`);

  const shapefile = esmRequire('shapefile');
  const t0 = Date.now();
  const source = await shapefile.open(shpPath);
  let count = 0;

  while (true) {
    const result = await source.read();
    if (result.done) break;

    const geom = result.value?.geometry;
    if (!geom) continue;

    if (geom.type === 'Polygon') {
      processPolygon(geom.coordinates);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) processPolygon(poly);
    }

    count++;
    if (count % 5000 === 0) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  ${count} polygons (${elapsed}s) — ${countWater().toLocaleString()} water cells`);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const water = countWater();
  console.log(`\nDone: ${count} polygons in ${elapsed}s`);
  console.log(`Water: ${water.toLocaleString()} / ${TOTAL_CELLS.toLocaleString()} (${(water / TOTAL_CELLS * 100).toFixed(1)}%)`);

  console.log('\nForcing narrow passages:');
  applyForcedPaths();

  const finalWater = countWater();
  console.log(`\nFinal: ${finalWater.toLocaleString()} water cells (${(finalWater / TOTAL_CELLS * 100).toFixed(1)}%)`);

  // Compress and write
  const compressed = gzipSync(Buffer.from(bitmap.buffer), { level: 9 });
  console.log(`Raw: ${(TOTAL_BYTES / 1024).toFixed(0)} KB → Gzipped: ${(compressed.length / 1024).toFixed(0)} KB`);

  writeFileSync(outputPath, compressed);
  console.log(`Written: ${outputPath}`);

  // Spot checks
  console.log('\nSpot checks:');
  const checks: Array<{ name: string; lon: number; lat: number; water: boolean }> = [
    { name: 'Mid-Pacific', lon: -160, lat: 0, water: true },
    { name: 'Mid-Atlantic', lon: -30, lat: 20, water: true },
    { name: 'Indian Ocean', lon: 70, lat: -10, water: true },
    { name: 'Mediterranean', lon: 18, lat: 38, water: true },
    { name: 'Sahara Desert', lon: 10, lat: 25, water: false },
    { name: 'Central China', lon: 105, lat: 35, water: false },
    { name: 'Amazon Basin', lon: -60, lat: -5, water: false },
    { name: 'Central Russia', lon: 60, lat: 55, water: false },
    { name: 'Gibraltar', lon: -5.6, lat: 35.9, water: true },
    { name: 'English Channel', lon: 0, lat: 50.5, water: true },
    { name: 'Bosphorus (forced)', lon: 29.05, lat: 41.1, water: true },
    { name: 'Suez Canal (forced)', lon: 32.35, lat: 30.5, water: true },
    { name: 'Panama Canal (forced)', lon: -79.7, lat: 9.1, water: true },
  ];

  let pass = 0, fail = 0;
  for (const c of checks) {
    const [ix, iy] = coordToCell(c.lon, c.lat);
    const actual = isWater(ix, iy);
    const ok = actual === c.water;
    if (ok) pass++; else fail++;
    console.log(`  ${ok ? 'OK' : 'FAIL'}: ${c.name} = ${actual ? 'WATER' : 'LAND'} (expected ${c.water ? 'WATER' : 'LAND'})`);
  }
  console.log(`\n${pass}/${pass + fail} checks passed`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
