export interface ScoreState {
  distance: number;
  coins: number;
  combo: number;
  score: number;
}

export function createScoreState(): ScoreState {
  return { distance: 0, coins: 0, combo: 0, score: 0 };
}

export function addDistance(state: ScoreState, pixels: number, tileSize = 18): void {
  const distanceScore = Math.max(state.distance, 0, Math.floor(pixels / tileSize));
  state.score += distanceScore - state.distance;
  state.distance = distanceScore;
}

export function collectCoin(state: ScoreState): number {
  state.combo = Math.min(state.combo + 1, 5);
  state.coins += 1;
  const earned = state.combo * 10;
  state.score += earned;
  return earned;
}

export function resetCombo(state: ScoreState): void {
  state.combo = 0;
}

export function addCheckpointBonus(state: ScoreState, zone: number): number {
  const bonus = 100 * Math.max(1, Math.floor(zone));
  state.score += bonus;
  return bonus;
}
