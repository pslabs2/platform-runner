import Phaser from 'phaser';
import { entityTexture } from './texture';

export class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  rightEdge = 0;
  zone = 1;
  reached = false;

  constructor(scene: Phaser.Scene) {
    const texture = entityTexture(scene, 'checkpoint');
    super(scene, -100, -100, texture.key, texture.frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
    body.setSize(14, 18);
    this.setActive(false).setVisible(false);
  }

  activate(x: number, y: number, zone: number): void {
    this.zone = zone;
    this.reached = false;
    this.rightEdge = x + 12;
    this.setPosition(x, y).setActive(true).setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
  }

  deactivate(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setActive(false).setVisible(false);
  }
}
