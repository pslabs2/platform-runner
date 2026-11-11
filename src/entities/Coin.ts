import Phaser from 'phaser';
import { GAMEPLAY } from '../config/gameplay';
import { entityTexture } from './texture';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  baseY = 0;
  phase = 0;

  updateBob(time: number): void {
    this.setY(
      this.baseY + Math.sin(time / GAMEPLAY.coinBobMs + this.phase) * GAMEPLAY.coinBobPixels,
    );
    (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  constructor(scene: Phaser.Scene) {
    const texture = entityTexture(scene, 'coin');
    super(scene, -100, -100, texture.key, texture.frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
    body.setSize(12, 12);
    this.setActive(false).setVisible(false);
  }

  activate(x: number, y: number, phase: number): void {
    this.setPosition(x, y).setActive(true).setVisible(true);
    this.baseY = y;
    this.phase = phase;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
  }

  deactivate(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setActive(false).setVisible(false);
  }
}
