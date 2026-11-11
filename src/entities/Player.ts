import Phaser from 'phaser';
import { PHYSICS } from '../config/physics';
import type { InputState } from '../systems/InputController';
import { entityTexture } from './texture';
import { GAMEPLAY } from '../config/gameplay';

export class Player extends Phaser.Physics.Arcade.Sprite {
  jumpsUsed = 0;
  lastGroundedAt = 0;
  private lastJumpPressedAt = Number.NEGATIVE_INFINITY;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const texture = entityTexture(scene, 'player');
    super(scene, x, y, texture.key, texture.frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PHYSICS.playerWidth, PHYSICS.playerHeight);
    body.setMaxVelocity(0, PHYSICS.maxFallSpeed);
    body.setAllowGravity(true);
    this.setDepth(10);
  }

  updateMovement(
    time: number,
    input: InputState,
    runSpeed: number,
  ): 'jump' | 'doubleJump' | null {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(runSpeed);
    body.setMaxVelocity(0, input.fastFall ? PHYSICS.fastFallSpeed : PHYSICS.maxFallSpeed);
    if (input.fastFall && body.velocity.y > 0) {
      body.setVelocityY(Math.max(body.velocity.y, PHYSICS.fastFallSpeed));
    }

    const grounded = body.blocked.down || body.touching.down;
    if (grounded) {
      this.jumpsUsed = 0;
      this.lastGroundedAt = time;
    }
    if (input.jumpPressed) this.lastJumpPressedAt = time;
    if (input.jumpReleased && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * PHYSICS.jumpCutMultiplier);
    }

    const buffered = time - this.lastJumpPressedAt <= PHYSICS.jumpBufferMs;
    const inCoyoteTime = time - this.lastGroundedAt <= PHYSICS.coyoteTimeMs;
    const canGroundJump = this.jumpsUsed === 0 && (grounded || inCoyoteTime);
    const canDoubleJump = this.jumpsUsed === 1;
    if (!buffered || (!canGroundJump && !canDoubleJump)) return null;

    const jumpType = canGroundJump ? 'jump' : 'doubleJump';
    body.setVelocityY(jumpType === 'jump' ? PHYSICS.jumpVelocity : PHYSICS.doubleJumpVelocity);
    this.jumpsUsed += 1;
    this.lastJumpPressedAt = Number.NEGATIVE_INFINITY;
    this.setAngle(jumpType === 'doubleJump' ? -GAMEPLAY.doubleJumpTiltDegrees : 0);
    this.scene.tweens.add({
      targets: this,
      scaleX: jumpType === 'doubleJump' ? GAMEPLAY.doubleJumpSquashX : GAMEPLAY.jumpStretchX,
      scaleY: jumpType === 'doubleJump' ? GAMEPLAY.doubleJumpStretchY : GAMEPLAY.jumpStretchY,
      duration: GAMEPLAY.playerJumpTweenMs,
      yoyo: true,
    });
    return jumpType;
  }

  setInvulnerable(value: boolean): void {
    this.setAlpha(value ? 0.5 : 1);
  }
}
