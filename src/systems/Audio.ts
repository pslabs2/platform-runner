import { getMuted, setMuted } from '../storage/Settings';
import { AUDIO_SETTINGS, SOUND_NOTES } from '../config/audio';

type SoundName = keyof typeof SOUND_NOTES;

export class Audio {
  private context: AudioContext | undefined;
  private muted = getMuted();

  get isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    setMuted(this.muted);
    return this.muted;
  }

  play(name: SoundName): void {
    if (this.muted || typeof window === 'undefined') return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume();
      const now = this.context.currentTime;
      SOUND_NOTES[name].forEach((frequency, index) => {
        const oscillator = this.context!.createOscillator();
        const gain = this.context!.createGain();
        const start = now + index * AUDIO_SETTINGS.noteSpacingSeconds;
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(AUDIO_SETTINGS.gain, start);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          start + AUDIO_SETTINGS.fadeDurationSeconds,
        );
        oscillator.connect(gain);
        gain.connect(this.context!.destination);
        oscillator.start(start);
        oscillator.stop(start + AUDIO_SETTINGS.noteDurationSeconds);
      });
    } catch {
      return;
    }
  }

}

export const gameAudio = new Audio();
