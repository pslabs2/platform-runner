import Phaser from 'phaser';
import { createButton } from '../ui/Button';
import { MenuNavigator } from '../ui/MenuNavigator';
import { LocalLeaderboardStore } from '../storage/LocalLeaderboardStore';
import { GAMEPLAY } from '../config/gameplay';

interface GameOverData {
  score?: number;
  zone?: number;
}

export class GameOverScene extends Phaser.Scene {
  private readonly leaderboard = new LocalLeaderboardStore();
  private score = 0;
  private zone = 1;
  private initials = '';
  private initialsText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private eligible = false;
  private menu!: MenuNavigator;

  constructor() {
    super('GameOverScene');
  }

  init(data: GameOverData = {}): void {
    this.score = data.score ?? 0;
    this.zone = data.zone ?? 1;
  }

  create(): void {
    this.add.rectangle(240, 135, 480, 270, 0x1d2b53);
    this.add.text(240, 55, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#d95763',
    }).setOrigin(0.5);
    this.add.text(240, 92, `SCORE  ${this.score}     ZONE  ${this.zone}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.statusText = this.add.text(240, 124, 'CHECKING HIGH SCORE...', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffcd75',
    }).setOrigin(0.5);
    this.initialsText = this.add.text(240, 151, '___', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5).setVisible(false);
    const save = createButton(this, 240, 190, 'SAVE SCORE', () => this.submitScore());
    const title = createButton(this, 240, 226, 'TITLE', () => this.scene.start('TitleScene'));
    // Letters are used for initials entry, so only arrows/Enter navigate while eligible.
    this.menu = new MenuNavigator(this, [save, title], {
      letterKeys: () => !this.eligible,
      confirmKeys: false,
    });

    this.input.keyboard?.on('keydown', this.handleKey, this);
    void this.leaderboard.isHighScore(this.score).then((eligible) => {
      this.eligible = eligible;
      this.statusText.setText(eligible ? 'ENTER 3 LETTERS' : 'RUN AGAIN TO REACH THE TOP 10');
      this.initialsText.setVisible(eligible);
      if (eligible) {
        this.tweens.add({
          targets: this.statusText,
          alpha: 0.35,
          duration: GAMEPLAY.highScoreFlashMs,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      this.initials = this.initials.slice(0, -1);
    } else if (/^[a-z]$/i.test(event.key) && this.initials.length < 3) {
      this.initials += event.key.toUpperCase();
    } else if (event.key === 'Enter') {
      this.menu.activateSelected();
    }
    this.initialsText.setText(this.initials.padEnd(3, '_'));
  }

  private async submitScore(): Promise<void> {
    if (!this.eligible || this.initials.length !== 3) return;
    await this.leaderboard.submit({
      initials: this.initials,
      score: this.score,
      zone: this.zone,
      date: new Date().toISOString().slice(0, 10),
    });
    this.scene.start('LeaderboardScene', { returnTo: 'TitleScene' });
  }
}
