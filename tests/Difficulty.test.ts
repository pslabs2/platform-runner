import { describe, expect, it } from 'vitest';
import { getDifficulty } from '../src/config/difficulty';

describe('getDifficulty', () => {
  it('progresses and respects the documented caps', () => {
    const first = getDifficulty(1);
    const last = getDifficulty(100);
    expect(first).toMatchObject({ runSpeed: 160, maxGapWidthTiles: 2, hazardChance: 0, chunkCount: 6 });
    expect(last.runSpeed).toBe(320);
    expect(last.maxHeightDeltaTiles).toBe(4);
    expect(last.hazardChance).toBe(0.6);
    expect(last.chunkCount).toBe(14);
  });

  it('unlocks hazards at their documented zones', () => {
    expect(getDifficulty(1).unlockedHazards).toEqual([]);
    expect(getDifficulty(6).unlockedHazards).toEqual([
      'spikes',
      'crumbling',
      'moving-vertical',
      'moving-horizontal',
      'walker',
    ]);
  });
});
