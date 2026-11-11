import Phaser from 'phaser';
import { GAMEPLAY } from '../config/gameplay';

export interface InputState {
  jumpPressed: boolean;
  jumpReleased: boolean;
  jumpHeld: boolean;
  fastFall: boolean;
  pausePressed: boolean;
  mutePressed: boolean;
}

export class InputController {
  private readonly jumpKeys: Phaser.Input.Keyboard.Key[] = [];
  private readonly fastFallKeys: Phaser.Input.Keyboard.Key[] = [];
  private readonly pauseKeys: Phaser.Input.Keyboard.Key[] = [];
  private readonly muteKey: Phaser.Input.Keyboard.Key | undefined;
  private touchJumpHeld = false;
  private touchFastFall = false;
  private previousJumpHeld = false;

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (keyboard) {
      this.jumpKeys.push(
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      );
      this.fastFallKeys.push(
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      );
      this.pauseKeys.push(
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
      );
      this.muteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    }

    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointerup', this.onPointerUp, this);
    scene.input.on('gameout', this.onPointerUp, this);
  }

  update(): InputState {
    const jumpHeld = this.touchJumpHeld || this.jumpKeys.some((key) => key.isDown);
    const state = {
      jumpPressed: jumpHeld && !this.previousJumpHeld,
      jumpReleased: !jumpHeld && this.previousJumpHeld,
      jumpHeld,
      fastFall: this.touchFastFall || this.fastFallKeys.some((key) => key.isDown),
      pausePressed: this.pauseKeys.some((key) => Phaser.Input.Keyboard.JustDown(key)),
      mutePressed: this.muteKey ? Phaser.Input.Keyboard.JustDown(this.muteKey) : false,
    };
    this.previousJumpHeld = jumpHeld;
    return state;
  }

  setTouchFastFall(active: boolean): void {
    this.touchFastFall = active;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.scene.input.off('gameout', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.touchFastFall =
      pointer.x > GAMEPLAY.touchJumpMaxX && pointer.y > GAMEPLAY.touchFastFallMinY;
    this.touchJumpHeld = !this.touchFastFall && pointer.x < GAMEPLAY.touchJumpMaxX;
  }

  private onPointerUp(): void {
    this.touchJumpHeld = false;
    this.touchFastFall = false;
  }
}
