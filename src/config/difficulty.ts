import { PHYSICS } from './physics';
import { maxReachableGapTiles } from '../systems/Reachability';

export interface DifficultyParams {
  zone: number;
  runSpeed: number;
  maxGapWidthTiles: number;
  maxHeightDeltaTiles: number;
  hazardChance: number;
  chunkCount: number;
  unlockedHazards: string[];
}

const HAZARDS = [
  { zone: 2, kind: 'spikes' },
  { zone: 3, kind: 'crumbling' },
  { zone: 4, kind: 'moving-vertical' },
  { zone: 5, kind: 'moving-horizontal' },
  { zone: 6, kind: 'walker' },
] as const;

export function getDifficulty(zone: number): DifficultyParams {
  const level = Math.max(1, Math.floor(zone));
  const runSpeed = Math.min(160 + (level - 1) * 12, 320);
  const desiredGap = 2 + (level - 1) * 0.5;
  return {
    zone: level,
    runSpeed,
    maxGapWidthTiles: Math.min(
      desiredGap,
      maxReachableGapTiles(runSpeed, 0, PHYSICS) * 0.85,
    ),
    maxHeightDeltaTiles: Math.min(1 + (level - 1) * 0.5, 4),
    hazardChance: Math.min((level - 1) * 0.08, 0.6),
    chunkCount: Math.min(6 + level - 1, 14),
    unlockedHazards: HAZARDS.filter((hazard) => level >= hazard.zone).map(
      (hazard) => hazard.kind,
    ),
  };
}
