import { describe, expect, it } from 'vitest';
import { canReachGap, maxReachableGapTiles } from '../src/systems/Reachability';

describe('jump reachability', () => {
  it('permits a short gap and rejects a gap beyond the safety margin', () => {
    expect(canReachGap(2, 0, 160)).toBe(true);
    expect(canReachGap(maxReachableGapTiles(160, 0) + 1, 0, 160)).toBe(false);
  });

  it('accounts for run speed and landing height', () => {
    expect(maxReachableGapTiles(320, 0)).toBeGreaterThan(maxReachableGapTiles(160, 0));
    expect(maxReachableGapTiles(160, 1)).toBeGreaterThan(maxReachableGapTiles(160, -1));
  });
});
