/**
 * @arcnautical/maritime-routing
 *
 * Production-grade maritime routing engine for JavaScript/TypeScript.
 * Zero dependencies. MIT licensed.
 *
 * Features:
 *   - A* ocean pathfinding on a 0.05° bitmap (guaranteed land avoidance)
 *   - Dijkstra waypoint routing through 48 strategic chokepoints
 *   - 510+ port database with UN/LOCODE lookup
 *   - Beaufort-based weather speed model (Kwon 2008)
 *   - EEZ transit analysis
 *   - GeoJSON output
 *
 * Built by ArcNautical — maritime risk intelligence platform.
 * https://arcnautical.com
 *
 * @module @arcnautical/maritime-routing
 */

// ---------------------------------------------------------------------------
// Pathfinding — A* on ocean grid
// ---------------------------------------------------------------------------

export {
  findOceanPath,
  clearPathCache,
  setGridPath,
  loadGridFromBuffer,
} from './pathfinding/index.js';

// ---------------------------------------------------------------------------
// Routing — Dijkstra waypoint graph + route computation
// ---------------------------------------------------------------------------

export {
  computeRoute,
  computeRouteInternal,
  haversineDistance,
  bearing,
  interpolateGreatCircle,
  getTransitCountries,
  getTransitCountriesFromCoords,
} from './routing/index.js';

export type {
  WaypointNode,
  RouteSegment,
  ComputedRoute,
} from './routing/index.js';

// ---------------------------------------------------------------------------
// Ports — 510+ port database with UN/LOCODE
// ---------------------------------------------------------------------------

export {
  searchPorts,
  getPortByLocode,
  getPortsByRegion,
  resolveAisDestination,
  findNearestPort,
  PORTS,
} from './ports/index.js';

export type {
  Port,
  PortType,
  OceanRegion,
} from './ports/index.js';

// ---------------------------------------------------------------------------
// Weather — Beaufort speed model + ETA computation
// ---------------------------------------------------------------------------

export {
  computeSeaStateFactor,
  computeRouteEta,
  windToBeaufort,
  waveToBeaufort,
} from './weather/index.js';

export type {
  VesselType,
  LoadCondition,
  SpeedModelInput,
  SpeedModelOutput,
  SegmentEta,
  RouteEtaResult,
  SegmentWeatherSummary,
} from './weather/index.js';

// ---------------------------------------------------------------------------
// Geography — EEZ transit analysis
// ---------------------------------------------------------------------------

export {
  analyzeRouteEezTransit,
  getEezTransitCountries,
} from './geography/index.js';

export type {
  EezZone,
  EezTransitEntry,
  EezTransitResult,
} from './geography/index.js';

// ---------------------------------------------------------------------------
// Geo utilities — zero-dependency spatial functions
// ---------------------------------------------------------------------------

export {
  haversineDistanceNm,
  pointInPolygon,
  pointToSegmentDistanceNm,
  pointToRouteDistanceNm,
  filterEventsInCorridor,
  segmentIntersectsPolygon,
  routeFractionInPolygon,
  recencyDecay,
  proximityDecay,
} from './geo/index.js';

export type {
  RouteSegment as GeoRouteSegment,
  GeoEvent,
} from './geo/index.js';
