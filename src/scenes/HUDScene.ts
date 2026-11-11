import Phaser from 'phaser';
import { GAMEPLAY } from '../config/gameplay';
import { GameScene } from './GameScene';

export class HUDScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private zoneText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private orientationHint!: Phaser.GameObjects.Container;
  private displayedScore = 0;
  private previousCombo = 0;

  constructor() {
    super('HUDScene');
  }

  create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;
    this.add.rectangle(240, 14, 480, 28, 0x141b3a, 0.65).setScrollFactor(0);
    this.scoreText = this.add.text(10, 7, '', { ...this.style(), color: '#ffffff' });
    this.livesText = this.add.text(176, 7, '', { ...this.style(), color: '#ffcd75' });
    this.zoneText = this.add.text(285, 7, '', { ...this.style(), color: '#a7f070' });
    this.comboText = this.add.text(10, 34, '', { ...this.style(), color: '#ffcd75' });
    this.comboText.setShadow(1, 1, '#1d2b53');

    const pause = this.add.text(455, 8, 'Ⅱ', {
      ...this.style(),
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#306082',
      padding: { left: 7, right: 7, top: 2, bottom: 2 },
    }).setInteractive();
    pause.on('pointerdown', () => this.gameScene.pauseGame());

    const fastFall = this.add.rectangle(430, 236, 70, 32, 0x306082, 0.75)
      .setStrokeStyle(2, 0x8be9fd)
      .setInteractive();
    this.add.text(430, 236, 'FAST FALL', {
      ...this.style(),
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5);
    fastFall.on('pointerdown', () => this.gameScene.setTouchFastFall(true));
    fastFall.on('pointerup', () => this.gameScene.setTouchFastFall(false));
    fastFall.on('pointerout', () => this.gameScene.setTouchFastFall(false));
    this.input.on('pointerup', () => this.gameScene.setTouchFastFall(false));

    const hintBackground = this.add.rectangle(240, 135, 480, 270, 0x141b3a, 0.88);
    const hint = this.add.text(240, 135, 'ROTATE YOUR DEVICE\\nTO LANDSCAPE', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    this.orientationHint = this.add.container(0, 0, [hintBackground, hint]).setDepth(100);
    this.orientationHint.setVisible(false);
    this.updateOrientationHint();
    window.addEventListener('resize', this.updateOrientationHint);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('resize', this.updateOrientationHint);
    });
  }

  update(): void {
    const score = this.gameScene.scoreState;
    this.displayedScore += Math.max(
      0,
      Math.ceil((score.score - this.displayedScore) * GAMEPLAY.hudScoreTweenFactor),
    );
    this.scoreText.setText(`SCORE ${String(this.displayedScore).padStart(6, '0')}`);
    this.livesText.setText(`♥ ${this.gameScene.lives}/${GAMEPLAY.maxLives}`);
    this.zoneText.setText(`ZONE ${this.gameScene.zone}`);
    this.comboText.setText(score.combo > 1 ? `COIN COMBO  x${score.combo}` : '');
    if (score.combo > this.previousCombo) {
      this.tweens.add({
        targets: this.comboText,
        scale: GAMEPLAY.comboPopScale,
        duration: GAMEPLAY.comboPopMs,
        yoyo: true,
      });
    }
    this.previousCombo = score.combo;
  }

  private updateOrientationHint = (): void => {
    this.orientationHint?.setVisible(window.innerHeight > window.innerWidth);
  };

  private style(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff' };
  }
}
