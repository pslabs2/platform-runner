import Phaser from 'phaser';
import { entityTexture } from './texture';
import { GAMEPLAY } from '../config/gameplay';
import { PHYSICS } from '../config/physics';

export type PlatformKind = 'normal' | 'crumbling' | 'moving-vertical' | 'moving-horizontal';

export class Platform extends Phaser.Physics.Arcade.Sprite {
  rightEdge = 0;
  kind: PlatformKind = 'normal';
  private platformOriginX = 0;
  private platformOriginY = 0;
  private platformWidth = 0;
  private crumbleStarted = false;
  private generation = 0;

  constructor(scene: Phaser.Scene) {
    const texture = entityTexture(scene, 'platform');
    super(scene, -100, -100, texture.key, texture.frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
    this.setActive(false).setVisible(false);
  }

  activate(x: number, top: number, width: number, kind: PlatformKind = 'normal'): void {
    this.scene.tweens.killTweensOf(this);
    this.generation += 1;
    this.kind = kind;
    this.platformOriginX = x + width / 2;
    this.platformOriginY = top + 9;
    this.platformWidth = width;
    this.crumbleStarted = false;
    this.setPosition(x + width / 2, top + 9).setDisplaySize(width, 18).setAlpha(1);
    if (kind === 'crumbling') this.setTint(0xd95763);
    else this.clearTint();
    this.setActive(true).setVisible(true);
    this.rightEdge = x + width;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PHYSICS.tileSize, PHYSICS.tileSize);
    body.updateFromGameObject();
    body.enable = true;
    body.setVelocity(0, 0);
  }

  updateMotion(time: number): void {
    if (this.kind !== 'moving-vertical' && this.kind !== 'moving-horizontal') return;
    if (this.kind === 'moving-vertical') {
      this.setY(
        this.platformOriginY +
          Math.sin(time / GAMEPLAY.movingPlatformCycleMs) * GAMEPLAY.movingPlatformAmplitude,
      );
    } else if (this.kind === 'moving-horizontal') {
      this.setX(
        this.platformOriginX +
          Math.sin(time / GAMEPLAY.movingPlatformCycleMs) * GAMEPLAY.movingPlatformAmplitude,
      );
    }
    this.rightEdge = this.x + this.platformWidth / 2;
    (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  startCrumble(): void {
    if (this.kind !== 'crumbling' || this.crumbleStarted) return;
    this.crumbleStarted = true;
    const generation = this.generation;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: GAMEPLAY.crumbleDelayMs,
    });
    this.scene.time.delayedCall(GAMEPLAY.crumbleDelayMs, () => {
      if (this.generation === generation) this.deactivate();
    });
  }

  deactivate(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setActive(false).setVisible(false);
  }
}
