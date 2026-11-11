import Phaser from 'phaser';
import { GAMEPLAY } from '../config/gameplay';
import { PHYSICS } from '../config/physics';
import { generateZone } from './LevelGenerator';
import { Platform, type PlatformKind } from '../entities/Platform';
import { Coin } from '../entities/Coin';
import { Hazard } from '../entities/Hazard';
import { Checkpoint } from '../entities/Checkpoint';
import type { HazardKind } from '../config/difficulty';

export interface ZoneSpawnResult {
  startX: number;
  endX: number;
  zone: number;
  checkpointX: number;
  checkpointY: number;
  endingY: number;
  hazards: HazardKind[];
}

export class ChunkSpawner {
  readonly platforms: Phaser.Physics.Arcade.Group;
  readonly coins: Phaser.Physics.Arcade.Group;
  readonly hazards: Phaser.Physics.Arcade.Group;
  readonly checkpoints: Phaser.Physics.Arcade.Group;
  private readonly platformPool: Platform[];
  private readonly coinPool: Coin[];
  private readonly hazardPool: Hazard[];
  private readonly checkpointPool: Checkpoint[];

  constructor(private readonly scene: Phaser.Scene) {
    this.platforms = scene.physics.add.group({ maxSize: GAMEPLAY.platformPoolSize });
    this.coins = scene.physics.add.group({ maxSize: GAMEPLAY.coinPoolSize });
    this.hazards = scene.physics.add.group({ maxSize: GAMEPLAY.hazardPoolSize });
    this.checkpoints = scene.physics.add.group({ maxSize: GAMEPLAY.checkpointPoolSize });
    this.platformPool = Array.from({ length: GAMEPLAY.platformPoolSize }, () => {
      const platform = new Platform(scene);
      this.platforms.add(platform);
      return platform;
    });
    this.coinPool = Array.from({ length: GAMEPLAY.coinPoolSize }, () => {
      const coin = new Coin(scene);
      this.coins.add(coin);
      return coin;
    });
    this.hazardPool = Array.from({ length: GAMEPLAY.hazardPoolSize }, () => {
      const hazard = new Hazard(scene);
      this.hazards.add(hazard);
      return hazard;
    });
    this.checkpointPool = Array.from({ length: GAMEPLAY.checkpointPoolSize }, () => {
      const checkpoint = new Checkpoint(scene);
      this.checkpoints.add(checkpoint);
      return checkpoint;
    });
  }

  spawnZone(
    seed: number,
    zone: number,
    startX: number,
    startingY: number = PHYSICS.groundY,
  ): ZoneSpawnResult {
    const chunks = generateZone(seed, zone);
    let terrainY = startingY;
    const hazards = new Set<HazardKind>();
    for (const chunk of chunks) {
      terrainY = Phaser.Math.Clamp(
        terrainY - chunk.heightDeltaTiles * PHYSICS.tileSize,
        PHYSICS.groundY - 4 * PHYSICS.tileSize,
        PHYSICS.groundY,
      );
      const chunkX = startX + chunk.index * chunk.widthTiles * PHYSICS.tileSize;
      const gap = chunk.gapTiles * PHYSICS.tileSize;
      const platformX = chunkX + gap;
      const platformWidth = (chunk.widthTiles - chunk.gapTiles) * PHYSICS.tileSize;
      if (chunk.hazard) hazards.add(chunk.hazard);
      const platformKind: PlatformKind =
        chunk.hazard === 'crumbling' ||
        chunk.hazard === 'moving-vertical' ||
        chunk.hazard === 'moving-horizontal'
          ? chunk.hazard
          : 'normal';
      this.take(this.platformPool).activate(platformX, terrainY, platformWidth, platformKind);

      for (const coinSpec of chunk.coins) {
        const coinX = platformX + Math.min(coinSpec.x, Math.max(0, platformWidth - 12));
        const coinY = terrainY + coinSpec.y - PHYSICS.groundY;
        this.take(this.coinPool).activate(coinX, coinY, coinSpec.x / PHYSICS.tileSize);
      }

      if (chunk.hazard === 'spikes' || chunk.hazard === 'walker') {
        const hazardX = platformX + Math.max(8, platformWidth / 2);
        this.take(this.hazardPool).activate(hazardX, terrainY - 10, chunk.hazard);
      }

      if (chunk.checkpoint) {
        this.take(this.checkpointPool).activate(platformX + platformWidth - 22, terrainY - 9, zone);
      }
    }

    const endX = startX + chunks.length * GAMEPLAY.zoneChunkWidthTiles * PHYSICS.tileSize;
    return {
      startX,
      endX,
      zone,
      checkpointX: endX,
      checkpointY: Math.min(terrainY, PHYSICS.groundY) - PHYSICS.playerHeight,
      endingY: terrainY,
      hazards: [...hazards],
    };
  }

  spawnSafeRunway(x: number, top: number): void {
    const width = GAMEPLAY.zoneChunkWidthTiles * PHYSICS.tileSize;
    const centerX = x + width / 2;
    const centerY = top + PHYSICS.tileSize / 2;
    if (
      this.platformPool.some(
        (platform) =>
          platform.active &&
          platform.kind === 'normal' &&
          Math.abs(platform.x - centerX) < 1 &&
          Math.abs(platform.y - centerY) < 1,
      )
    ) {
      return;
    }
    this.take(this.platformPool).activate(x, top, width);
  }

  recycleBehind(cameraX: number): void {
    const cutoff = cameraX - GAMEPLAY.recycleMargin;
    for (const platform of this.platformPool) {
      if (platform.active && platform.rightEdge < cutoff) platform.deactivate();
    }
    for (const coin of this.coinPool) {
      if (coin.active && coin.x < cutoff) coin.deactivate();
    }
    for (const hazard of this.hazardPool) {
      if (hazard.active && hazard.rightEdge < cutoff) hazard.deactivate();
    }
    for (const checkpoint of this.checkpointPool) {
      if (checkpoint.active && checkpoint.rightEdge < cutoff) checkpoint.deactivate();
    }
  }

  private take<T extends Phaser.GameObjects.GameObject & { active: boolean }>(pool: T[]): T {
    const item = pool.find((candidate) => !candidate.active);
    if (!item) throw new Error('Object pool exhausted');
    return item;
  }
}
