import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEADERBOARD_KEY, LocalLeaderboardStore } from '../src/storage/LocalLeaderboardStore';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };
}

describe('LocalLeaderboardStore', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('sorts scores and trims the leaderboard to ten entries', async () => {
    const storage = createStorage();
    vi.stubGlobal('localStorage', storage);
    const store = new LocalLeaderboardStore();
    for (let score = 1; score <= 12; score += 1) {
      await store.submit({ initials: 'abc', score, zone: 1, date: '2026-01-01' });
    }
    const top = await store.getTop();
    expect(top).toHaveLength(10);
    expect(top[0]?.score).toBe(12);
    expect(top.at(-1)?.score).toBe(3);
    expect(storage.setItem).toHaveBeenCalledWith(LEADERBOARD_KEY, expect.any(String));
  });

  it('recovers from corrupt storage and sanitizes submitted initials', async () => {
    vi.stubGlobal('localStorage', createStorage({ [LEADERBOARD_KEY]: '{bad json' }));
    const store = new LocalLeaderboardStore();
    expect(await store.getTop()).toEqual([]);
    await store.submit({ initials: 'a!bcd', score: -5, zone: 0, date: 'invalid' });
    expect(await store.getTop()).toMatchObject([{ initials: 'ABC', score: 0, zone: 1 }]);
  });

  it('falls back to memory when storage access throws', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('unavailable'); },
      setItem: () => { throw new Error('unavailable'); },
    });
    const store = new LocalLeaderboardStore();
    await store.submit({ initials: 'XYZ', score: 100, zone: 2, date: '2026-01-01' });
    expect(await store.getTop()).toHaveLength(1);
  });
});
