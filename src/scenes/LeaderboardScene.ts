import Phaser from 'phaser';
import { createButton } from '../ui/Button';
import { LocalLeaderboardStore } from '../storage/LocalLeaderboardStore';

interface LeaderboardData {
  returnTo?: string;
}

export class LeaderboardScene extends Phaser.Scene {
  private readonly leaderboard = new LocalLeaderboardStore();
  private returnTo = 'TitleScene';

  constructor() {
    super('LeaderboardScene');
  }

  init(data: LeaderboardData = {}): void {
    this.returnTo = data.returnTo ?? 'TitleScene';
  }

  create(): void {
    this.add.rectangle(240, 135, 480, 270, 0x141b3a, 0.95);
    this.add.text(240, 28, 'LEADERBOARD  —  TOP 10', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#ffcd75',
    }).setOrigin(0.5);
    void this.leaderboard.getTop(10).then((entries) => {
      entries.forEach((entry, index) => {
        this.add.text(94, 58 + index * 14, `${String(index + 1).padStart(2, '0')}.  ${entry.initials}`, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ffffff',
        });
        this.add.text(260, 58 + index * 14, `${entry.score}`, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#a7f070',
        });
        this.add.text(360, 58 + index * 14, `ZONE ${entry.zone}`, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#8be9fd',
        });
      });
    });
    createButton(this, 240, 238, 'BACK', () => this.scene.stop());
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).once('down', () => {
      this.scene.stop();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.returnTo === 'TitleScene' && !this.scene.isActive('TitleScene')) {
        this.scene.start('TitleScene');
      }
    });
  }
}
