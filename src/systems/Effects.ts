import Phaser from 'phaser';
import { GAMEPLAY } from '../config/gameplay';

export class Effects {
  private readonly emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(private readonly scene: Phaser.Scene) {
    this.emitter = scene.add.particles(0, 0, 'runner-particle', {
      speed: { min: GAMEPLAY.particleSpeedMin, max: GAMEPLAY.particleSpeedMax },
      lifespan: GAMEPLAY.particleLifespanMs,
      quantity: GAMEPLAY.particleCount,
      scale: { start: 1, end: 0 },
      emitting: false,
      maxParticles: GAMEPLAY.particlePoolSize,
    });
    this.emitter.setDepth(20);
  }

  burst(x: number, y: number, count = 5): void {
    this.emitter.emitParticleAt(x, y, count);
  }

  hit(): void {
    this.scene.cameras.main.shake(GAMEPLAY.cameraShakeMs, GAMEPLAY.cameraShakeIntensity);
  }

  squash(target: Phaser.GameObjects.Sprite, scaleY: number): void {
    this.scene.tweens.add({
      targets: target,
      scaleY,
      duration: GAMEPLAY.landTweenMs,
      yoyo: true,
      ease: 'Quad.Out',
    });
  }
}
