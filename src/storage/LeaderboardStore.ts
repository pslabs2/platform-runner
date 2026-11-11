export interface ScoreEntry {
  initials: string;
  score: number;
  zone: number;
  date: string;
}

export interface LeaderboardStore {
  getTop(limit?: number): Promise<ScoreEntry[]>;
  submit(entry: ScoreEntry): Promise<number>;
  isHighScore(score: number): Promise<boolean>;
}
