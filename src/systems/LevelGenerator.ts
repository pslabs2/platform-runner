import { PHYSICS } from '../config/physics';
import { getDifficulty } from '../config/difficulty';
import { canReachGap } from './Reachability';
import { createRng } from './Rng';
import { GAMEPLAY } from '../config/gameplay';
import type { HazardKind } from '../config/difficulty';

export interface ChunkSpec {
  index: number;
  widthTiles: number;
  gapTiles: number;
  heightDeltaTiles: number;
  coins: Array<{ x: number; y: number }>;
  hazard: HazardKind | null;
  checkpoint: boolean;
  safe: boolean;
}

export function generateZone(seed: number, zone: number): ChunkSpec[] {
  const difficulty = getDifficulty(zone);
  const random = createRng(seed ^ Math.imul(difficulty.zone, 0x9e3779b1));
  return Array.from({ length: difficulty.chunkCount }, (_, index) => {
    const checkpoint = index === difficulty.chunkCount - 1;
    const safe = index === 0;
    let gapTiles = 0;
    let heightDeltaTiles = 0;
    if (!safe) {
      const maxHeight = Math.floor(difficulty.maxHeightDeltaTiles);
      for (let attempt = 0; attempt < GAMEPLAY.maxJumpAttempts; attempt += 1) {
        const proposedGap =
          Math.floor(random() * Math.floor(difficulty.maxGapWidthTiles)) + 1;
        const proposedHeight = Math.floor(random() * (maxHeight * 2 + 1)) - maxHeight;
        if (canReachGap(proposedGap, proposedHeight, difficulty.runSpeed)) {
          gapTiles = proposedGap;
          heightDeltaTiles = proposedHeight;
          break;
        }
      }
    }

    const hazard =
      !safe &&
      difficulty.unlockedHazards.length > 0 &&
      random() < difficulty.hazardChance
        ? difficulty.unlockedHazards[
            Math.floor(random() * difficulty.unlockedHazards.length)
          ] ?? null
        : null;
    const coins = Array.from({ length: safe ? 0 : GAMEPLAY.coinsPerChunk }, (_, coinIndex) => ({
      x: (coinIndex + 2) * PHYSICS.tileSize,
      y: PHYSICS.groundY - 38 - Math.floor(random() * 12),
    }));

    return {
      index,
      widthTiles: GAMEPLAY.zoneChunkWidthTiles,
      gapTiles,
      heightDeltaTiles,
      coins,
      hazard,
      checkpoint,
      safe,
    };
  });
}
