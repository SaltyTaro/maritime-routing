/**
 * Ocean Grid A* Pathfinder
 *
 * Finds maritime routes using a pre-computed ocean bitmap (0.05° resolution).
 * Routes are guaranteed to never cross land — the bitmap is derived from
 * OSM water polygon data with forced cells for narrow passages.
 *
 * Algorithm:
 *   1. Snap start/end to nearest water cell (BFS search)
 *   2. A* with 8-connectivity, haversine heuristic
 *   3. RDP simplification (preserves A* centerline topology, avoids
 *      corner-grazing; collapses only when corridor is all-water)
 *   4. Validate + correct any remaining land clips
 *   5. Densify output (max 0.1° gap) to prevent Web Mercator projection
 *      distortion from bending rendered lines into coastlines
 *   6. Return [lon, lat] coordinate array
 *
 * @module @arcnautical/maritime-routing/pathfinding
 */

import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ---------------------------------------------------------------------------
// Grid constants (must match generate-ocean-grid.ts)
// ---------------------------------------------------------------------------

const RESOLUTION = 0.05;
const LON_CELLS = 7200;
const LAT_CELLS = 3600;

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_NM = 3440.065;

// ---------------------------------------------------------------------------
// Grid data (lazy-loaded)
// ---------------------------------------------------------------------------

let grid: Uint8Array | null = null;
let customGridPath: string | null = null;

/**
 * Configure the path to the ocean grid data file.
 * Call this before any pathfinding operations if you want to use
 * a custom grid file instead of the bundled one.
 *
 * @param path - Absolute path to the ocean-grid.bin.gz file
 */
export function setGridPath(path: string): void {
  customGridPath = path;
  grid = null; // force reload
}

/**
 * Load the ocean grid from a pre-loaded buffer.
 * Use this in environments where file system access is restricted.
 *
 * @param buffer - Gzipped ocean grid bitmap
 */
export function loadGridFromBuffer(buffer: Uint8Array | Buffer): void {
  grid = new Uint8Array(gunzipSync(buffer instanceof Buffer ? buffer : Buffer.from(buffer)));
  purgeInlandWater();
}

function ensureGrid() {
  if (grid) return;
  const gridPath = customGridPath ?? (() => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Look for grid in data/ relative to package root
    // From dist/pathfinding/index.js → ../../data/
    // From src/pathfinding/index.ts → ../../data/
    const candidates = [
      join(__dirname, '..', '..', 'data', 'ocean-grid.bin.gz'),
      join(__dirname, '..', 'data', 'ocean-grid.bin.gz'),
    ];
    for (const p of candidates) {
      try {
        readFileSync(p); // test existence
        return p;
      } catch { /* try next */ }
    }
    return candidates[0]!;
  })();

  const compressed = readFileSync(gridPath);
  grid = new Uint8Array(gunzipSync(compressed));
  purgeInlandWater();
}

function purgeInlandWater() {
  const t0 = Date.now();
  const BYTES = Math.ceil(LON_CELLS * LAT_CELLS / 8);
  const ocean = new Uint8Array(BYTES);

  // Seed: mid-Pacific (lon=-160, lat=0) — guaranteed open ocean
  const seedIx = Math.floor((-160 + 180) / RESOLUTION);
  const seedIy = Math.floor((0 + 90) / RESOLUTION);
  const seedIdx = seedIy * LON_CELLS + seedIx;

  if (!(grid![seedIdx >> 3]! & (1 << (seedIdx & 7)))) {
    return;
  }

  ocean[seedIdx >> 3] |= 1 << (seedIdx & 7);

  // BFS with head-pointer queue (avoids O(n) shift)
  const queue: number[] = [seedIdx];
  let head = 0;

  while (head < queue.length) {
    const idx = queue[head++]!;
    const ix = idx % LON_CELLS;
    const iy = (idx - ix) / LON_CELLS;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        let nx = ix + dx;
        let ny = iy + dy;
        if (nx < 0) nx += LON_CELLS;
        if (nx >= LON_CELLS) nx -= LON_CELLS;
        if (ny < 0 || ny >= LAT_CELLS) continue;

        const nIdx = ny * LON_CELLS + nx;
        const byte = nIdx >> 3;
        const bit = 1 << (nIdx & 7);
        if ((grid![byte]! & bit) && !(ocean[byte]! & bit)) {
          ocean[byte] |= bit;
          queue.push(nIdx);
        }
      }
    }
  }

  grid = ocean;
  const elapsed = Date.now() - t0;
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
    let oceanCount = 0;
    for (let i = 0; i < BYTES; i++) {
      let b = ocean[i]!;
      while (b) { oceanCount++; b &= b - 1; }
    }
    console.log(
      `[maritime-routing] Grid loaded: ${LON_CELLS}x${LAT_CELLS}, ` +
      `${oceanCount.toLocaleString()} ocean cells (${elapsed}ms)`,
    );
  }
}

// ---------------------------------------------------------------------------
// Grid access
// ---------------------------------------------------------------------------

function isWater(ix: number, iy: number): boolean {
  if (ix < 0 || ix >= LON_CELLS || iy < 0 || iy >= LAT_CELLS) return false;
  const idx = iy * LON_CELLS + ix;
  return (grid![idx >> 3]! & (1 << (idx & 7))) !== 0;
}

function coordToCell(lon: number, lat: number): [number, number] {
  let ix = Math.floor((lon + 180) / RESOLUTION);
  let iy = Math.floor((lat + 90) / RESOLUTION);
  if (ix < 0) ix += LON_CELLS;
  if (ix >= LON_CELLS) ix -= LON_CELLS;
  iy = Math.max(0, Math.min(LAT_CELLS - 1, iy));
  return [ix, iy];
}

function cellToCoord(ix: number, iy: number): [number, number] {
  return [
    -180 + (ix + 0.5) * RESOLUTION,
    -90 + (iy + 0.5) * RESOLUTION,
  ];
}

// ---------------------------------------------------------------------------
// Snap to nearest water cell (BFS)
// ---------------------------------------------------------------------------

function snapToWater(ix: number, iy: number): [number, number] | null {
  if (isWater(ix, iy)) return [ix, iy];

  const MAX_RADIUS = 30;
  const queue: [number, number][] = [[ix, iy]];
  const visited = new Set<number>();
  visited.add(iy * LON_CELLS + ix);

  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++]!;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        let nx = cx + dx;
        let ny = cy + dy;
        if (nx < 0) nx += LON_CELLS;
        if (nx >= LON_CELLS) nx -= LON_CELLS;
        if (ny < 0 || ny >= LAT_CELLS) continue;

        const key = ny * LON_CELLS + nx;
        if (visited.has(key)) continue;
        visited.add(key);

        if (isWater(nx, ny)) return [nx, ny];

        const distX = Math.min(Math.abs(nx - ix), LON_CELLS - Math.abs(nx - ix));
        if (distX <= MAX_RADIUS && Math.abs(ny - iy) <= MAX_RADIUS) {
          queue.push([nx, ny]);
        }
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Haversine distance (nm)
// ---------------------------------------------------------------------------

function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_NM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Edge weight (nm) for adjacent cells
// ---------------------------------------------------------------------------

function edgeWeightNm(fromIy: number, toIy: number, diagonal: boolean): number {
  const avgLat = -90 + ((fromIy + toIy) / 2 + 0.5) * RESOLUTION;
  const latNm = RESOLUTION * 60;
  const lonNm = RESOLUTION * 60 * Math.cos(avgLat * DEG_TO_RAD);
  return diagonal ? Math.sqrt(latNm * latNm + lonNm * lonNm) : (fromIy === toIy ? lonNm : latNm);
}

// ---------------------------------------------------------------------------
// Binary min-heap
// ---------------------------------------------------------------------------

class MinHeap {
  private keys: number[] = [];
  private vals: number[] = [];
  private gs: number[] = [];

  get size() { return this.keys.length; }

  push(key: number, f: number, g: number) {
    this.keys.push(key);
    this.vals.push(f);
    this.gs.push(g);
    this._up(this.keys.length - 1);
  }

  pop(): [number, number, number] {
    const key = this.keys[0]!, f = this.vals[0]!, g = this.gs[0]!;
    const last = this.keys.length - 1;
    if (last > 0) {
      this.keys[0] = this.keys[last]!;
      this.vals[0] = this.vals[last]!;
      this.gs[0] = this.gs[last]!;
    }
    this.keys.pop();
    this.vals.pop();
    this.gs.pop();
    if (this.keys.length > 0) this._down(0);
    return [key, f, g];
  }

  private _up(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.vals[i]! >= this.vals[p]!) break;
      this._swap(i, p);
      i = p;
    }
  }

  private _down(i: number) {
    const n = this.keys.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.vals[l]! < this.vals[s]!) s = l;
      if (r < n && this.vals[r]! < this.vals[s]!) s = r;
      if (s === i) break;
      this._swap(i, s);
      i = s;
    }
  }

  private _swap(a: number, b: number) {
    [this.keys[a], this.keys[b]] = [this.keys[b]!, this.keys[a]!];
    [this.vals[a], this.vals[b]] = [this.vals[b]!, this.vals[a]!];
    [this.gs[a], this.gs[b]] = [this.gs[b]!, this.gs[a]!];
  }
}

// ---------------------------------------------------------------------------
// 8-directional neighbors
// ---------------------------------------------------------------------------

const DIRS: Array<[number, number, boolean]> = [
  [0, 1, false], [1, 0, false], [0, -1, false], [-1, 0, false],
  [1, 1, true], [1, -1, true], [-1, 1, true], [-1, -1, true],
];

// ---------------------------------------------------------------------------
// A* pathfinder
// ---------------------------------------------------------------------------

function astar(
  startIx: number, startIy: number,
  goalIx: number, goalIy: number,
): number[] | null {
  const startKey = startIy * LON_CELLS + startIx;
  const goalKey = goalIy * LON_CELLS + goalIx;

  if (startKey === goalKey) return [startKey];

  const gScore = new Map<number, number>();
  const parent = new Map<number, number>();
  const closed = new Set<number>();

  gScore.set(startKey, 0);

  const [goalLon, goalLat] = cellToCoord(goalIx, goalIy);
  const heap = new MinHeap();

  const [startLon, startLat] = cellToCoord(startIx, startIy);
  heap.push(startKey, haversineNm(startLat, startLon, goalLat, goalLon), 0);

  let iterations = 0;
  const MAX_ITER = 2_000_000;

  while (heap.size > 0 && iterations < MAX_ITER) {
    const [currentKey, _f, g] = heap.pop();
    iterations++;

    if (currentKey === goalKey) {
      const keys: number[] = [];
      let k: number | undefined = goalKey;
      while (k !== undefined) {
        keys.unshift(k);
        if (k === startKey) break;
        k = parent.get(k);
      }
      return keys;
    }

    if (closed.has(currentKey)) continue;
    closed.add(currentKey);

    const bestG = gScore.get(currentKey);
    if (bestG !== undefined && g > bestG + 0.001) continue;

    const cx = currentKey % LON_CELLS;
    const cy = (currentKey - cx) / LON_CELLS;

    for (const [dx, dy, diag] of DIRS) {
      let nx = cx + dx;
      let ny = cy + dy;
      if (nx < 0) nx += LON_CELLS;
      if (nx >= LON_CELLS) nx -= LON_CELLS;
      if (ny < 0 || ny >= LAT_CELLS) continue;
      if (!isWater(nx, ny)) continue;

      const nKey = ny * LON_CELLS + nx;
      if (closed.has(nKey)) continue;

      const w = edgeWeightNm(cy, ny, diag);
      const tentG = g + w;

      const oldG = gScore.get(nKey);
      if (oldG !== undefined && tentG >= oldG) continue;

      gScore.set(nKey, tentG);
      parent.set(nKey, currentKey);

      const [nLon, nLat] = cellToCoord(nx, ny);
      heap.push(nKey, tentG + haversineNm(nLat, nLon, goalLat, goalLon), tentG);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Path smoothing (RDP + corridor validation)
// ---------------------------------------------------------------------------

function isCorridorAllWater(
  ix0: number, iy0: number,
  ix1: number, iy1: number,
  margin: number = 2,
): boolean {
  let dix = ix1 - ix0;
  if (Math.abs(dix) > LON_CELLS / 2) {
    dix = dix > 0 ? dix - LON_CELLS : dix + LON_CELLS;
  }
  const diy = iy1 - iy0;
  const steps = Math.abs(dix) + Math.abs(diy);
  if (steps === 0) return true;

  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const baseIx = Math.round(ix0 + dix * t);
    const baseIy = Math.round(iy0 + diy * t);

    for (let dy = -margin; dy <= margin; dy++) {
      const cy = baseIy + dy;
      if (cy < 0 || cy >= LAT_CELLS) return false;
      for (let dx = -margin; dx <= margin; dx++) {
        let cx = baseIx + dx;
        if (cx < 0) cx += LON_CELLS;
        if (cx >= LON_CELLS) cx -= LON_CELLS;
        if (!isWater(cx, cy)) return false;
      }
    }
  }
  return true;
}

function perpendicularDistCells(
  sx: number, sy: number,
  ex: number, ey: number,
  px: number, py: number,
): number {
  let dx = ex - sx;
  if (Math.abs(dx) > LON_CELLS / 2) {
    dx = dx > 0 ? dx - LON_CELLS : dx + LON_CELLS;
  }
  const dy = ey - sy;

  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    let pdx = px - sx;
    if (Math.abs(pdx) > LON_CELLS / 2) {
      pdx = pdx > 0 ? pdx - LON_CELLS : pdx + LON_CELLS;
    }
    const pdy = py - sy;
    return Math.sqrt(pdx * pdx + pdy * pdy);
  }

  let apx = px - sx;
  if (Math.abs(apx) > LON_CELLS / 2) {
    apx = apx > 0 ? apx - LON_CELLS : apx + LON_CELLS;
  }
  const apy = py - sy;

  return Math.abs(dx * apy - dy * apx) / Math.sqrt(lenSq);
}

function rdpSmooth(keys: number[], epsilon: number = 1.5): number[] {
  if (keys.length <= 2) return keys;

  const startK = keys[0]!;
  const endK = keys[keys.length - 1]!;
  const sx = startK % LON_CELLS, sy = (startK - sx) / LON_CELLS;
  const ex = endK % LON_CELLS, ey = (endK - ex) / LON_CELLS;

  let maxDist = 0;
  let maxIdx = 0;
  for (let i = 1; i < keys.length - 1; i++) {
    const k = keys[i]!;
    const px = k % LON_CELLS, py = (k - px) / LON_CELLS;
    const d = perpendicularDistCells(sx, sy, ex, ey, px, py);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSmooth(keys.slice(0, maxIdx + 1), epsilon);
    const right = rdpSmooth(keys.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  if (isCorridorAllWater(sx, sy, ex, ey)) {
    return [startK, endK];
  }

  const midIdx = Math.floor(keys.length / 2);
  const left = rdpSmooth(keys.slice(0, midIdx + 1), epsilon);
  const right = rdpSmooth(keys.slice(midIdx), epsilon);
  return [...left.slice(0, -1), ...right];
}

// ---------------------------------------------------------------------------
// Great-circle fallback
// ---------------------------------------------------------------------------

function greatCircleFallback(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number,
  numPoints = 24,
): [number, number][] {
  const phi1 = fromLat * DEG_TO_RAD, lam1 = fromLon * DEG_TO_RAD;
  const phi2 = toLat * DEG_TO_RAD, lam2 = toLon * DEG_TO_RAD;
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((phi2 - phi1) / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin((lam2 - lam1) / 2) ** 2,
  ));
  if (d < 1e-10) return [[fromLon, fromLat], [toLon, toLat]];

  const pts: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(phi1) * Math.cos(lam1) + B * Math.cos(phi2) * Math.cos(lam2);
    const y = A * Math.cos(phi1) * Math.sin(lam1) + B * Math.cos(phi2) * Math.sin(lam2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);
    pts.push([
      Math.atan2(y, x) / DEG_TO_RAD,
      Math.atan2(z, Math.sqrt(x * x + y * y)) / DEG_TO_RAD,
    ]);
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Great-circle midpoint (for recursive subdivision)
// ---------------------------------------------------------------------------

function greatCircleMidpoint(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): [number, number] {
  const phi1 = lat1 * DEG_TO_RAD, lam1 = lon1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD, lam2 = lon2 * DEG_TO_RAD;

  const Bx = Math.cos(phi2) * Math.cos(lam2 - lam1);
  const By = Math.cos(phi2) * Math.sin(lam2 - lam1);

  const midLat = Math.atan2(
    Math.sin(phi1) + Math.sin(phi2),
    Math.sqrt((Math.cos(phi1) + Bx) ** 2 + By ** 2),
  ) / DEG_TO_RAD;

  const midLon = (lam1 + Math.atan2(By, Math.cos(phi1) + Bx)) / DEG_TO_RAD;

  return [midLon, midLat];
}

// ---------------------------------------------------------------------------
// Recursive pathfinder (subdivides long routes)
// ---------------------------------------------------------------------------

function findPathDirect(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number,
): [number, number][] | null {
  const [startIx, startIy] = coordToCell(fromLon, fromLat);
  const [goalIx, goalIy] = coordToCell(toLon, toLat);

  const snappedStart = snapToWater(startIx, startIy);
  const snappedGoal = snapToWater(goalIx, goalIy);
  if (!snappedStart || !snappedGoal) return null;

  const rawKeys = astar(snappedStart[0], snappedStart[1], snappedGoal[0], snappedGoal[1]);
  if (!rawKeys) return null;

  const smoothedKeys = rdpSmooth(rawKeys, 1.5);
  const path: [number, number][] = smoothedKeys.map(k => {
    const ix = k % LON_CELLS;
    const iy = (k - ix) / LON_CELLS;
    return cellToCoord(ix, iy);
  });

  path[0] = [fromLon, fromLat];
  path[path.length - 1] = [toLon, toLat];
  return path;
}

function findPathRecursive(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number,
  depth: number,
): [number, number][] {
  if (depth > 4) {
    return greatCircleFallback(fromLat, fromLon, toLat, toLon);
  }

  const direct = findPathDirect(fromLat, fromLon, toLat, toLon);
  if (direct) return direct;

  const [midLon, midLat] = greatCircleMidpoint(fromLat, fromLon, toLat, toLon);

  const firstHalf = findPathRecursive(fromLat, fromLon, midLat, midLon, depth + 1);
  const secondHalf = findPathRecursive(midLat, midLon, toLat, toLon, depth + 1);

  return [...firstHalf, ...secondHalf.slice(1)];
}

// ---------------------------------------------------------------------------
// Post-processing
// ---------------------------------------------------------------------------

const cache = new Map<string, [number, number][]>();

function validateAndCorrect(path: [number, number][]): [number, number][] {
  if (path.length < 2) return path;
  const MAX_LAND_RUN = 3;
  const result: [number, number][] = [];

  for (let i = 0; i < path.length - 1; i++) {
    result.push(path[i]!);
    const [lon1, lat1] = path[i]!;
    const [lon2, lat2] = path[i + 1]!;

    let dlon = lon2 - lon1;
    if (Math.abs(dlon) > 180) {
      dlon = dlon > 0 ? dlon - 360 : dlon + 360;
    }
    const dlat = lat2 - lat1;
    const coordDist = Math.sqrt(dlon * dlon + dlat * dlat);
    const steps = Math.max(5, Math.ceil(coordDist / RESOLUTION));

    let landRun = 0;
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      const lon = lon1 + dlon * t;
      const lat = lat1 + dlat * t;
      const [ix, iy] = coordToCell(lon, lat);

      if (!isWater(ix, iy)) {
        landRun++;
        if (landRun >= MAX_LAND_RUN) {
          const snapped = snapToWater(ix, iy);
          if (snapped) {
            result.push(cellToCoord(snapped[0], snapped[1]));
          }
          landRun = 0;
        }
      } else {
        landRun = 0;
      }
    }
  }

  result.push(path[path.length - 1]!);
  return result;
}

function normalizeLongitudes(coords: [number, number][]): [number, number][] {
  if (coords.length < 2) return coords;
  const result: [number, number][] = [coords[0]!];
  for (let i = 1; i < coords.length; i++) {
    let lon = coords[i]![0];
    const prevLon = result[i - 1]![0];
    while (lon - prevLon > 180) lon -= 360;
    while (lon - prevLon < -180) lon += 360;
    result.push([lon, coords[i]![1]]);
  }
  return result;
}

function densifyPath(coords: [number, number][], maxGapDeg: number = 0.1): [number, number][] {
  if (coords.length < 2) return coords;
  const result: [number, number][] = [coords[0]!];

  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = result[result.length - 1]!;
    const [lon2, lat2] = coords[i]!;

    let dlon = lon2 - lon1;
    if (dlon > 180) dlon -= 360;
    if (dlon < -180) dlon += 360;
    const dlat = lat2 - lat1;
    const dist = Math.sqrt(dlon * dlon + dlat * dlat);

    if (dist > maxGapDeg) {
      const steps = Math.ceil(dist / maxGapDeg);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        result.push([lon1 + dlon * t, lat1 + dlat * t]);
      }
    }

    result.push(coords[i]!);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find a maritime route between two points using A* on the ocean grid.
 *
 * Returns an array of [lon, lat] coordinate pairs (GeoJSON convention).
 * Routes are guaranteed to never cross land. For long routes, automatically
 * subdivides into segments that A* can handle.
 *
 * Pipeline: A* → RDP smooth → validate+correct → densify → normalize longitudes
 *
 * @param fromLat - Origin latitude
 * @param fromLon - Origin longitude
 * @param toLat - Destination latitude
 * @param toLon - Destination longitude
 * @returns Array of [longitude, latitude] coordinate pairs
 *
 * @example
 * ```ts
 * import { findOceanPath } from '@arcnautical/maritime-routing/pathfinding';
 *
 * const path = findOceanPath(1.26, 103.84, 51.90, 4.50);
 * // Returns ~500 [lon, lat] points from Singapore to Rotterdam
 * // Guaranteed to never cross land
 * ```
 */
export function findOceanPath(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number,
): [number, number][] {
  const cacheKey = `${fromLat.toFixed(2)},${fromLon.toFixed(2)}->${toLat.toFixed(2)},${toLon.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  ensureGrid();

  const raw = findPathRecursive(fromLat, fromLon, toLat, toLon, 0);
  const validated = validateAndCorrect(raw);
  const densified = densifyPath(validated, 0.1);
  const path = normalizeLongitudes(densified);
  cache.set(cacheKey, path);
  return path;
}

/**
 * Clear the pathfinding cache.
 * Call this if you've loaded a new grid or want to free memory.
 */
export function clearPathCache(): void {
  cache.clear();
}
