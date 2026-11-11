import Phaser from 'phaser';
import { createButton } from '../ui/Button';
import { gameAudio } from '../systems/Audio';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(): void {
    this.add.rectangle(240, 135, 480, 270, 0x141b3a, 0.82);
    this.add.text(240, 70, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: '25px',
      color: '#ffffff',
    }).setOrigin(0.5);
    createButton(this, 240, 120, 'RESUME', () => this.resumeGame());
    createButton(this, 240, 156, `SOUND ${gameAudio.isMuted ? 'OFF' : 'ON'}`, () => {
      gameAudio.toggleMute();
      this.scene.restart();
    });
    createButton(this, 240, 192, 'TITLE', () => {
      this.scene.stop('PauseScene');
      this.scene.stop('HUDScene');
      this.scene.stop('GameScene');
      this.scene.start('TitleScene');
    });

    const escape = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const pause = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    escape?.once('down', () => this.resumeGame());
    pause?.once('down', () => this.resumeGame());
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
    this.scene.resume('HUDScene');
  }
}
