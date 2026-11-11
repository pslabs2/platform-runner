import Phaser from 'phaser';
import { GAMEPLAY } from '../config/gameplay';
import type { HazardKind } from '../config/difficulty';
import { entityTexture } from './texture';

export class Hazard extends Phaser.Physics.Arcade.Sprite {
  kind: HazardKind = 'spikes';
  originX = 0;
  originY = 0;
  phase = 0;
  rightEdge = 0;

  constructor(scene: Phaser.Scene) {
    const texture = entityTexture(scene, 'hazard');
    super(scene, -100, -100, texture.key, texture.frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
    body.setSize(16, 16);
    this.setActive(false).setVisible(false);
  }

  activate(x: number, y: number, kind: HazardKind): void {
    this.kind = kind;
    this.originX = x;
    this.originY = y;
    this.phase = 0;
    this.rightEdge = x + 24;
    const texture = entityTexture(this.scene, this.kind === 'walker' ? 'walker' : 'hazard');
    this.setTexture(texture.key, texture.frame);
    this.setPosition(x, y).setActive(true).setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
  }

  updateMotion(time: number): void {
    if (this.kind === 'moving-vertical') {
      this.setY(
        this.originY +
          Math.sin(time / GAMEPLAY.hazardWaveMs + this.phase) * GAMEPLAY.hazardVerticalAmplitude,
      );
    } else if (this.kind === 'moving-horizontal') {
      this.setX(
        this.originX +
          Math.sin(time / (GAMEPLAY.hazardWaveMs * GAMEPLAY.movingPlatformHorizontalPeriod) + this.phase) *
            GAMEPLAY.hazardHorizontalAmplitude,
      );
    } else if (this.kind === 'walker') {
      this.setX(
        this.originX +
          Math.sin(time / (GAMEPLAY.hazardWaveMs * GAMEPLAY.walkerPeriod) + this.phase) *
            GAMEPLAY.hazardHorizontalAmplitude,
      );
    }
    (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  deactivate(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setActive(false).setVisible(false);
  }
}
