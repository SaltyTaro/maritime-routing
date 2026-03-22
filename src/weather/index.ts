/**
 * Beaufort-based speed reduction model for weather-aware ETA computation.
 *
 * Implements IMO-documented voluntary speed reduction factors (Kwon 2008,
 * Lu et al. 2015) indexed by Beaufort number for each vessel type and
 * load condition. Laden vs ballast matters: ballast vessels have higher
 * freeboard, more windage, worse rolling in beam seas.
 *
 * @module @arcnautical/maritime-routing/weather
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VesselType = 'container' | 'bulk' | 'tanker' | 'lng' | 'general';
export type LoadCondition = 'laden' | 'ballast';

export interface SpeedModelInput {
  baseSpeedKnots: number;
  waveHeightM: number;
  windSpeedKt: number;
  swellHeightM: number;
  vesselType: VesselType;
  loadCondition: LoadCondition;
  waveDirectionDeg?: number;
  windDirectionDeg?: number;
  swellDirectionDeg?: number;
  vesselHeadingDeg?: number;
  currentVelocityKt?: number;
  currentDirectionDeg?: number;
}

export interface SpeedModelOutput {
  effectiveSpeedKnots: number;
  speedReductionPct: number;
  beaufortNumber: number;
  seaStateFactor: number;
  limitingFactor: 'wave' | 'wind' | 'swell' | 'none';
  relativeWaveAngleDeg?: number;
  cbetaFactor?: number;
  currentEffectKt?: number;
}

export interface SegmentEta {
  segmentIndex: number;
  distanceNm: number;
  effectiveSpeedKnots: number;
  transitHours: number;
  weatherImpactFactor: number;
  beaufortNumber: number;
}

export interface RouteEtaResult {
  totalTransitHours: number;
  segmentEtas: SegmentEta[];
  averageEffectiveSpeed: number;
  worstSegmentIndex: number;
  weatherSource: 'open_meteo_deterministic';
}

// ---------------------------------------------------------------------------
// Beaufort Scale Conversions
// ---------------------------------------------------------------------------

const BEAUFORT_WIND_KT = [1, 3, 6, 10, 16, 21, 27, 33, 40, 47, 55, 63, 999];

/** Wind speed (kt) to Beaufort number (0-12). */
export function windToBeaufort(windKt: number): number {
  if (windKt < 0) return 0;
  for (let bf = 0; bf < BEAUFORT_WIND_KT.length; bf++) {
    if (windKt < BEAUFORT_WIND_KT[bf]!) return bf;
  }
  return 12;
}

const BEAUFORT_WAVE_M = [0, 0.1, 0.3, 0.6, 1.0, 2.0, 3.0, 4.0, 5.5, 7.0, 9.0, 11.5, 14.0];

/** Wave height (m) to pseudo-Beaufort (WMO sea state correlation). */
export function waveToBeaufort(waveM: number): number {
  if (waveM < 0) return 0;
  for (let bf = 0; bf < BEAUFORT_WAVE_M.length; bf++) {
    if (waveM < BEAUFORT_WAVE_M[bf]!) return Math.max(0, bf - 1);
  }
  return 12;
}

// ---------------------------------------------------------------------------
// Sea State Factor Tables
// ---------------------------------------------------------------------------

const SEA_STATE_FACTORS: Record<VesselType, Record<LoadCondition, number[]>> = {
  container: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.97, 0.93, 0.87, 0.79, 0.68, 0.55, 0.40, 0.25, 0.10],
    ballast: [1.00, 1.00, 0.99, 0.97, 0.94, 0.88, 0.80, 0.70, 0.58, 0.44, 0.30, 0.18, 0.07],
  },
  bulk: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.96, 0.91, 0.84, 0.75, 0.63, 0.50, 0.36, 0.22, 0.09],
    ballast: [1.00, 1.00, 0.98, 0.96, 0.92, 0.83, 0.73, 0.61, 0.48, 0.34, 0.22, 0.12, 0.05],
  },
  tanker: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.97, 0.94, 0.89, 0.82, 0.72, 0.60, 0.46, 0.30, 0.12],
    ballast: [1.00, 1.00, 0.99, 0.97, 0.93, 0.86, 0.77, 0.66, 0.53, 0.39, 0.26, 0.15, 0.06],
  },
  lng: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.96, 0.92, 0.86, 0.78, 0.67, 0.54, 0.39, 0.24, 0.10],
    ballast: [1.00, 1.00, 0.99, 0.97, 0.93, 0.87, 0.79, 0.69, 0.56, 0.42, 0.28, 0.16, 0.06],
  },
  general: {
    laden:   [1.00, 1.00, 1.00, 0.99, 0.96, 0.91, 0.84, 0.75, 0.63, 0.50, 0.36, 0.22, 0.09],
    ballast: [1.00, 1.00, 0.98, 0.96, 0.92, 0.85, 0.76, 0.65, 0.52, 0.38, 0.25, 0.14, 0.06],
  },
};

// ---------------------------------------------------------------------------
// Kwon 2008 Cbeta — direction reduction factors
// ---------------------------------------------------------------------------

const CBETA: Record<string, number[]> = {
  head:      [0, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
  bow:       [0, 0.72, 0.78, 0.82, 0.85, 0.84, 0.73, 0.58, 0.37, 0.12, 0.00, 0.00, 0.00],
  beam:      [0, 0.00, 0.00, 0.24, 0.39, 0.45, 0.45, 0.39, 0.21, 0.00, 0.00, 0.00, 0.00],
  following: [0, 0.00, 0.00, 0.00, 0.13, 0.07, 0.20, 0.19, 0.20, 0.16, 0.05, 0.00, 0.00],
};

function relativeAngle(waveFromDeg: number, vesselHeadingDeg: number): number {
  let diff = Math.abs(waveFromDeg - vesselHeadingDeg);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function angleCategory(relAngleDeg: number): string {
  if (relAngleDeg <= 30) return 'head';
  if (relAngleDeg <= 60) return 'bow';
  if (relAngleDeg <= 150) return 'beam';
  return 'following';
}

function lookupCbeta(bf: number, relAngleDeg: number): number {
  const cat = angleCategory(relAngleDeg);
  const table = CBETA[cat]!;
  const bfClamped = Math.max(0, Math.min(12, Math.round(bf)));
  return table[bfClamped] ?? 1.0;
}

// ---------------------------------------------------------------------------
// Core Speed Model
// ---------------------------------------------------------------------------

const MIN_SPEED_FACTOR = 0.04;

/**
 * Compute effective speed reduction from sea state conditions.
 *
 * Uses the maximum Beaufort number from wind and wave inputs,
 * then looks up the corresponding factor for vessel type/load.
 * When direction data is available, applies Kwon 2008 Cbeta reduction.
 * When ocean current data is available, adds along-track current component.
 *
 * @example
 * ```ts
 * import { computeSeaStateFactor } from '@arcnautical/maritime-routing/weather';
 *
 * const result = computeSeaStateFactor({
 *   baseSpeedKnots: 14,
 *   waveHeightM: 2.5,
 *   windSpeedKt: 25,
 *   swellHeightM: 1.5,
 *   vesselType: 'bulk',
 *   loadCondition: 'laden',
 * });
 *
 * console.log(result.effectiveSpeedKnots); // ~12.7
 * console.log(result.beaufortNumber);      // 6
 * ```
 */
export function computeSeaStateFactor(input: SpeedModelInput): SpeedModelOutput {
  const windBf = windToBeaufort(input.windSpeedKt);
  const waveBf = waveToBeaufort(input.waveHeightM);
  const swellBf = waveToBeaufort(input.swellHeightM);

  const maxBf = Math.max(windBf, waveBf, swellBf);
  let limitingFactor: SpeedModelOutput['limitingFactor'] = 'none';
  if (maxBf > 0) {
    if (windBf >= waveBf && windBf >= swellBf) limitingFactor = 'wind';
    else if (waveBf >= swellBf) limitingFactor = 'wave';
    else limitingFactor = 'swell';
  }

  let fracBf = maxBf;
  if (maxBf > 0 && maxBf < 12) {
    const waveThreshLow = BEAUFORT_WAVE_M[maxBf] ?? 0;
    const waveThreshHigh = BEAUFORT_WAVE_M[maxBf + 1] ?? waveThreshLow + 2;
    const range = waveThreshHigh - waveThreshLow;
    if (range > 0) {
      const frac = Math.max(0, Math.min(1, (input.waveHeightM - waveThreshLow) / range));
      fracBf = maxBf + frac;
    }
  }

  const factors = SEA_STATE_FACTORS[input.vesselType][input.loadCondition];
  const bfLow = Math.floor(fracBf);
  const bfHigh = Math.min(12, bfLow + 1);
  const t = fracBf - bfLow;
  const factorLow = factors[bfLow] ?? 1;
  const factorHigh = factors[bfHigh] ?? factorLow;
  const headSeaFactor = factorLow + (factorHigh - factorLow) * t;

  let cbetaFactor: number | undefined;
  let relWaveAngle: number | undefined;
  let seaStateFactor: number;

  const hasDirection = input.waveDirectionDeg != null && input.vesselHeadingDeg != null;

  if (hasDirection && maxBf > 0) {
    relWaveAngle = relativeAngle(input.waveDirectionDeg!, input.vesselHeadingDeg!);
    cbetaFactor = lookupCbeta(maxBf, relWaveAngle);
    const speedLoss = 1 - headSeaFactor;
    seaStateFactor = Math.max(MIN_SPEED_FACTOR, 1 - cbetaFactor * speedLoss);
  } else {
    seaStateFactor = Math.max(MIN_SPEED_FACTOR, headSeaFactor);
  }

  const weatherAdjustedSTW = Math.max(
    input.baseSpeedKnots * MIN_SPEED_FACTOR,
    input.baseSpeedKnots * seaStateFactor,
  );

  let currentEffectKt: number | undefined;
  let effectiveSpeedKnots = weatherAdjustedSTW;

  if (
    input.currentVelocityKt != null &&
    input.currentVelocityKt > 0 &&
    input.currentDirectionDeg != null &&
    input.vesselHeadingDeg != null
  ) {
    const angleDiff = (input.currentDirectionDeg - input.vesselHeadingDeg) * Math.PI / 180;
    currentEffectKt = input.currentVelocityKt * Math.cos(angleDiff);
    effectiveSpeedKnots = Math.max(0.5, weatherAdjustedSTW + currentEffectKt);
  }

  return {
    effectiveSpeedKnots: Math.round(effectiveSpeedKnots * 100) / 100,
    speedReductionPct: Math.round((1 - seaStateFactor) * 10000) / 100,
    beaufortNumber: maxBf,
    seaStateFactor: Math.round(seaStateFactor * 1000) / 1000,
    limitingFactor,
    relativeWaveAngleDeg: relWaveAngle != null ? Math.round(relWaveAngle) : undefined,
    cbetaFactor: cbetaFactor != null ? Math.round(cbetaFactor * 1000) / 1000 : undefined,
    currentEffectKt: currentEffectKt != null ? Math.round(currentEffectKt * 100) / 100 : undefined,
  };
}

// ---------------------------------------------------------------------------
// Route ETA Computation
// ---------------------------------------------------------------------------

export interface SegmentWeatherSummary {
  meanWaveHeightM: number;
  meanWindSpeedKt: number;
  meanSwellHeightM: number;
  meanWaveDirectionDeg?: number;
  meanSwellDirectionDeg?: number;
  meanWindDirectionDeg?: number;
  meanCurrentVelocityKt?: number;
  meanCurrentDirectionDeg?: number;
}

/**
 * Compute weather-adjusted ETA for a route with per-segment weather data.
 *
 * @example
 * ```ts
 * import { computeRouteEta } from '@arcnautical/maritime-routing/weather';
 *
 * const eta = computeRouteEta(
 *   [{ distanceNm: 500, bearing: 270 }, { distanceNm: 300, bearing: 280 }],
 *   [
 *     { meanWaveHeightM: 1.5, meanWindSpeedKt: 15, meanSwellHeightM: 1.0 },
 *     { meanWaveHeightM: 2.0, meanWindSpeedKt: 20, meanSwellHeightM: 1.5 },
 *   ],
 *   14, 'bulk', 'laden',
 * );
 *
 * console.log(eta.totalTransitHours); // ~58.3
 * ```
 */
export function computeRouteEta(
  segments: Array<{ distanceNm: number; bearing?: number }>,
  segmentWeather: SegmentWeatherSummary[],
  baseSpeedKnots: number,
  vesselType: VesselType,
  loadCondition: LoadCondition,
): RouteEtaResult {
  const segmentEtas: SegmentEta[] = [];
  let totalTransitHours = 0;
  let totalDistance = 0;
  let worstFactor = 1;
  let worstIdx = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const weather = segmentWeather[i] ?? { meanWaveHeightM: 0, meanWindSpeedKt: 0, meanSwellHeightM: 0 };

    const result = computeSeaStateFactor({
      baseSpeedKnots,
      waveHeightM: weather.meanWaveHeightM,
      windSpeedKt: weather.meanWindSpeedKt,
      swellHeightM: weather.meanSwellHeightM,
      vesselType,
      loadCondition,
      waveDirectionDeg: weather.meanWaveDirectionDeg,
      windDirectionDeg: weather.meanWindDirectionDeg,
      swellDirectionDeg: weather.meanSwellDirectionDeg,
      vesselHeadingDeg: seg.bearing,
      currentVelocityKt: weather.meanCurrentVelocityKt,
      currentDirectionDeg: weather.meanCurrentDirectionDeg,
    });

    const transitHours = seg.distanceNm > 0 ? seg.distanceNm / result.effectiveSpeedKnots : 0;
    const weatherImpactFactor = baseSpeedKnots > 0 ? baseSpeedKnots / result.effectiveSpeedKnots : 1;

    segmentEtas.push({
      segmentIndex: i,
      distanceNm: seg.distanceNm,
      effectiveSpeedKnots: result.effectiveSpeedKnots,
      transitHours,
      weatherImpactFactor,
      beaufortNumber: result.beaufortNumber,
    });

    totalTransitHours += transitHours;
    totalDistance += seg.distanceNm;

    if (result.seaStateFactor < worstFactor) {
      worstFactor = result.seaStateFactor;
      worstIdx = i;
    }
  }

  const averageEffectiveSpeed = totalTransitHours > 0
    ? totalDistance / totalTransitHours
    : baseSpeedKnots;

  return {
    totalTransitHours: Math.round(totalTransitHours * 100) / 100,
    segmentEtas,
    averageEffectiveSpeed: Math.round(averageEffectiveSpeed * 100) / 100,
    worstSegmentIndex: worstIdx,
    weatherSource: 'open_meteo_deterministic',
  };
}
