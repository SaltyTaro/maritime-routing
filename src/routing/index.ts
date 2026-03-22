/**
 * @module @arcnautical/maritime-routing/routing
 *
 * ArcNautical Maritime Route Engine
 *
 * Waypoint-based route computation between any two ports in the ArcNautical
 * port database. Uses a graph of strategic waypoint nodes (straits, canals,
 * capes) connected by weighted edges (haversine distance) to determine the
 * optimal sequence of chokepoints a vessel must transit.
 *
 * Algorithm:
 *   1. Resolve origin/destination ports from port database
 *   2. Build virtual graph nodes for origin and destination, connected to
 *      all waypoints in their ocean region
 *   3. Dijkstra through the waypoint graph for minimum-distance path
 *   4. Construct waypoint chain: [origin] -> [wp1] -> [wp2] -> ... -> [dest]
 *   5. Interpolate great-circle arcs between each pair
 *   6. Return as GeoJSON LineString with route metadata
 */

import { getPortByLocode, type Port, type OceanRegion } from '../ports/index.js';
import { segmentIntersectsPolygon, type RouteSegment as SpatialRouteSegment } from '../geo/index.js';
import { findOceanPath as findMaritimeRoute } from '../pathfinding/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WaypointNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: OceanRegion;
}

export interface RouteSegment {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  distanceNm: number;
  bearing: number;
}

export interface ComputedRoute {
  origin: Port;
  destination: Port;
  waypoints: WaypointNode[];
  segments: RouteSegment[];
  totalDistanceNm: number;
  geojson: GeoJSON.Feature<GeoJSON.LineString>;
}

// Handler-compatible response shape
interface ComputeRouteResponse {
  origin_locode: string;
  dest_locode: string;
  distance_nm: number;
  duration_hours: number;
  waypoints: Array<{ lat: number; lng: number; name?: string }>;
  route_geojson: GeoJSON.FeatureCollection | null;
  hazard_zones_crossed: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EARTH_RADIUS_NM = 3440.065; // nautical miles
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const DEFAULT_SPEED_KNOTS = 14; // average container vessel speed
const POINTS_PER_SEGMENT = 24;  // interpolation points for smooth arcs

// ---------------------------------------------------------------------------
// Geodesic Helpers
// ---------------------------------------------------------------------------

/**
 * Haversine distance between two points in nautical miles.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_NM * c;
}

/**
 * Initial bearing from point 1 to point 2 in degrees (0-360).
 */
export function bearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const phi1 = lat1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD;
  const dLambda = (lon2 - lon1) * DEG_TO_RAD;

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

  const theta = Math.atan2(y, x);
  return ((theta * RAD_TO_DEG) + 360) % 360;
}

/**
 * Interpolate points along a great circle arc.
 */
export function interpolateGreatCircle(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  numPoints: number,
): [number, number][] {
  if (numPoints < 2) return [[lat1, lon1], [lat2, lon2]];

  const phi1 = lat1 * DEG_TO_RAD;
  const lambda1 = lon1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD;
  const lambda2 = lon2 * DEG_TO_RAD;

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.sin((phi2 - phi1) / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin((lambda2 - lambda1) / 2) ** 2,
    ),
  );

  if (d < 1e-10) {
    return [[lat1, lon1], [lat2, lon2]];
  }

  const points: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2);
    const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * RAD_TO_DEG;
    const lon = Math.atan2(y, x) * RAD_TO_DEG;

    points.push([lat, lon]);
  }

  return points;
}

// ---------------------------------------------------------------------------
// Waypoint Graph (node-level, distance-weighted)
// ---------------------------------------------------------------------------

/**
 * Strategic waypoint nodes representing major straits, canals, and capes.
 * Each node is associated with the region(s) it connects.
 */
const WAYPOINT_NODES: WaypointNode[] = [
  { id: 'taiwan_strait',      name: 'Taiwan Strait',          lat: 24.0,   lon: 119.5,  region: 'south_china_sea' },
  { id: 'malacca_strait',     name: 'Malacca Strait',         lat: 2.5,    lon: 101.0,  region: 'southeast_asia' },
  { id: 'singapore_strait',   name: 'Singapore Strait',       lat: 1.2,    lon: 103.8,  region: 'southeast_asia' },
  { id: 'lombok_strait',      name: 'Lombok Strait',          lat: -8.5,   lon: 115.7,  region: 'indian_ocean' },
  { id: 'bab_el_mandeb',      name: 'Bab el-Mandeb',          lat: 12.6,   lon: 43.3,   region: 'red_sea' },
  { id: 'red_sea_mid',        name: 'Red Sea',                lat: 20.0,   lon: 38.0,   region: 'red_sea' },
  { id: 'suez_canal',         name: 'Suez Canal',             lat: 30.5,   lon: 32.3,   region: 'red_sea' },
  { id: 'gulf_of_aden',       name: 'Gulf of Aden',           lat: 12.0,   lon: 50.0,   region: 'indian_ocean' },
  { id: 'arabian_sea',        name: 'Arabian Sea',            lat: 13.0,   lon: 65.0,   region: 'indian_ocean' },
  { id: 'gulf_of_oman',       name: 'Gulf of Oman',           lat: 22.5,   lon: 59.5,   region: 'persian_gulf' },
  { id: 'gibraltar',          name: 'Strait of Gibraltar',    lat: 35.9,   lon: -5.6,   region: 'mediterranean' },
  { id: 'english_channel',    name: 'English Channel',        lat: 50.5,   lon: 0.0,    region: 'atlantic_north' },
  { id: 'panama_canal_pac',   name: 'Panama Canal (Pacific)', lat: 8.95,   lon: -79.56, region: 'pacific' },
  { id: 'panama_canal_atl',   name: 'Panama Canal (Atlantic)', lat: 9.35,  lon: -79.90, region: 'caribbean' },
  { id: 'hormuz_strait',      name: 'Strait of Hormuz',       lat: 26.5,   lon: 56.5,   region: 'persian_gulf' },
  { id: 'bosphorus',          name: 'Bosphorus Strait',       lat: 41.1,   lon: 29.0,   region: 'black_sea' },
  { id: 'cape_good_hope',     name: 'Cape of Good Hope',      lat: -34.4,  lon: 18.5,   region: 'atlantic_south' },
  { id: 'danish_straits',     name: 'Danish Straits',         lat: 55.9,   lon: 12.7,   region: 'baltic' },
  { id: 'cape_horn',          name: 'Cape Horn',              lat: -55.9,  lon: -67.3,  region: 'atlantic_south' },
  { id: 'mozambique_channel', name: 'Mozambique Channel',     lat: -15.0,  lon: 41.0,   region: 'indian_ocean' },
  { id: 'dakar',              name: 'Dakar Offshore',           lat: 14.7,   lon: -17.4,  region: 'atlantic_south' },
  { id: 'gulf_guinea_w',      name: 'Gulf of Guinea West',      lat: 4.0,    lon: -4.0,   region: 'atlantic_south' },
  { id: 'gulf_guinea_e',      name: 'Gulf of Guinea East',      lat: 4.0,    lon: 3.5,    region: 'atlantic_south' },
  { id: 'luanda_offshore',    name: 'Angola Offshore',          lat: -8.8,   lon: 12.0,   region: 'atlantic_south' },
  { id: 'luzon_strait',       name: 'Luzon Strait',             lat: 20.0,   lon: 121.5,  region: 'south_china_sea' },
  { id: 'scs_central',        name: 'South China Sea Central',  lat: 12.0,   lon: 112.0,  region: 'south_china_sea' },
  { id: 'sulu_sea',           name: 'Sulu Sea',                 lat: 8.0,    lon: 120.0,  region: 'southeast_asia' },
  { id: 'andaman_sea',        name: 'Andaman Sea',               lat: 7.0,    lon: 93.0,   region: 'indian_ocean' },
  { id: 'sri_lanka',          name: 'Sri Lanka South',          lat: 5.5,    lon: 80.0,   region: 'indian_ocean' },
  { id: 'mombasa_offshore',   name: 'East Africa',              lat: -4.0,   lon: 42.0,   region: 'indian_ocean' },
  { id: 'korea_strait',       name: 'Korea Strait',             lat: 34.0,   lon: 129.0,  region: 'pacific' },
  { id: 'tsugaru_strait',     name: 'Tsugaru Strait',           lat: 41.5,   lon: 140.5,  region: 'pacific' },
  { id: 'yucatan_channel',    name: 'Yucatan Channel',          lat: 21.5,   lon: -86.5,  region: 'caribbean' },
  { id: 'windward_passage',   name: 'Windward Passage',         lat: 19.8,   lon: -73.5,  region: 'caribbean' },
  { id: 'florida_strait',     name: 'Florida Strait',           lat: 25.0,   lon: -80.0,  region: 'atlantic_north' },
  { id: 'east_med',           name: 'Eastern Mediterranean',    lat: 34.0,   lon: 30.0,   region: 'mediterranean' },

  // Oceania waypoints
  { id: 'torres_strait',      name: 'Torres Strait',            lat: -10.0,  lon: 142.5,  region: 'oceania' },
  { id: 'coral_sea',          name: 'Coral Sea',                lat: -15.0,  lon: 155.0,  region: 'oceania' },
  { id: 'bass_strait',        name: 'Bass Strait',              lat: -40.0,  lon: 145.0,  region: 'oceania' },
  { id: 'south_pacific',      name: 'South Pacific',            lat: -25.0,  lon: -175.0, region: 'oceania' },
  { id: 'south_australia',    name: 'Great Australian Bight',   lat: -37.0,  lon: 130.0,  region: 'oceania' },

  // East Pacific waypoints
  { id: 'us_west_coast',      name: 'US West Coast',            lat: 34.0,   lon: -121.0, region: 'east_pacific' },
  { id: 'east_pacific_mid',   name: 'Eastern Pacific',          lat: 10.0,   lon: -95.0,  region: 'east_pacific' },
  { id: 'south_america_pac',  name: 'South America Pacific',    lat: -5.0,   lon: -85.0,  region: 'east_pacific' },
  { id: 'north_pacific',      name: 'North Pacific',            lat: 40.0,   lon: -170.0, region: 'east_pacific' },

  // Arctic waypoints
  { id: 'norwegian_sea',      name: 'Norwegian Sea',            lat: 65.0,   lon: 5.0,    region: 'arctic' },
  { id: 'barents_sea',        name: 'Barents Sea',              lat: 71.0,   lon: 30.0,   region: 'arctic' },
];

const waypointMap = new Map<string, WaypointNode>();
for (const wp of WAYPOINT_NODES) {
  waypointMap.set(wp.id, wp);
}

/**
 * Which waypoints serve each region.
 * A port in region X can reach any waypoint listed for region X directly.
 */
const REGION_WAYPOINTS: Record<OceanRegion, string[]> = {
  pacific:          ['taiwan_strait', 'korea_strait', 'tsugaru_strait', 'north_pacific'],
  south_china_sea:  ['taiwan_strait', 'singapore_strait', 'luzon_strait', 'scs_central'],
  southeast_asia:   ['singapore_strait', 'malacca_strait', 'lombok_strait', 'sulu_sea'],
  indian_ocean:     ['malacca_strait', 'lombok_strait', 'cape_good_hope', 'mozambique_channel', 'gulf_of_aden', 'arabian_sea', 'andaman_sea', 'sri_lanka', 'mombasa_offshore'],
  persian_gulf:     ['hormuz_strait', 'gulf_of_oman'],
  red_sea:          ['bab_el_mandeb', 'red_sea_mid', 'suez_canal'],
  mediterranean:    ['suez_canal', 'gibraltar', 'bosphorus', 'east_med'],
  atlantic_north:   ['gibraltar', 'english_channel', 'danish_straits', 'cape_good_hope', 'panama_canal_atl', 'florida_strait'],
  atlantic_south:   ['cape_good_hope', 'cape_horn', 'panama_canal_atl', 'dakar', 'gulf_guinea_w', 'gulf_guinea_e', 'luanda_offshore'],
  caribbean:        ['panama_canal_atl', 'yucatan_channel', 'windward_passage', 'florida_strait'],
  north_sea:        ['english_channel', 'danish_straits'],
  baltic:           ['danish_straits'],
  black_sea:        ['bosphorus'],
  arctic:           ['norwegian_sea', 'barents_sea'],
  oceania:          ['coral_sea', 'bass_strait', 'torres_strait', 'south_pacific', 'south_australia'],
  east_pacific:     ['us_west_coast', 'east_pacific_mid', 'south_america_pac', 'panama_canal_pac', 'cape_horn', 'north_pacific'],
};

/**
 * Direct waypoint-to-waypoint connections.
 * Each edge is [nodeA, nodeB]. Distance computed from coordinates.
 * These represent navigable passages between chokepoints.
 */
const WAYPOINT_EDGES: [string, string][] = [
  // East Asia -> Southeast Asia corridor
  ['taiwan_strait', 'singapore_strait'],       // SCS transit
  ['singapore_strait', 'malacca_strait'],       // Short hop through SG strait
  ['singapore_strait', 'lombok_strait'],        // Alternative to Malacca

  // Southeast Asia -> Indian Ocean (routed via Andaman Sea to avoid crossing Sumatra/India)
  ['malacca_strait', 'andaman_sea'],            // Exit Malacca into open Andaman Sea
  ['andaman_sea', 'sri_lanka'],                 // Andaman Sea → south of Sri Lanka (open water)
  ['malacca_strait', 'cape_good_hope'],         // Around Africa (alternative, stays in open ocean)
  ['lombok_strait', 'cape_good_hope'],          // Via Lombok around Africa

  // Red Sea corridor — routed via mid-Red Sea to stay in the water
  ['suez_canal', 'red_sea_mid'],                // Northern Red Sea
  ['red_sea_mid', 'bab_el_mandeb'],             // Southern Red Sea to strait

  // Gulf of Aden / Arabian Sea / Hormuz corridor — avoids Arabian Peninsula overland
  ['bab_el_mandeb', 'gulf_of_aden'],            // East into Gulf of Aden (water)
  ['gulf_of_aden', 'arabian_sea'],              // Arabian Sea crossing (open ocean)
  ['arabian_sea', 'gulf_of_oman'],              // Northeast to Gulf of Oman
  ['gulf_of_oman', 'hormuz_strait'],            // Into Strait of Hormuz

  // Mediterranean corridor
  ['suez_canal', 'gibraltar'],                  // Med transit
  ['suez_canal', 'bosphorus'],                  // Eastern Med to Black Sea

  // Atlantic access
  ['gibraltar', 'english_channel'],             // Western European coast
  ['gibraltar', 'cape_good_hope'],              // Down African coast
  ['gibraltar', 'danish_straits'],              // North Sea to Baltic

  // North Atlantic
  ['english_channel', 'danish_straits'],         // North Sea
  ['english_channel', 'cape_good_hope'],         // Down Atlantic

  // Panama Canal (the two ends connect to each other)
  ['panama_canal_pac', 'panama_canal_atl'],      // Canal transit (short, ~50nm)

  // Caribbean / Atlantic connections
  ['panama_canal_atl', 'english_channel'],       // Transatlantic from Caribbean
  ['panama_canal_atl', 'gibraltar'],             // Caribbean to Med
  ['panama_canal_atl', 'cape_good_hope'],        // Caribbean to South Atlantic

  // Cape routes
  ['cape_good_hope', 'gulf_of_aden'],            // Around Africa → East African coast → Gulf of Aden
  ['cape_good_hope', 'mozambique_channel'],      // East African coast
  ['cape_good_hope', 'cape_horn'],               // Southern ocean crossing
  ['cape_good_hope', 'english_channel'],         // Up the Atlantic

  // Mozambique Channel connections
  ['mozambique_channel', 'gulf_of_aden'],        // Up east African coast to Gulf of Aden
  ['mozambique_channel', 'arabian_sea'],         // Indian Ocean diagonal to Arabian Sea

  // Cape Horn connections
  ['cape_horn', 'panama_canal_pac'],             // Up South American Pacific coast

  // Bosphorus
  ['bosphorus', 'gibraltar'],                    // Mediterranean transit (alternate)

  // West African coast (fixes Africa land-crossing)
  ['cape_good_hope', 'luanda_offshore'],
  ['luanda_offshore', 'gulf_guinea_e'],
  ['gulf_guinea_e', 'gulf_guinea_w'],
  ['gulf_guinea_w', 'dakar'],
  ['dakar', 'gibraltar'],

  // South China Sea mesh (fixes Borneo/Philippines)
  ['taiwan_strait', 'luzon_strait'],
  ['luzon_strait', 'scs_central'],
  ['scs_central', 'singapore_strait'],
  ['scs_central', 'sulu_sea'],
  ['sulu_sea', 'singapore_strait'],
  ['sulu_sea', 'lombok_strait'],

  // Indian Ocean intermediate — Sri Lanka to Arabian Sea / Gulf of Aden
  ['sri_lanka', 'arabian_sea'],
  ['sri_lanka', 'gulf_of_aden'],

  // East Africa (fixes Madagascar crossing)
  ['mozambique_channel', 'mombasa_offshore'],
  ['mombasa_offshore', 'gulf_of_aden'],

  // Northeast Asia
  ['taiwan_strait', 'korea_strait'],
  ['korea_strait', 'tsugaru_strait'],

  // Caribbean mesh
  ['panama_canal_atl', 'yucatan_channel'],
  ['panama_canal_atl', 'windward_passage'],
  ['windward_passage', 'florida_strait'],
  ['florida_strait', 'english_channel'],

  // Eastern Mediterranean
  ['suez_canal', 'east_med'],
  ['east_med', 'gibraltar'],
  ['east_med', 'bosphorus'],

  // Oceania internal
  ['coral_sea', 'torres_strait'],          // NE Australia coast (~900nm, open water)
  ['coral_sea', 'bass_strait'],            // Down east AU coast (~1700nm, open water)
  ['coral_sea', 'south_pacific'],          // Open Pacific east (~2000nm)
  ['bass_strait', 'south_pacific'],        // South Pacific route (~2000nm, open ocean)
  ['bass_strait', 'south_australia'],      // Through Bass Strait (~600nm)
  ['bass_strait', 'cape_good_hope'],       // Southern Ocean (~5000nm, open ocean)

  // Oceania ↔ SE Asia / Indian Ocean
  ['torres_strait', 'lombok_strait'],      // Through Arafura/Banda Sea (~1500nm)
  ['torres_strait', 'sulu_sea'],           // Through Celebes Sea (~1400nm)
  ['south_australia', 'cape_good_hope'],   // Southern Indian Ocean (~4500nm, open ocean)

  // East Pacific internal
  ['us_west_coast', 'east_pacific_mid'],   // Offshore CA → Central America (~2000nm, open ocean)
  ['east_pacific_mid', 'panama_canal_pac'], // → Panama (~700nm)
  ['east_pacific_mid', 'south_america_pac'], // → Peru (~1100nm)
  ['south_america_pac', 'panama_canal_pac'], // → Panama (~900nm, coastal)
  ['south_america_pac', 'cape_horn'],      // Down South American coast (~3500nm)
  ['us_west_coast', 'north_pacific'],      // CA → mid-Pacific (~2500nm, open ocean)

  // Trans-Pacific
  ['north_pacific', 'tsugaru_strait'],     // → Japan (~2500nm, open ocean)
  ['north_pacific', 'south_pacific'],      // Cross-Pacific (~3000nm, open ocean)

  // Arctic
  ['norwegian_sea', 'danish_straits'],     // Down Norwegian coast (~600nm)
  ['norwegian_sea', 'english_channel'],    // West of Scandinavia (~800nm)
  ['barents_sea', 'norwegian_sea'],        // Along Norwegian coast (~1200nm)
];

// ---------------------------------------------------------------------------
// Waypoint → Country mapping (for transit country risk scoring)
// ---------------------------------------------------------------------------

/**
 * Maps waypoint IDs to the countries they transit or border.
 * Used by the scoring engine to determine which high-risk countries
 * a route passes near.
 */
const WAYPOINT_COUNTRY_MAP: Record<string, string[]> = {
  bab_el_mandeb: ['YE', 'DJ', 'ER'],
  red_sea_mid: ['SA', 'SD', 'ER'],
  suez_canal: ['EG'],
  gulf_of_aden: ['YE', 'DJ', 'SO'],
  arabian_sea: ['IN', 'PK'],
  gulf_of_oman: ['OM', 'IR'],
  hormuz_strait: ['IR', 'OM'],
  malacca_strait: ['MY', 'ID'],
  singapore_strait: ['SG', 'MY'],
  lombok_strait: ['ID'],
  gibraltar: ['ES', 'MA'],
  english_channel: ['GB', 'FR'],
  panama_canal_pac: ['PA'],
  panama_canal_atl: ['PA'],
  bosphorus: ['TR'],
  cape_good_hope: ['ZA'],
  mozambique_channel: ['MZ'],
  danish_straits: ['DK'],
  taiwan_strait: ['TW'],
  cape_horn: ['CL'],
  dakar: ['SN'],
  gulf_guinea_w: ['CI', 'GH'],
  gulf_guinea_e: ['NG', 'CM'],
  luanda_offshore: ['AO'],
  luzon_strait: ['PH'],
  scs_central: ['VN', 'PH'],
  sulu_sea: ['PH', 'MY'],
  sri_lanka: ['LK'],
  mombasa_offshore: ['KE'],
  korea_strait: ['KR', 'JP'],
  tsugaru_strait: ['JP'],
  yucatan_channel: ['MX', 'CU'],
  windward_passage: ['HT', 'CU'],
  florida_strait: ['US', 'CU'],
  east_med: ['CY', 'EG'],
  torres_strait: ['AU', 'PG'],
  coral_sea: ['AU'],
  bass_strait: ['AU'],
  south_pacific: [],
  south_australia: ['AU'],
  us_west_coast: ['US'],
  east_pacific_mid: [],
  south_america_pac: ['PE', 'EC'],
  north_pacific: [],
  norwegian_sea: ['NO'],
  barents_sea: ['RU', 'NO'],
};

/**
 * Build a deduplicated list of countries transited by a route,
 * based on origin/destination port country codes and waypoint countries.
 */
export function getTransitCountries(
  origin: Port,
  destination: Port,
  waypointIds: string[],
): string[] {
  const countries = new Set<string>();

  if (origin.countryCode) countries.add(origin.countryCode);
  if (destination.countryCode) countries.add(destination.countryCode);

  for (const wpId of waypointIds) {
    const wpCountries = WAYPOINT_COUNTRY_MAP[wpId];
    if (wpCountries) {
      for (const cc of wpCountries) {
        countries.add(cc);
      }
    }
  }

  return [...countries];
}

/**
 * Derive transit countries from route segments using EEZ analysis.
 * Used as a fallback when via waypoints bypass the strategic waypoint graph
 * (so waypoint IDs are not available for WAYPOINT_COUNTRY_MAP lookup).
 */
export function getTransitCountriesFromCoords(
  segments: RouteSegment[],
  totalDistanceNm: number,
  origin: Port,
  destination: Port,
): string[] {
  const countries = new Set<string>();
  if (origin.countryCode) countries.add(origin.countryCode);
  if (destination.countryCode) countries.add(destination.countryCode);

  try {
    const { analyzeRouteEezTransit, getEezTransitCountries } = require('../geography/index.js') as typeof import('../geography/index.js');
    const eezResult = analyzeRouteEezTransit(segments, totalDistanceNm);
    for (const cc of getEezTransitCountries(eezResult)) {
      countries.add(cc);
    }
  } catch {
    // EEZ analyzer unavailable — return only port countries
  }
  return [...countries];
}

// ---------------------------------------------------------------------------
// Adjacency List (waypoint-level, distance-weighted)
// ---------------------------------------------------------------------------

interface WPEdge {
  toId: string;
  distance: number;
}

const waypointAdj = new Map<string, WPEdge[]>();

function getWPAdj(id: string): WPEdge[] {
  let list = waypointAdj.get(id);
  if (!list) {
    list = [];
    waypointAdj.set(id, list);
  }
  return list;
}

// Build adjacency from edges with computed distances
for (const [idA, idB] of WAYPOINT_EDGES) {
  const a = waypointMap.get(idA);
  const b = waypointMap.get(idB);
  if (!a || !b) continue;

  const dist = haversineDistance(a.lat, a.lon, b.lat, b.lon);

  const adjA = getWPAdj(idA);
  const adjB = getWPAdj(idB);

  if (!adjA.some(e => e.toId === idB)) {
    adjA.push({ toId: idB, distance: dist });
  }
  if (!adjB.some(e => e.toId === idA)) {
    adjB.push({ toId: idA, distance: dist });
  }
}

// ---------------------------------------------------------------------------
// Dijkstra on Waypoint Graph
// ---------------------------------------------------------------------------

interface DijkstraResult {
  waypointIds: string[];
  totalDistance: number;
}

/** Avoidance zone penalty multiplier — makes edges through avoid zones 100x costlier. */
const AVOID_ZONE_PENALTY = 100;

/**
 * Check if a leg between two points intersects any avoid zone polygon.
 */
function legIntersectsAvoidZone(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  avoidZones: Array<[number, number][]>,
): boolean {
  if (avoidZones.length === 0) return false;

  const seg: SpatialRouteSegment = { fromLat, fromLon, toLat, toLon };
  for (const zone of avoidZones) {
    if (segmentIntersectsPolygon(seg, zone)) return true;
  }
  return false;
}

/**
 * Find the shortest-distance path through the waypoint graph from
 * an origin port to a destination port.
 *
 * Creates virtual start/end nodes connected to all waypoints in
 * the port's region, then runs Dijkstra.
 *
 * If avoidZones is provided, edges that intersect any avoid zone polygon
 * receive a 100x distance penalty, effectively routing around them.
 */
function dijkstraRoute(
  origin: Port,
  dest: Port,
  avoidZones: Array<[number, number][]> = [],
): DijkstraResult | null {
  // Virtual node IDs
  const ORIGIN_ID = '__origin__';
  const DEST_ID = '__dest__';

  // Build a temporary adjacency that includes virtual nodes
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  // Get all node IDs
  const allNodeIds = new Set<string>();
  allNodeIds.add(ORIGIN_ID);
  allNodeIds.add(DEST_ID);
  for (const wp of WAYPOINT_NODES) {
    allNodeIds.add(wp.id);
  }

  // Initialize distances
  for (const id of allNodeIds) {
    dist.set(id, Infinity);
    prev.set(id, null);
  }
  dist.set(ORIGIN_ID, 0);

  // Build virtual edges from origin to its region's waypoints
  const originWPs = REGION_WAYPOINTS[origin.region] ?? [];
  const destWPs = REGION_WAYPOINTS[dest.region] ?? [];

  // If same region, add direct edge from origin to dest
  const sameRegion = origin.region === dest.region;

  // Priority queue (simple array-based for small graph)
  // Each entry: [nodeId, distance]
  const pq: Array<[string, number]> = [[ORIGIN_ID, 0]];

  while (pq.length > 0) {
    // Find minimum distance node
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i]![1] < pq[minIdx]![1]) minIdx = i;
    }
    const [currentId, currentDist] = pq.splice(minIdx, 1)[0]!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId === DEST_ID) break;

    // Get neighbors
    let neighbors: Array<{ id: string; distance: number }> = [];

    if (currentId === ORIGIN_ID) {
      // Connect to all waypoints in origin's region
      for (const wpId of originWPs) {
        const wp = waypointMap.get(wpId);
        if (wp) {
          let d = haversineDistance(origin.lat, origin.lon, wp.lat, wp.lon);
          if (legIntersectsAvoidZone(origin.lat, origin.lon, wp.lat, wp.lon, avoidZones)) {
            d *= AVOID_ZONE_PENALTY;
          }
          neighbors.push({ id: wpId, distance: d });
        }
      }
      // Direct connection if same region
      if (sameRegion) {
        let d = haversineDistance(origin.lat, origin.lon, dest.lat, dest.lon);
        if (legIntersectsAvoidZone(origin.lat, origin.lon, dest.lat, dest.lon, avoidZones)) {
          d *= AVOID_ZONE_PENALTY;
        }
        neighbors.push({ id: DEST_ID, distance: d });
      }
    } else if (currentId === DEST_ID) {
      // Destination has no outgoing edges
    } else {
      // Regular waypoint node
      const currentWp = waypointMap.get(currentId);
      const adj = waypointAdj.get(currentId) ?? [];
      for (const edge of adj) {
        let d = edge.distance;
        if (currentWp) {
          const targetWp = waypointMap.get(edge.toId);
          if (targetWp && legIntersectsAvoidZone(currentWp.lat, currentWp.lon, targetWp.lat, targetWp.lon, avoidZones)) {
            d *= AVOID_ZONE_PENALTY;
          }
        }
        neighbors.push({ id: edge.toId, distance: d });
      }
      // Connect to destination if waypoint is in dest's region
      if (destWPs.includes(currentId)) {
        const wp = waypointMap.get(currentId);
        if (wp) {
          let d = haversineDistance(wp.lat, wp.lon, dest.lat, dest.lon);
          if (legIntersectsAvoidZone(wp.lat, wp.lon, dest.lat, dest.lon, avoidZones)) {
            d *= AVOID_ZONE_PENALTY;
          }
          neighbors.push({ id: DEST_ID, distance: d });
        }
      }
    }

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.id)) continue;
      const newDist = currentDist + neighbor.distance;
      const oldDist = dist.get(neighbor.id) ?? Infinity;
      if (newDist < oldDist) {
        dist.set(neighbor.id, newDist);
        prev.set(neighbor.id, currentId);
        pq.push([neighbor.id, newDist]);
      }
    }
  }

  // Reconstruct path
  const totalDist = dist.get(DEST_ID);
  if (totalDist === undefined || totalDist === Infinity) {
    return null; // No route found
  }

  const path: string[] = [];
  let current: string | null | undefined = DEST_ID;
  while (current && current !== ORIGIN_ID) {
    path.unshift(current);
    current = prev.get(current);
  }

  // Extract waypoint IDs (exclude virtual origin/dest nodes)
  const waypointIds = path.filter(id => id !== DEST_ID && id !== ORIGIN_ID);

  return {
    waypointIds,
    totalDistance: totalDist,
  };
}

// ---------------------------------------------------------------------------
// Route Construction Helpers
// ---------------------------------------------------------------------------

function buildRouteChain(
  origin: Port,
  dest: Port,
  waypointIds: string[],
): {
  chainPoints: Array<{ lat: number; lon: number; name?: string }>;
  resolvedWaypoints: WaypointNode[];
  hazardZones: string[];
} {
  const chainPoints: Array<{ lat: number; lon: number; name?: string }> = [
    { lat: origin.lat, lon: origin.lon, name: origin.name },
  ];

  const resolvedWaypoints: WaypointNode[] = [];
  const hazardZones: string[] = [];

  for (const wpId of waypointIds) {
    const wp = waypointMap.get(wpId);
    if (wp) {
      resolvedWaypoints.push(wp);
      chainPoints.push({ lat: wp.lat, lon: wp.lon, name: wp.name });
      hazardZones.push(wp.name);
    }
  }

  chainPoints.push({ lat: dest.lat, lon: dest.lon, name: dest.name });

  return { chainPoints, resolvedWaypoints, hazardZones };
}

function buildSegmentsAndGeoJSON(
  chainPoints: Array<{ lat: number; lon: number; name?: string }>,
): {
  segments: RouteSegment[];
  totalDistanceNm: number;
  allCoords: [number, number][];
} {
  const segments: RouteSegment[] = [];
  let totalDistanceNm = 0;
  const allCoords: [number, number][] = [];

  for (let i = 0; i < chainPoints.length - 1; i++) {
    const from = chainPoints[i]!;
    const to = chainPoints[i + 1]!;

    const segDist = haversineDistance(from.lat, from.lon, to.lat, to.lon);
    const segBearing = bearing(from.lat, from.lon, to.lat, to.lon);

    segments.push({
      fromLat: from.lat,
      fromLon: from.lon,
      toLat: to.lat,
      toLon: to.lon,
      distanceNm: Math.round(segDist * 10) / 10,
      bearing: Math.round(segBearing * 10) / 10,
    });

    totalDistanceNm += segDist;

    // Use Marnet shipping lane network for realistic visual paths
    const marnetPath = findMaritimeRoute(from.lat, from.lon, to.lat, to.lon);

    // marnetPath is already [lon, lat] (GeoJSON convention) — push directly
    const startIdx = i === 0 ? 0 : 1; // skip first point on subsequent segments to avoid duplicates
    for (let j = startIdx; j < marnetPath.length; j++) {
      allCoords.push(marnetPath[j]!);
    }
  }

  totalDistanceNm = Math.round(totalDistanceNm * 10) / 10;

  return { segments, totalDistanceNm, allCoords };
}

// ---------------------------------------------------------------------------
// Route Computation (Public API)
// ---------------------------------------------------------------------------

/**
 * Compute a maritime route between two ports identified by UN/LOCODE.
 *
 * Returns the handler-compatible response shape, or null if either port
 * is not found or no route can be computed.
 */
export function computeRoute(
  originLocode: string,
  destLocode: string,
  options?: { avoid_zones?: Array<[number, number][]>; prefer_eca?: boolean; via_waypoints?: Array<{ lat: number; lon: number }> },
): ComputeRouteResponse | null {
  const origin = getPortByLocode(originLocode);
  const dest = getPortByLocode(destLocode);

  if (!origin || !dest) {
    return null;
  }

  // Same port
  if (origin.locode === dest.locode) {
    return {
      origin_locode: origin.locode,
      dest_locode: dest.locode,
      distance_nm: 0,
      duration_hours: 0,
      waypoints: [{ lat: origin.lat, lng: origin.lon, name: origin.name }],
      route_geojson: { type: 'FeatureCollection', features: [] },
      hazard_zones_crossed: [],
    };
  }

  // If via waypoints are provided, skip the Dijkstra waypoint graph and
  // chain directly: origin → via1 → via2 → ... → destination.
  // Each segment is routed through the ocean pathfinder.
  const viaWaypoints = options?.via_waypoints;
  let chainPoints: Array<{ lat: number; lon: number; name?: string }>;
  let resolvedWaypoints: WaypointNode[] = [];
  let hazardZones: string[] = [];

  if (viaWaypoints && viaWaypoints.length > 0) {
    chainPoints = [
      { lat: origin.lat, lon: origin.lon, name: origin.name },
      ...viaWaypoints.map((wp, i) => ({ lat: wp.lat, lon: wp.lon, name: `Via ${i + 1}` })),
      { lat: dest.lat, lon: dest.lon, name: dest.name },
    ];
  } else {
    // Find shortest distance path through waypoint graph (with avoidance zones)
    const avoidZones = options?.avoid_zones ?? [];
    const result = dijkstraRoute(origin, dest, avoidZones);
    if (!result) return null;

    const built = buildRouteChain(origin, dest, result.waypointIds);
    chainPoints = built.chainPoints;
    resolvedWaypoints = built.resolvedWaypoints;
    hazardZones = built.hazardZones;
  }

  const { segments, totalDistanceNm, allCoords } =
    buildSegmentsAndGeoJSON(chainPoints);

  const durationHours = Math.round((totalDistanceNm / DEFAULT_SPEED_KNOTS) * 10) / 10;

  const geojsonFeature: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {
      origin: origin.locode,
      destination: dest.locode,
      origin_name: origin.name,
      destination_name: dest.name,
      distance_nm: totalDistanceNm,
      duration_hours: durationHours,
      waypoints: resolvedWaypoints.map(w => w.name),
      hazard_zones: hazardZones,
    },
    geometry: {
      type: 'LineString',
      coordinates: allCoords,
    },
  };

  return {
    origin_locode: origin.locode,
    dest_locode: dest.locode,
    distance_nm: totalDistanceNm,
    duration_hours: durationHours,
    waypoints: chainPoints.map(p => ({
      lat: p.lat,
      lng: p.lon,
      name: p.name,
    })),
    route_geojson: {
      type: 'FeatureCollection',
      features: [geojsonFeature],
    },
    hazard_zones_crossed: hazardZones,
  };
}

/**
 * Compute a route and return the internal ComputedRoute format.
 * Used by other server modules that need the full route object.
 *
 * @param avoidZones — Optional array of polygon coordinate arrays.
 *   Edges intersecting these zones receive a 100x distance penalty.
 */
export function computeRouteInternal(
  originLocode: string,
  destLocode: string,
  avoidZones: Array<[number, number][]> = [],
  viaWaypoints?: Array<{ lat: number; lon: number }>,
): ComputedRoute | null {
  const origin = getPortByLocode(originLocode);
  const dest = getPortByLocode(destLocode);

  if (!origin || !dest) return null;

  if (origin.locode === dest.locode) {
    return {
      origin,
      destination: dest,
      waypoints: [],
      segments: [],
      totalDistanceNm: 0,
      geojson: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [] },
      },
    };
  }

  let chainPoints: Array<{ lat: number; lon: number; name?: string }>;
  let resolvedWaypoints: WaypointNode[] = [];

  if (viaWaypoints && viaWaypoints.length > 0) {
    // Chain: origin → via1 → via2 → ... → dest (same as computeRoute via path)
    chainPoints = [
      { lat: origin.lat, lon: origin.lon, name: origin.name },
      ...viaWaypoints.map((wp, i) => ({ lat: wp.lat, lon: wp.lon, name: `Via ${i + 1}` })),
      { lat: dest.lat, lon: dest.lon, name: dest.name },
    ];
  } else {
    const result = dijkstraRoute(origin, dest, avoidZones);
    if (!result) return null;

    const built = buildRouteChain(origin, dest, result.waypointIds);
    chainPoints = built.chainPoints;
    resolvedWaypoints = built.resolvedWaypoints;
  }

  const { segments, totalDistanceNm, allCoords } =
    buildSegmentsAndGeoJSON(chainPoints);

  return {
    origin,
    destination: dest,
    waypoints: resolvedWaypoints,
    segments,
    totalDistanceNm,
    geojson: {
      type: 'Feature',
      properties: {
        origin: origin.locode,
        destination: dest.locode,
        distance_nm: totalDistanceNm,
      },
      geometry: {
        type: 'LineString',
        coordinates: allCoords,
      },
    },
  };
}
