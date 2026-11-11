import Phaser from 'phaser';
import { getDifficulty } from '../config/difficulty';
import { GAMEPLAY } from '../config/gameplay';
import { PHYSICS } from '../config/physics';
import { addCheckpointBonus, addDistance, collectCoin, createScoreState, resetCombo } from '../systems/ScoreSystem';
import { ChunkSpawner, type ZoneSpawnResult } from '../systems/ChunkSpawner';
import { Effects } from '../systems/Effects';
import { InputController } from '../systems/InputController';
import { Parallax } from '../systems/Parallax';
import { gameAudio } from '../systems/Audio';
import { Player } from '../entities/Player';
import { Coin } from '../entities/Coin';
import { Hazard } from '../entities/Hazard';
import { Checkpoint } from '../entities/Checkpoint';
import { Platform } from '../entities/Platform';
import type { HazardKind } from '../config/difficulty';
import { SCREEN_HEIGHT } from '../config/screen';

interface GameSceneData {
  seed?: number;
}

type ZoneRange = ZoneSpawnResult;

export class GameScene extends Phaser.Scene {
  scoreState = createScoreState();
  lives: number = GAMEPLAY.startingLives;
  zone = 1;
  private runSeed = 0;
  private player!: Player;
  private spawner!: ChunkSpawner;
  private inputController!: InputController;
  private effects!: Effects;
  private parallax!: Parallax;
  private zoneRanges: ZoneRange[] = [];
  private seenHazards = new Set<HazardKind>();
  private nextZone = 1;
  private worldEndX = 0;
  private lastTerrainY: number = PHYSICS.groundY;
  private checkpointX = PHYSICS.tileSize * 2;
  private checkpointY = PHYSICS.groundY - PHYSICS.playerHeight / 2;
  private checkpointZone = 0;
  private invulnerableUntil = 0;
  private wasGrounded = false;
  private lastDustAt = Number.NEGATIVE_INFINITY;
  private initialX = 0;
  private readonly onBlur = (): void => this.pauseGame();
  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.pauseGame();
  };

  constructor() {
    super('GameScene');
  }

  init(data: GameSceneData = {}): void {
    this.runSeed = data.seed ?? Date.now();
  }

  create(): void {
    this.scoreState = createScoreState();
    this.lives = GAMEPLAY.startingLives;
    this.zone = 1;
    this.zoneRanges = [];
    this.seenHazards = new Set();
    this.nextZone = 1;
    this.lastTerrainY = PHYSICS.groundY;
    this.checkpointX = PHYSICS.tileSize * 2;
    this.checkpointY = PHYSICS.groundY - PHYSICS.playerHeight / 2;
    this.checkpointZone = 0;
    this.invulnerableUntil = 0;
    this.wasGrounded = false;
    this.lastDustAt = Number.NEGATIVE_INFINITY;

    this.parallax = new Parallax(this);
    this.effects = new Effects(this);
    this.spawner = new ChunkSpawner(this);
    const firstZone = this.spawnZone(1, 0, PHYSICS.groundY);
    this.player = new Player(this, PHYSICS.tileSize * 4, PHYSICS.groundY - PHYSICS.playerHeight / 2);
    this.initialX = this.player.x;
    this.physics.add.collider(this.player, this.spawner.platforms, (_player, object) => {
      if (object instanceof Platform) object.startCrumble();
    });
    this.physics.add.overlap(this.player, this.spawner.coins, (_player, object) => {
      if (object instanceof Coin) this.collectCoin(object);
    });
    this.physics.add.overlap(this.player, this.spawner.hazards, () => this.takeHit());
    this.physics.add.overlap(this.player, this.spawner.checkpoints, (_player, object) => {
      if (object instanceof Checkpoint) this.reachCheckpoint(object);
    });
    this.inputController = new InputController(this);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setBounds(0, 0, firstZone.endX + GAMEPLAY.streamAhead, SCREEN_HEIGHT);
    this.scene.launch('HUDScene');

    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
  }

  update(time: number, delta: number): void {
    const input = this.inputController.update();
    if (input.pausePressed) {
      this.pauseGame();
      return;
    }
    if (input.mutePressed) gameAudio.toggleMute();

    const difficulty = getDifficulty(this.zone);
    const jump = this.player.updateMovement(time, input, difficulty.runSpeed);
    if (jump) {
      gameAudio.play(jump === 'jump' ? 'jump' : 'doubleJump');
      this.effects.burst(this.player.x, this.player.y + 8, jump === 'jump' ? 4 : 8);
    }

    for (const object of this.spawner.coins.getChildren()) {
      if (object instanceof Coin && object.active) object.updateBob(time);
    }
    for (const object of this.spawner.hazards.getChildren()) {
      if (object instanceof Hazard && object.active) object.updateMotion(time);
    }
    for (const object of this.spawner.platforms.getChildren()) {
      if (object instanceof Platform && object.active) object.updateMotion(time);
    }
    this.parallax.update(delta);
    this.updateLanding();
    this.updateRunDust(time);
    addDistance(this.scoreState, this.player.x - this.initialX, PHYSICS.tileSize);
    this.updateZone();
    if (this.player.x > this.worldEndX - GAMEPLAY.streamAhead) this.appendZone();
    this.spawner.recycleBehind(this.cameras.main.scrollX);

    if (this.player.y > GAMEPLAY.fallDeathY) this.takeHit();
  }

  pauseGame(): void {
    if (!this.scene.isActive('PauseScene')) {
      this.scene.launch('PauseScene');
      this.scene.pause();
      this.scene.pause('HUDScene');
    }
  }

  setTouchFastFall(active: boolean): void {
    this.inputController?.setTouchFastFall(active);
  }

  private spawnZone(zone: number, startX: number, startingY: number): ZoneSpawnResult {
    const result = this.spawner.spawnZone(this.runSeed, zone, startX, startingY);
    this.zoneRanges.push(result);
    this.worldEndX = result.endX;
    this.lastTerrainY = result.endingY;
    this.nextZone = zone + 1;
    return result;
  }

  private appendZone(): void {
    const result = this.spawner.spawnZone(this.runSeed, this.nextZone, this.worldEndX, this.lastTerrainY);
    this.zoneRanges.push(result);
    this.worldEndX = result.endX;
    this.lastTerrainY = result.endingY;
    this.nextZone += 1;
    this.cameras.main.setBounds(0, 0, this.worldEndX + GAMEPLAY.streamAhead, SCREEN_HEIGHT);
    const oldestNeededZone = Math.min(this.zone - 1, this.checkpointZone + 1);
    this.zoneRanges = this.zoneRanges.filter((range) => range.zone >= oldestNeededZone);
    for (const hazard of result.hazards) {
      if (!this.seenHazards.has(hazard)) {
        this.seenHazards.add(hazard);
        this.showBanner(`NEW HAZARD: ${hazard.replace('-', ' ').toUpperCase()}!`);
      }
    }
  }

  private updateZone(): void {
    const range = this.zoneRanges.find(
      (candidate) => this.player.x >= candidate.startX && this.player.x < candidate.endX,
    );
    if (range && range.zone !== this.zone) {
      this.zone = range.zone;
      this.parallax.setZone(this.zone);
    }
  }

  private updateLanding(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down;
    if (grounded && !this.wasGrounded) {
      resetCombo(this.scoreState);
      this.effects.burst(this.player.x, this.player.y + PHYSICS.playerHeight / 2, 3);
      this.effects.squash(this.player, GAMEPLAY.landSquashY);
      this.player.setAngle(0);
    }
    this.wasGrounded = grounded;
  }

  private updateRunDust(time: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (
      (body.blocked.down || body.touching.down) &&
      time - this.lastDustAt >= GAMEPLAY.runDustIntervalMs
    ) {
      this.effects.burst(
        this.player.x - PHYSICS.playerWidth / 2,
        this.player.y + PHYSICS.playerHeight / 2,
        GAMEPLAY.runDustParticleCount,
      );
      this.lastDustAt = time;
    }
  }

  private collectCoin(coin: Coin): void {
    coin.deactivate();
    collectCoin(this.scoreState);
    gameAudio.play('coin');
    this.effects.burst(coin.x, coin.y, 5);
  }

  private reachCheckpoint(checkpoint: Checkpoint): void {
    if (checkpoint.reached) return;
    checkpoint.reached = true;
    const zone = this.zoneRanges.find((range) => range.zone === checkpoint.zone);
    if (!zone) return;
    this.checkpointX = zone.endX + PHYSICS.tileSize * 2;
    this.checkpointY = zone.endingY - PHYSICS.playerHeight / 2;
    this.checkpointZone = checkpoint.zone;
    this.lives = Math.min(this.lives + GAMEPLAY.checkpointLife, GAMEPLAY.maxLives);
    addCheckpointBonus(this.scoreState, checkpoint.zone);
    gameAudio.play('checkpoint');
    this.effects.burst(checkpoint.x, checkpoint.y, 16);
    this.showBanner(`ZONE ${checkpoint.zone} CHECKPOINT!`);
  }

  private takeHit(): void {
    if (this.time.now < this.invulnerableUntil) return;
    gameAudio.play('hurt');
    this.effects.hit();
    resetCombo(this.scoreState);
    this.lives -= 1;
    if (this.lives <= 0) {
      this.endRun();
      return;
    }

    this.invulnerableUntil = this.time.now + PHYSICS.respawnInvulnerabilityMs;
    this.zone = Math.max(1, this.checkpointZone + 1);
    this.parallax.setZone(this.zone);
    this.player.setPosition(this.checkpointX, this.checkpointY);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.reset(this.checkpointX, this.checkpointY);
    body.setVelocity(0, 0);
    this.player.setInvulnerable(true);
    this.spawner.spawnSafeRunway(
      this.checkpointX - PHYSICS.tileSize * 2,
      this.checkpointY + PHYSICS.playerHeight / 2,
    );
    this.time.delayedCall(GAMEPLAY.hitStopMs, () => this.physics.world.resume());
    this.physics.world.pause();
    this.time.delayedCall(PHYSICS.respawnInvulnerabilityMs, () => {
      if (this.player.active) this.player.setInvulnerable(false);
    });
  }

  private endRun(): void {
    gameAudio.play('gameOver');
    this.scene.stop('HUDScene');
    this.scene.start('GameOverScene', { score: this.scoreState.score, zone: this.zone });
  }

  private showBanner(message: string): void {
    const banner = this.add.text(240, 90, message, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffcd75',
      backgroundColor: '#1d2b53',
      padding: { left: 8, right: 8, top: 5, bottom: 5 },
    }).setOrigin(0.5).setScrollFactor(0);
    this.tweens.add({
      targets: banner,
      alpha: 0,
      delay: 900,
      duration: 300,
      onComplete: () => banner.destroy(),
    });
  }

  private onShutdown(): void {
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.inputController?.destroy();
  }
}
