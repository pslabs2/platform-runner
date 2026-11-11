export const AUDIO_SETTINGS = {
  gain: 0.08,
  noteSpacingSeconds: 0.075,
  noteDurationSeconds: 0.12,
  fadeDurationSeconds: 0.11,
} as const;

export const SOUND_NOTES = {
  jump: [440, 660],
  doubleJump: [520, 780],
  coin: [880, 1175],
  checkpoint: [523, 659, 784],
  hurt: [330, 220],
  gameOver: [392, 330, 262],
  click: [660],
} as const;
