const MUTE_KEY = 'platform-runner:muted:v1';

export function getMuted(): boolean {
  try {
    return globalThis.localStorage?.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    globalThis.localStorage?.setItem(MUTE_KEY, String(muted));
  } catch {
    return;
  }
}
