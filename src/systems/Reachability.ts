import { PHYSICS } from '../config/physics';

export interface JumpPhysics {
  gravity: number;
  jumpVelocity: number;
  doubleJumpVelocity: number;
  tileSize: number;
}

export function maxReachableGapTiles(
  runSpeed: number,
  heightDeltaTiles: number,
  physics: JumpPhysics = PHYSICS,
): number {
  const gravity = physics.gravity;
  const firstApexTime = Math.abs(physics.jumpVelocity) / gravity;
  const firstApexHeight = (physics.jumpVelocity ** 2) / (2 * gravity);
  const targetY = -heightDeltaTiles * physics.tileSize;
  const remainingHeight = firstApexHeight - targetY;
  const doubleJumpTime =
    (Math.abs(physics.doubleJumpVelocity) +
      Math.sqrt(physics.doubleJumpVelocity ** 2 + 2 * gravity * remainingHeight)) /
    gravity;
  return Math.max(0, (runSpeed * (firstApexTime + doubleJumpTime)) / physics.tileSize);
}

export function canReachGap(
  gapTiles: number,
  heightDeltaTiles: number,
  runSpeed: number,
  safetyMargin = PHYSICS.reachabilitySafetyMargin,
): boolean {
  return (
    Number.isFinite(gapTiles) &&
    gapTiles >= 0 &&
    gapTiles <=
      maxReachableGapTiles(runSpeed, heightDeltaTiles, PHYSICS) *
        Math.min(safetyMargin, PHYSICS.reachabilitySafetyMargin)
  );
}
