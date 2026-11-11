import { describe, expect, it } from 'vitest';
import { generateZone } from '../src/systems/LevelGenerator';
import { canReachGap } from '../src/systems/Reachability';
import { getDifficulty } from '../src/config/difficulty';

describe('generateZone', () => {
  it('is deterministic for a seed and zone', () => {
    expect(generateZone(12345, 7)).toEqual(generateZone(12345, 7));
    expect(generateZone(12345, 7)).not.toEqual(generateZone(54321, 7));
  });

  it('keeps generated gaps reachable through zone 20', () => {
    for (let zone = 1; zone <= 20; zone += 1) {
      const { runSpeed } = getDifficulty(zone);
      for (const chunk of generateZone(2026, zone)) {
        if (chunk.gapTiles > 0) {
          expect(canReachGap(chunk.gapTiles, chunk.heightDeltaTiles, runSpeed)).toBe(true);
        }
      }
    }
  });

  it('starts on a safe runway and ends at a checkpoint', () => {
    const chunks = generateZone(42, 3);
    expect(chunks[0]).toMatchObject({ safe: true, gapTiles: 0 });
    expect(chunks.at(-1)?.checkpoint).toBe(true);
  });
});
