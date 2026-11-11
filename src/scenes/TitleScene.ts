import Phaser from 'phaser';
import { createButton } from '../ui/Button';
import { LocalLeaderboardStore } from '../storage/LocalLeaderboardStore';
import { Parallax } from '../systems/Parallax';
import { gameAudio } from '../systems/Audio';

export class TitleScene extends Phaser.Scene {
  private readonly leaderboard = new LocalLeaderboardStore();
  private parallax!: Parallax;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.parallax = new Parallax(this);
    this.add.text(240, 55, 'PLATFORM RUNNER', {
      fontFamily: 'monospace',
      fontSize: '25px',
      color: '#ffffff',
      stroke: '#1d2b53',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(240, 84, 'RUN • JUMP • KEEP GOING', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffcd75',
    }).setOrigin(0.5);

    createButton(this, 240, 122, 'PLAY', () => this.startRun());
    createButton(this, 240, 158, 'LEADERBOARD', () => {
      this.scene.launch('LeaderboardScene', { returnTo: 'TitleScene' });
    });
    this.add.text(240, 194, 'SPACE / W / ↑  JUMP     S / ↓  FAST-FALL', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#f4f4f4',
    }).setOrigin(0.5);
    this.add.text(240, 210, 'DOUBLE-JUMP • COINS • CHECKPOINTS', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#a7f070',
    }).setOrigin(0.5);
    const bestText = this.add.text(240, 230, 'BEST  0', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffcd75',
    }).setOrigin(0.5);
    void this.leaderboard.getTop(1).then((entries) => {
      bestText.setText(`BEST  ${entries[0]?.score ?? 0}`);
    });

    const jumpKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    jumpKey?.once('down', () => this.startRun());
  }

  update(_time: number, delta: number): void {
    this.parallax.update(delta);
  }

  private startRun(): void {
    gameAudio.play('click');
    this.scene.start('GameScene', { seed: Date.now() });
  }
}
