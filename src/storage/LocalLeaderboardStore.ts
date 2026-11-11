import type { LeaderboardStore, ScoreEntry } from './LeaderboardStore';

export const LEADERBOARD_KEY = 'platform-runner:leaderboard:v1';

export class LocalLeaderboardStore implements LeaderboardStore {
  private memory: ScoreEntry[] = [];
  private storageUnavailable = false;

  async getTop(limit = 10): Promise<ScoreEntry[]> {
    const entries = this.read();
    return entries.slice(0, Math.max(0, Math.floor(limit))).map((entry) => ({ ...entry }));
  }

  async submit(entry: ScoreEntry): Promise<number> {
    const valid: ScoreEntry = {
      initials: entry.initials.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'A'),
      score: Math.max(0, Math.floor(Number.isFinite(entry.score) ? entry.score : 0)),
      zone: Math.max(1, Math.floor(Number.isFinite(entry.zone) ? entry.zone : 1)),
      date: /^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? entry.date : new Date().toISOString().slice(0, 10),
    };
    const entries = [...this.read(), valid].sort(
      (a, b) => b.score - a.score || a.date.localeCompare(b.date),
    );
    const rank = entries.indexOf(valid);
    this.write(entries.slice(0, 10));
    return rank < 10 ? rank + 1 : -1;
  }

  async isHighScore(score: number): Promise<boolean> {
    const entries = this.read();
    return entries.length < 10 || score > (entries.at(-1)?.score ?? 0);
  }

  private read(): ScoreEntry[] {
    if (this.storageUnavailable) return this.memory;

    let raw: string | null | undefined;
    try {
      raw = globalThis.localStorage?.getItem(LEADERBOARD_KEY);
    } catch {
      this.storageUnavailable = true;
      return this.memory;
    }
    if (raw === null || raw === undefined) return this.memory;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return this.reset();
    }
    if (!Array.isArray(parsed)) return this.reset();
    try {
      this.memory = parsed
        .filter(
          (item): item is ScoreEntry =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as Record<string, unknown>).initials === 'string' &&
            typeof (item as Record<string, unknown>).score === 'number' &&
            Number.isFinite((item as Record<string, unknown>).score) &&
            typeof (item as Record<string, unknown>).zone === 'number' &&
            typeof (item as Record<string, unknown>).date === 'string',
        )
        .map((item) => ({
          initials: item.initials.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'A'),
          score: Math.max(0, Math.floor(item.score)),
          zone: Math.max(1, Math.floor(item.zone)),
          date: item.date.slice(0, 10),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      return this.memory;
    } catch {
      return this.reset();
    }
  }

  private write(entries: ScoreEntry[]): void {
    this.memory = entries;
    try {
      globalThis.localStorage?.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch {
      this.storageUnavailable = true;
    }
  }

  private reset(): ScoreEntry[] {
    this.memory = [];
    return this.memory;
  }
}
