import { describe, expect, it } from 'vitest';
import {
  addCheckpointBonus,
  addDistance,
  collectCoin,
  createScoreState,
  resetCombo,
} from '../src/systems/ScoreSystem';

describe('score system', () => {
  it('scores distance in tiles without regressing', () => {
    const score = createScoreState();
    addDistance(score, 180);
    addDistance(score, 90);
    expect(score.distance).toBe(10);
    expect(score.score).toBe(10);
  });

  it('increases coin combo to a maximum of five and resets on landing', () => {
    const score = createScoreState();
    expect(Array.from({ length: 6 }, () => collectCoin(score))).toEqual([
      10, 20, 30, 40, 50, 50,
    ]);
    resetCombo(score);
    expect(collectCoin(score)).toBe(10);
  });

  it('awards checkpoint bonus by zone', () => {
    const score = createScoreState();
    expect(addCheckpointBonus(score, 4)).toBe(400);
    expect(score.score).toBe(400);
  });
});
